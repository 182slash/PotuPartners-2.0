from pydantic import BaseModel, Field
from typing import Optional


class IngestRequest(BaseModel):
    doc_id: str = Field(..., description="UUID of the rag_document record in PostgreSQL")
    storage_key: str = Field(..., description="DO Spaces object key")
    title: str = Field(..., description="Document title for metadata")


class IngestResponse(BaseModel):
    doc_id: str
    chunk_count: int
    message: str


class HistoryItem(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class QueryRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=4000)
    history: list[HistoryItem] = Field(default_factory=list, max_length=12)


class SourceChunk(BaseModel):
    doc_title: str
    chunk_index: int
    score: float


class QueryResponse(BaseModel):
    answer: str
    sources: list[SourceChunk]


class HealthResponse(BaseModel):
    status: str
    collection_count: Optional[int] = None
