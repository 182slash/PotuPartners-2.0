import logging
import structlog
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.config import get_settings
from app.routes import ingest, query
from app.models.schemas import HealthResponse
from app.services.vector_store import collection_count

# ─── Structured logging setup ─────────────────────────────────────────────────
settings = get_settings()

structlog.configure(
    wrapper_class=structlog.make_filtering_bound_logger(
        getattr(logging, settings.log_level.upper(), logging.INFO)
    ),
)

logger = structlog.get_logger(__name__)


# ─── Lifespan (startup / shutdown) ────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("RAG service starting up", llm_model=settings.llm_model)
    try:
        count = collection_count()
        logger.info("ChromaDB ready", chunk_count=count)
    except Exception as e:
        logger.warning("ChromaDB not yet initialized", error=str(e))
    yield
    logger.info("RAG service shutting down")


# ─── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="PotuPartners RAG Service",
    version="1.0.0",
    description="Internal RAG microservice for document ingestion and AI query processing",
    docs_url=None,    # Disable public Swagger UI in production
    redoc_url=None,
    lifespan=lifespan,
)


# ─── Global exception handler ─────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error(
        "Unhandled exception",
        path=str(request.url),
        method=request.method,
        error=str(exc),
        exc_info=True,
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# ─── Routes ───────────────────────────────────────────────────────────────────
app.include_router(ingest.router)
app.include_router(query.router)


@app.get("/health", response_model=HealthResponse, tags=["health"])
async def health_check() -> HealthResponse:
    try:
        count = collection_count()
        return HealthResponse(status="ok", collection_count=count)
    except Exception:
        return HealthResponse(status="degraded", collection_count=None)
