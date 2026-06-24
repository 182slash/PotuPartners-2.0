from fastapi import APIRouter, HTTPException, Depends, Header
import httpx
import structlog

from app.config import get_settings, Settings
from app.models.schemas import IngestRequest, IngestResponse
from app.services.document_processor import extract_text
from app.services.chunker import chunk_text
from app.services.embedder import embed_texts
from app.services.vector_store import upsert_chunks, delete_document_chunks

logger = structlog.get_logger(__name__)
router = APIRouter(prefix="/ingest", tags=["ingestion"])


def require_service_auth(
    x_service_secret: str = Header(..., alias="X-Service-Secret"),
    settings: Settings = Depends(get_settings),
) -> None:
    if x_service_secret != settings.rag_service_secret:
        raise HTTPException(status_code=403, detail="Invalid service secret")


@router.post("", response_model=IngestResponse)
async def ingest_document(
    request: IngestRequest,
    _auth: None = Depends(require_service_auth),
    settings: Settings = Depends(get_settings),
) -> IngestResponse:
    """
    Full RAG ingestion pipeline:
    1. Download document from DO Spaces
    2. Extract text (PDF/DOCX/TXT)
    3. Chunk text into overlapping segments
    4. Generate embeddings (OpenAI)
    5. Upsert into ChromaDB
    6. Notify backend of completion
    """
    log = logger.bind(doc_id=request.doc_id, storage_key=request.storage_key)
    log.info("Starting document ingestion")

    try:
        # Detect mime type from extension for downstream processing
        mime_type = _infer_mime(request.storage_key)

        # Step 1 + 2: Download and extract text
        log.info("Extracting text")
        text = extract_text(request.storage_key, mime_type)

        if not text.strip():
            raise HTTPException(
                status_code=422,
                detail="Document appears to be empty or could not be parsed"
            )

        # Step 3: Chunk
        log.info("Chunking text", char_count=len(text))
        chunks = chunk_text(text, request.doc_id, request.title)

        if not chunks:
            raise HTTPException(status_code=422, detail="Document produced no chunks")

        # Step 4: Embed
        log.info("Generating embeddings", chunk_count=len(chunks))
        chunk_texts = [c.text for c in chunks]
        embeddings  = embed_texts(chunk_texts)

        # Step 5: Store in ChromaDB
        log.info("Storing in vector database")
        upsert_chunks(chunks, embeddings)

        # Step 6: Notify backend
        await _notify_backend_indexed(
            settings, request.doc_id, len(chunks)
        )

        log.info("Ingestion complete", chunk_count=len(chunks))
        return IngestResponse(
            doc_id=request.doc_id,
            chunk_count=len(chunks),
            message="Document ingested and indexed successfully",
        )

    except HTTPException:
        raise
    except Exception as e:
        log.error("Ingestion failed", error=str(e), exc_info=True)
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")


@router.delete("/{doc_id}")
async def delete_document(
    doc_id: str,
    _auth: None = Depends(require_service_auth),
) -> dict:
    """Remove all chunks for a document from the vector store."""
    count = delete_document_chunks(doc_id)
    logger.info("Document removed from vector store", doc_id=doc_id, chunks_removed=count)
    return {"deleted": True, "chunks_removed": count}


# ─── Helpers ──────────────────────────────────────────────────────────────────
def _infer_mime(storage_key: str) -> str:
    ext = storage_key.lower().rsplit(".", 1)[-1]
    mime_map = {
        "pdf":  "application/pdf",
        "doc":  "application/msword",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "txt":  "text/plain",
    }
    return mime_map.get(ext, "application/octet-stream")


async def _notify_backend_indexed(
    settings: Settings,
    doc_id: str,
    chunk_count: int,
) -> None:
    """Notify the Node.js backend that a document has been indexed."""
    if not settings.backend_url:
        return
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            await client.post(
                f"{settings.backend_url}/api/admin/rag-documents/{doc_id}/indexed",
                json={"chunkCount": chunk_count},
                headers={"X-Service-Secret": settings.backend_service_secret},
            )
    except Exception as e:
        logger.warning("Failed to notify backend of indexing", doc_id=doc_id, error=str(e))
