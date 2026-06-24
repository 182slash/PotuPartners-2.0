from fastapi import APIRouter, HTTPException, Depends, Header
import structlog

from app.config import get_settings, Settings
from app.models.schemas import QueryRequest, QueryResponse, SourceChunk
from app.services.embedder import embed_query
from app.services.vector_store import similarity_search, collection_count
from app.services.llm import generate_response

logger = structlog.get_logger(__name__)
router = APIRouter(prefix="/query", tags=["query"])

# Minimum similarity score to include a chunk in the context
MIN_SCORE_THRESHOLD = 0.30


def require_service_auth(
    x_service_secret: str = Header(..., alias="X-Service-Secret"),
    settings: Settings = Depends(get_settings),
) -> None:
    if x_service_secret != settings.rag_service_secret:
        raise HTTPException(status_code=403, detail="Invalid service secret")


@router.post("", response_model=QueryResponse)
async def query_knowledge_base(
    request: QueryRequest,
    _auth: None = Depends(require_service_auth),
    settings: Settings = Depends(get_settings),
) -> QueryResponse:
    """
    RAG query pipeline:
    1. Embed the user's question
    2. Retrieve top-N similar chunks from ChromaDB
    3. Filter by minimum relevance score
    4. Send context + question to GPT-4o
    5. Return answer + source citations
    """
    log = logger.bind(question_length=len(request.question))
    log.info("Processing query")

    try:
        # Check if we have any documents indexed
        total_chunks = collection_count()
        log.debug("Vector store status", total_chunks=total_chunks)

        if total_chunks == 0:
            # No documents indexed yet — respond gracefully
            return QueryResponse(
                answer=(
                    "Our knowledge base is currently being set up. "
                    "Please contact one of our associates directly for assistance — "
                    "we'd be happy to help you."
                ),
                sources=[],
            )

        # Step 1: Embed the query
        log.info("Embedding query")
        query_embedding = embed_query(request.question)

        # Step 2: Retrieve similar chunks
        log.info("Searching vector store")
        raw_chunks = similarity_search(
            query_embedding,
            n_results=settings.max_retrieved_chunks,
        )

        # Step 3: Filter low-relevance chunks
        relevant_chunks = [c for c in raw_chunks if c["score"] >= MIN_SCORE_THRESHOLD]
        log.info(
            "Chunks retrieved",
            total=len(raw_chunks),
            above_threshold=len(relevant_chunks),
        )

        # Step 4: Generate LLM response
        history = [{"role": m.role, "content": m.content} for m in request.history]
        answer  = generate_response(request.question, relevant_chunks, history)

        # Step 5: Build source citations
        sources = [
            SourceChunk(
                doc_title=   chunk["doc_title"],
                chunk_index= chunk["chunk_index"],
                score=       chunk["score"],
            )
            for chunk in relevant_chunks
        ]

        log.info("Query completed", sources=len(sources))
        return QueryResponse(answer=answer, sources=sources)

    except Exception as e:
        log.error("Query failed", error=str(e), exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Query processing failed. Please try again."
        )
