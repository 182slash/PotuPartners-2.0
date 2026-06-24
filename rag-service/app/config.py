from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # Service auth
    rag_service_secret: str

    # OpenAI
    openai_api_key: str
    llm_model: str = "gpt-4o"
    embedding_model: str = "text-embedding-3-small"

    # LLM settings
    max_retrieved_chunks: int = 5
    temperature: float = 0.1
    max_tokens: int = 1000

    # ChromaDB
    chroma_persist_path: str = "./chroma_db"
    chroma_collection_name: str = "potupartners_docs"

    # DigitalOcean Spaces
    do_spaces_key: str
    do_spaces_secret: str
    do_spaces_endpoint: str
    do_spaces_bucket: str

    # Backend callback URL (to mark doc as indexed)
    backend_url: str = "http://localhost:4000"
    backend_service_secret: str = ""

    # Chunking
    chunk_size: int = 800
    chunk_overlap: int = 120

    # Server
    log_level: str = "INFO"


@lru_cache
def get_settings() -> Settings:
    return Settings()
