import time
import structlog
from openai import OpenAI
from app.config import get_settings

logger = structlog.get_logger(__name__)
settings = get_settings()

_client: OpenAI | None = None


def get_openai_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(api_key=settings.openai_api_key)
    return _client


def embed_texts(
    texts: list[str],
    batch_size: int = 100,
    max_retries: int = 3,
) -> list[list[float]]:
    """
    Generate embeddings for a list of texts using OpenAI's embedding API.
    Processes in batches to respect API limits.
    Returns list of embedding vectors in same order as input.
    """
    client = get_openai_client()
    all_embeddings: list[list[float]] = []

    for batch_start in range(0, len(texts), batch_size):
        batch = texts[batch_start : batch_start + batch_size]
        batch_num = batch_start // batch_size + 1
        total_batches = (len(texts) + batch_size - 1) // batch_size

        logger.debug("Embedding batch", batch=batch_num, total=total_batches)

        for attempt in range(max_retries):
            try:
                response = client.embeddings.create(
                    model=settings.embedding_model,
                    input=batch,
                    encoding_format="float",
                )

                batch_embeddings = [item.embedding for item in response.data]
                all_embeddings.extend(batch_embeddings)
                break

            except Exception as e:
                if attempt == max_retries - 1:
                    logger.error(
                        "Embedding failed after retries",
                        error=str(e),
                        batch=batch_num,
                    )
                    raise

                wait = 2 ** attempt  # Exponential backoff
                logger.warning(
                    "Embedding attempt failed, retrying",
                    attempt=attempt + 1,
                    wait_seconds=wait,
                    error=str(e),
                )
                time.sleep(wait)

    logger.info(
        "Embeddings complete",
        total_texts=len(texts),
        embedding_dim=len(all_embeddings[0]) if all_embeddings else 0,
    )
    return all_embeddings


def embed_query(question: str) -> list[float]:
    """Embed a single query string for similarity search."""
    result = embed_texts([question])
    return result[0]
