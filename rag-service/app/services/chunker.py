from dataclasses import dataclass
from langchain.text_splitter import RecursiveCharacterTextSplitter
import tiktoken
import structlog
from app.config import get_settings

logger = structlog.get_logger(__name__)
settings = get_settings()


@dataclass
class Chunk:
    text: str
    chunk_index: int
    doc_id: str
    doc_title: str
    char_start: int
    char_end: int


def count_tokens(text: str, model: str = "gpt-4o") -> int:
    """Count tokens using tiktoken."""
    try:
        enc = tiktoken.encoding_for_model(model)
        return len(enc.encode(text))
    except Exception:
        # Fallback: rough estimate
        return len(text) // 4


def chunk_text(text: str, doc_id: str, doc_title: str) -> list[Chunk]:
    """
    Split document text into overlapping chunks.
    Uses RecursiveCharacterTextSplitter which respects sentence and paragraph
    boundaries before falling back to character splits.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.chunk_size,
        chunk_overlap=settings.chunk_overlap,
        length_function=count_tokens,
        separators=[
            "\n\n\n",  # Section breaks
            "\n\n",    # Paragraph breaks
            "\n",      # Line breaks
            ". ",      # Sentence endings
            "! ",
            "? ",
            " ",       # Word boundaries
            "",        # Character level (last resort)
        ],
        is_separator_regex=False,
        keep_separator=True,
        add_start_index=True,
    )

    raw_chunks = splitter.create_documents(
        texts=[text],
        metadatas=[{"doc_id": doc_id, "doc_title": doc_title}],
    )

    chunks = []
    for i, raw in enumerate(raw_chunks):
        chunk_text_str = raw.page_content.strip()
        if not chunk_text_str:
            continue

        start = raw.metadata.get("start_index", 0)
        chunks.append(
            Chunk(
                text=chunk_text_str,
                chunk_index=i,
                doc_id=doc_id,
                doc_title=doc_title,
                char_start=start,
                char_end=start + len(chunk_text_str),
            )
        )

    logger.info(
        "Text chunked",
        doc_id=doc_id,
        total_chars=len(text),
        chunk_count=len(chunks),
        avg_chunk_tokens=sum(count_tokens(c.text) for c in chunks) // max(len(chunks), 1),
    )

    return chunks
