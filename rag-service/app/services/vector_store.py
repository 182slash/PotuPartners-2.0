import chromadb
from chromadb.config import Settings as ChromaSettings
import structlog
from app.config import get_settings
from app.services.chunker import Chunk

logger = structlog.get_logger(__name__)
settings = get_settings()

_client: chromadb.PersistentClient | None = None
_collection: chromadb.Collection | None = None


def _get_collection() -> chromadb.Collection:
    global _client, _collection

    if _client is None:
        _client = chromadb.PersistentClient(
            path=settings.chroma_persist_path,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
        logger.info("ChromaDB client initialized", path=settings.chroma_persist_path)

    if _collection is None:
        _collection = _client.get_or_create_collection(
            name=settings.chroma_collection_name,
            metadata={"hnsw:space": "cosine"},  # Cosine similarity
        )
        logger.info(
            "ChromaDB collection ready",
            name=settings.chroma_collection_name,
            count=_collection.count(),
        )

    return _collection


def upsert_chunks(chunks: list[Chunk], embeddings: list[list[float]]) -> None:
    """
    Upsert document chunks with their embeddings into ChromaDB.
    Uses doc_id + chunk_index as the unique ID for idempotent ingestion.
    """
    collection = _get_collection()

    ids        = [f"{c.doc_id}_{c.chunk_index}" for c in chunks]
    documents  = [c.text for c in chunks]
    metadatas  = [
        {
            "doc_id":      c.doc_id,
            "doc_title":   c.doc_title,
            "chunk_index": c.chunk_index,
            "char_start":  c.char_start,
            "char_end":    c.char_end,
        }
        for c in chunks
    ]

    collection.upsert(
        ids=ids,
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas,
    )

    logger.info("Chunks upserted to ChromaDB", count=len(chunks))


def similarity_search(
    query_embedding: list[float],
    n_results: int | None = None,
) -> list[dict]:
    """
    Perform cosine similarity search and return top-N chunks with metadata.
    Returns list of {text, doc_title, chunk_index, score} dicts.
    """
    collection = _get_collection()
    n = n_results or settings.max_retrieved_chunks

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(n, collection.count() or 1),
        include=["documents", "metadatas", "distances"],
    )

    chunks = []
    documents  = results.get("documents")  or [[]]
    metadatas  = results.get("metadatas")  or [[]]
    distances  = results.get("distances")  or [[]]

    for doc, meta, dist in zip(documents[0], metadatas[0], distances[0]):
        # Convert cosine distance to similarity score (0-1, higher = more similar)
        score = 1.0 - float(dist)
        chunks.append({
            "text":        doc,
            "doc_title":   meta.get("doc_title", "Unknown"),
            "chunk_index": meta.get("chunk_index", 0),
            "score":       round(score, 4),
        })

    logger.debug("Similarity search complete", results=len(chunks))
    return chunks


def delete_document_chunks(doc_id: str) -> int:
    """Delete all chunks belonging to a document. Returns count deleted."""
    collection = _get_collection()

    # Find all chunk IDs for this doc
    results = collection.get(
        where={"doc_id": {"$eq": doc_id}},
        include=[],  # Just IDs
    )

    ids = results.get("ids", [])
    if ids:
        collection.delete(ids=ids)
        logger.info("Document chunks deleted from ChromaDB", doc_id=doc_id, count=len(ids))

    return len(ids)


def collection_count() -> int:
    """Return total number of chunks in the collection."""
    return _get_collection().count()
