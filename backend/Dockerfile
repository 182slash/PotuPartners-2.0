# ─────────────────────────────────────────────────────────────────────────────
# PotuPartners Backend — Production Dockerfile
# Multi-stage build: compile TypeScript → lean production image
# ─────────────────────────────────────────────────────────────────────────────

# Stage 1: Build
FROM node:20-alpine AS builder

LABEL maintainer="PotuPartners Engineering"

WORKDIR /app

# Copy dependency manifests first (layer caching)
COPY package.json package-lock.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Production image
FROM node:20-alpine AS production

# Security: don't run as root
RUN addgroup --system --gid 1001 potupartners && \
    adduser  --system --uid  1001 --ingroup potupartners appuser

WORKDIR /app

# Copy only production dependencies manifest
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev && \
    npm cache clean --force

# Copy compiled output from builder stage
COPY --from=builder /app/dist ./dist

# Copy migration files (needed at runtime for npm run migrate)
COPY migrations ./migrations

# Set ownership
RUN chown -R appuser:potupartners /app

USER appuser

# Expose API port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:4000/health || exit 1

# Start server
CMD ["node", "dist/index.js"]
