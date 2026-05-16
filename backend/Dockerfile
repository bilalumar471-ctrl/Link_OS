# ──────────────────────────────────────────────────────────────────────────────
# LinkOS Backend — Dockerfile
# Target: Google Cloud Run (asia-southeast1)
# Python: 3.11-slim
# Port:   8080 (Cloud Run default)
# ──────────────────────────────────────────────────────────────────────────────

FROM python:3.11-slim

# Prevents Python from writing pyc files and enables stdout/stderr unbuffering
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install OS-level dependencies (none required beyond slim defaults for this stack)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (layer-cached unless requirements.txt changes)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Cloud Run injects PORT env var; default to 8080
ENV PORT=8080

# GOOGLE_APPLICATION_CREDENTIALS path — must match config.py default
# The service-account.json is copied into /app/ by the COPY . . step above.
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/service-account.json

# Health check (Cloud Run also probes /api/health automatically after startup)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT}/api/health || exit 1

# Run with Uvicorn. Workers=1 because Cloud Run scales horizontally by spawning new containers.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT} --workers 1"]
