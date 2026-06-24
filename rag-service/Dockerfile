# ─────────────────────────────────────────────────────────────────────────────
# PotuPartners RAG Service — Production Dockerfile
# Python 3.11 + FastAPI + ChromaDB + OpenAI
# ─────────────────────────────────────────────────────────────────────────────

FROM python:3.11-slim AS production

LABEL maintainer="PotuPartners Engineering"

# System dependencies for PyMuPDF and python-docx
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    libmupdf-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Security: non-root user
RUN groupadd --system --gid 1001 ragservice && \
    useradd  --system --uid  1001 --gid ragservice raguser

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app ./app

# Create directories for persistent storage (mounted as volumes in production)
RUN mkdir -p /app/chroma_db /app/logs && \
    chown -R raguser:ragservice /app

USER raguser

# Expose internal port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=15s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Run with Gunicorn + UvicornWorker
CMD ["gunicorn", "app.main:app", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--workers", "2", \
     "--bind", "0.0.0.0:8000", \
     "--timeout", "120", \
     "--keepalive", "5", \
     "--access-logfile", "-", \
     "--error-logfile", "-", \
     "--log-level", "info"]
