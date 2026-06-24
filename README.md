# PotuPartners — Full-Stack Production Documentation

> Complete technical documentation for the PotuPartners luxury law firm platform.
> Covers local development, production deployment, CI/CD, and Play Store packaging.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Repository Structure](#2-repository-structure)
3. [Local Development Setup](#3-local-development-setup)
4. [Environment Variables Reference](#4-environment-variables-reference)
5. [Database: Migrations & Schema](#5-database)
6. [API Reference](#6-api-reference)
7. [Real-Time Chat — Socket Events](#7-socket-events)
8. [RAG Pipeline](#8-rag-pipeline)
9. [Production Deployment](#9-production-deployment)
10. [CI/CD — GitHub Actions](#10-cicd)
11. [PWA → Google Play Store](#11-pwa-play-store)
12. [Security Checklist](#12-security-checklist)
13. [Maintenance & Operations](#13-maintenance)

---

## 1. Architecture Overview

```
┌─────────────┐         HTTPS + WSS          ┌──────────────────────────────┐
│   Clients   │ ──────────────────────────→  │   Hostinger (Frontend)       │
│ Browser/TWA │                               │   Next.js Static Export      │
└─────────────┘                               │   potupartners.site           │
                                              └──────────────────────────────┘
                          HTTPS + WSS
                ──────────────────────────→  ┌──────────────────────────────┐
                                              │  DigitalOcean VPS            │
                                              │  ┌────────────────────────┐  │
                                              │  │ Nginx (Port 80/443)    │  │
                                              │  └──────────┬─────────────┘  │
                                              │             │                 │
                                              │  ┌──────────▼──────────────┐ │
                                              │  │ Express API  :4000      │ │
                                              │  │ + Socket.io  /chat      │ │
                                              │  └──────────┬──────────────┘ │
                                              │             │                 │
                                              │  ┌──────────▼──────────────┐ │
                                              │  │ FastAPI RAG  :8000      │ │
                                              │  │ (internal only)         │ │
                                              │  └─────────────────────────┘ │
                                              └──────┬───────────────────────┘
                                                     │
                              ┌──────────────────────┼──────────────────────┐
                              │                      │                      │
                   ┌──────────▼──────┐  ┌───────────▼──────┐  ┌────────────▼───┐
                   │ DO PostgreSQL   │  │ DO Spaces        │  │ OpenAI API     │
                   │ (Managed DB)    │  │ (File Storage)   │  │ GPT-4o +       │
                   │                 │  │                  │  │ Embeddings     │
                   └─────────────────┘  └──────────────────┘  └────────────────┘
```

**Technology stack:**

| Layer          | Technology                    |
|----------------|-------------------------------|
| Frontend       | Next.js 14 (static export)    |
| Backend        | Node.js + Express (TypeScript) |
| Real-time      | Socket.io                     |
| AI/RAG         | Python + FastAPI + LangChain  |
| LLM            | OpenAI GPT-4o                 |
| Embeddings     | OpenAI text-embedding-3-small |
| Vector store   | ChromaDB (self-hosted)        |
| Database       | PostgreSQL (DO Managed)       |
| File storage   | DigitalOcean Spaces           |
| Auth           | JWT + refresh token rotation  |

---

## 2. Repository Structure

```
potupartners/
├── frontend/                   # Next.js 14 static app (Phase 2)
├── backend/                    # Node.js + Express API (Phase 3)
├── rag-service/                # Python FastAPI RAG microservice (Phase 3)
└── deploy/
    ├── nginx/nginx.conf        # Nginx site configuration
    ├── pm2.config.js           # PM2 process configuration
    ├── scripts/setup.sh        # Fresh VPS setup script
    ├── github-actions/         # CI/CD workflow files
    ├── assetlinks.json         # TWA Play Store domain verification
    └── twa-manifest.json       # Bubblewrap TWA config
```

---

## 3. Local Development Setup

### Prerequisites

- Node.js ≥ 18.17 LTS
- Python ≥ 3.11
- PostgreSQL 15+ (local or Docker)
- npm ≥ 9

### Option A — Docker (recommended)

```bash
# Start PostgreSQL
docker run -d \
  --name potupartners-pg \
  -e POSTGRES_DB=potupartners \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15-alpine
```

### Backend setup

```bash
cd backend
npm install
cp .env.example .env     # Edit with your local values
npm run migrate          # Run all SQL migrations
npm run dev              # Start on port 4000
```

### RAG service setup

```bash
cd rag-service
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # Edit with your values
uvicorn app.main:app --reload --port 8000
```

### Frontend setup

```bash
cd frontend
npm install
cp .env.local.example .env.local   # Set API URL to http://localhost:4000
npm run dev                         # Start on port 3000
```

### Verify everything is running

```bash
curl http://localhost:4000/health      # → {"status":"ok"}
curl http://localhost:8000/health      # → {"status":"ok","collection_count":0}
open http://localhost:3000             # → Frontend
```

---

## 4. Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `production` or `development` |
| `PORT` | Yes | Server port (default: 4000) |
| `CORS_ORIGIN` | Yes | Frontend URL(s), comma-separated |
| `DATABASE_URL` | Yes | PostgreSQL connection string with SSL |
| `JWT_ACCESS_SECRET` | Yes | ≥64 char random string for access tokens |
| `JWT_REFRESH_SECRET` | Yes | ≥64 char random string for refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | Yes | Default: `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Yes | Default: `7d` |
| `DO_SPACES_KEY` | Yes | DO Spaces access key ID |
| `DO_SPACES_SECRET` | Yes | DO Spaces secret key |
| `DO_SPACES_ENDPOINT` | Yes | e.g. `https://sgp1.digitaloceanspaces.com` |
| `DO_SPACES_BUCKET` | Yes | Bucket name |
| `DO_SPACES_CDN_URL` | Yes | CDN endpoint for public files |
| `RAG_SERVICE_URL` | Yes | Internal RAG service URL |
| `RAG_SERVICE_SECRET` | Yes | ≥32 char shared secret |
| `BCRYPT_ROUNDS` | No | Default: `12` |
| `LOG_LEVEL` | No | Default: `info` |

Generate secrets:
```bash
openssl rand -hex 64   # For JWT secrets (64 chars)
openssl rand -hex 32   # For service secret (32 chars)
```

### RAG Service (`rag-service/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `RAG_SERVICE_SECRET` | Yes | Must match backend value |
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `LLM_MODEL` | No | Default: `gpt-4o` |
| `EMBEDDING_MODEL` | No | Default: `text-embedding-3-small` |
| `CHROMA_PERSIST_PATH` | No | Default: `./chroma_db` |
| `DO_SPACES_*` | Yes | Same as backend |
| `BACKEND_URL` | No | For indexing callbacks |

---

## 5. Database

### Running Migrations

```bash
cd backend
npm run migrate
```

Migrations run in order (`001_` through `005_`) and are tracked in the `_migrations` table to prevent re-execution.

### Schema Summary

| Table | Description |
|-------|-------------|
| `users` | All actors: clients, associates, partners, admins |
| `refresh_tokens` | Active refresh token hashes (rotated on each use) |
| `conversations` | One row per isolated chat room |
| `messages` | All messages with soft-delete via `deleted_at` |
| `files` | Chat file attachments pointing to DO Spaces |
| `rag_documents` | Admin-uploaded knowledge base documents |

### Resetting the database (dev only)

```bash
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run migrate
```

---

## 6. API Reference

Base URL: `https://api.potupartners.site`
All protected routes require: `Authorization: Bearer <access_token>`

### Auth Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | Public | Register new client account |
| POST | `/api/auth/login` | Public | Login, sets refresh cookie |
| POST | `/api/auth/refresh` | Cookie | Rotate access token |
| POST | `/api/auth/logout` | Protected | Invalidate session |
| GET | `/api/auth/me` | Protected | Get current user |

**POST /api/auth/login — Request body:**
```json
{ "email": "user@example.com", "password": "Password1" }
```
**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "...", "role": "client", ... },
    "accessToken": "eyJ..."
  }
}
```

### User Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users/staff` | Protected | List all associates + partners |
| GET | `/api/users/:id` | Protected | Get user public profile |
| PATCH | `/api/users/me` | Protected | Update own profile |

### Conversation Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/conversations` | Protected | Create or retrieve conversation |
| GET | `/api/conversations` | Protected | List all user's conversations |
| GET | `/api/conversations/:id` | Protected | Single conversation |
| DELETE | `/api/conversations/:id` | Protected | Delete conversation + messages |

**POST /api/conversations — Request body:**
```json
{ "participantId": "uuid-or-null", "isAiChat": false }
```

### Message Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/conversations/:id/messages` | Protected | Paginated message history |
| DELETE | `/api/messages/:id` | Protected | Soft-delete a message |

Query params: `?page=1&limit=50`

### File Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/files/upload` | Protected | Upload file to DO Spaces |
| GET | `/api/files/:id/url` | Protected | Get download URL (presigned) |
| DELETE | `/api/files/:id` | Protected | Delete file |

**POST /api/files/upload** — multipart/form-data:
- `file`: The file (max 25MB, types: jpg/png/pdf/doc/docx)
- `conversationId`: UUID string

### AI Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/ai/query` | Protected | Query AI chatbot |

**Request:** `{ "conversationId": "uuid", "message": "What are your practice areas?" }`

### Admin Endpoints (role: admin)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/users` | List all users |
| POST | `/api/admin/users` | Create staff account |
| PATCH | `/api/admin/users/:id/role` | Update role |
| DELETE | `/api/admin/users/:id` | Deactivate user |
| GET | `/api/admin/rag-documents` | List knowledge base docs |
| POST | `/api/admin/rag-documents` | Upload + index document |
| DELETE | `/api/admin/rag-documents/:id` | Remove document |
| GET | `/api/admin/chat-rooms` | Monitor all conversations |

---

## 7. Socket Events

Namespace: `/chat`
Authentication: `socket.io` handshake `auth.token` (JWT access token)

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join_conversation` | `{ conversationId }` | Join a conversation room |
| `send_message` | `{ conversationId, content?, fileId? }` | Send a message |
| `delete_message` | `{ messageId }` | Delete own message |
| `typing_start` | `{ conversationId }` | Notify typing started |
| `typing_stop` | `{ conversationId }` | Notify typing stopped |
| `mark_read` | `{ conversationId }` | Mark messages as read |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `conversation_joined` | `{ roomKey, history[] }` | Ack join + history |
| `new_message` | `{ message }` | New message in room |
| `message_deleted` | `{ messageId, conversationId }` | Message soft-deleted |
| `user_typing` | `{ userId, userName, conversationId }` | Someone is typing |
| `user_stopped_typing` | `{ userId, conversationId }` | Typing stopped |
| `ai_thinking` | `{}` | AI processing started |
| `ai_response` | `{ message }` | AI response ready |
| `user_online` | `{ userId }` | User connected |
| `user_offline` | `{ userId }` | User disconnected |
| `error` | `{ code, message }` | Error notification |

---

## 8. RAG Pipeline

### Document Ingestion (Admin Upload)

```
Admin uploads via /admin → POST /api/admin/rag-documents
           ↓
   Backend: validates file → uploads to DO Spaces (private bucket)
           ↓
   Saves record to rag_documents (indexed: false)
           ↓
   Calls RAG service: POST http://localhost:8000/ingest
           ↓ (async — response sent to admin immediately)
   RAG Service:
     1. Downloads file from DO Spaces
     2. Extracts text (PyMuPDF for PDF / python-docx for DOCX)
     3. Chunks with RecursiveCharacterTextSplitter (800 tok, 120 overlap)
     4. Embeds each chunk → OpenAI text-embedding-3-small
     5. Upserts to ChromaDB (cosine similarity index)
     6. Calls backend callback → marks doc as indexed, saves chunk_count
```

### Query Processing (Client AI Chat)

```
Client sends message in AI chat → socket send_message event
           ↓
   Backend: saves user message → calls RAG service: POST /query
           ↓
   RAG Service:
     1. Embeds question (same model as documents)
     2. Cosine similarity search → top-5 chunks (score ≥ 0.30)
     3. Assembles prompt: [System] + [Context] + [History] + [Question]
     4. Calls GPT-4o (temp=0.1, max_tokens=1000)
     5. Returns { answer, sources[] }
           ↓
   Backend: saves AI response → emits via socket to chat room
           ↓
   Frontend: renders in chat with Bot icon + gold left border
```

---

## 9. Production Deployment

### Initial VPS Setup (run once)

```bash
# SSH into your fresh DO Droplet (Ubuntu 22.04)
ssh root@YOUR_DROPLET_IP

# Download and run the setup script
curl -sL https://raw.githubusercontent.com/your-org/potupartners/main/deploy/scripts/setup.sh | bash
```

### Deploy backend manually

```bash
# On the VPS
cd /opt/potupartners/backend
git pull origin main
npm ci --omit=dev
npm run migrate
npm run build
pm2 reload potupartners-api --update-env
pm2 save
```

### Deploy RAG service manually

```bash
cd /opt/potupartners/rag-service
git pull origin main
source venv/bin/activate
pip install -r requirements.txt -q
pm2 reload potupartners-rag --update-env
pm2 save
```

### Deploy frontend to Hostinger

```bash
# From your local machine
cd frontend
npm run build   # Generates /out directory

# Upload with rsync (fastest, incremental)
rsync -avz --delete --checksum \
  out/ \
  username@hostinger-ip:/home/u000000000/public_html/
```

### Nginx + SSL setup

```bash
# Install Nginx config
cp deploy/nginx/nginx.conf /etc/nginx/sites-available/potupartners
ln -s /etc/nginx/sites-available/potupartners /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Obtain SSL certificate
certbot --nginx -d api.potupartners.site
```

### GitHub Actions Secrets to configure

| Secret | Description |
|--------|-------------|
| `HOSTINGER_SSH_PRIVATE_KEY` | Private key for Hostinger SSH |
| `HOSTINGER_USER` | Hostinger SSH username |
| `HOSTINGER_HOST` | Hostinger server hostname/IP |
| `HOSTINGER_PATH` | Deployment path e.g. `/home/u.../public_html` |
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_SOCKET_URL` | Socket server URL |
| `NEXT_PUBLIC_APP_URL` | Frontend URL |
| `NEXT_PUBLIC_CDN_URL` | DO Spaces CDN URL |
| `DO_SSH_PRIVATE_KEY` | Private key for DO Droplet SSH |
| `DO_USER` | DO Droplet SSH user |
| `DO_HOST` | DO Droplet IP address |

---

## 10. CI/CD

### Frontend pipeline (on push to `main`, `frontend/**` changed):
1. Install npm dependencies
2. Write production env from GitHub secrets
3. Run `npm run build` (Next.js static export)
4. rsync `out/` to Hostinger via SSH
5. Verify homepage HTTP 200

### Backend pipeline (on push to `main`, `backend/**` changed):
1. rsync source to DO VPS (excluding node_modules, dist)
2. SSH: `npm ci && npm run migrate && npm run build && pm2 reload`
3. Health check: `GET /health` must return `{"status":"ok"}`

### RAG pipeline (runs after backend, on `rag-service/**` changed):
1. rsync source to DO VPS (excluding venv, chroma_db)
2. SSH: `pip install && pm2 reload`
3. Internal health check via SSH

---

## 11. PWA → Play Store

### Prerequisites
- Node.js installed locally
- Android Studio or Android SDK (for signing)
- Google Play Console account ($25 one-time fee)

### Step 1 — Verify PWA criteria

```bash
# Build and serve the frontend
cd frontend && npm run build
npx serve out

# Open Chrome → DevTools → Application → Lighthouse
# PWA score must be 100 to proceed
```

### Step 2 — Install Bubblewrap

```bash
npm install -g @bubblewrap/cli
```

### Step 3 — Initialize TWA project

```bash
mkdir potupartners-twa && cd potupartners-twa
bubblewrap init --manifest https://potupartners.site/manifest.json
# OR use the provided config:
cp ../deploy/twa-manifest.json ./twa-manifest.json
bubblewrap init --manifest-path ./twa-manifest.json
```

### Step 4 — Configure digital asset links

The `assetlinks.json` must be served at:
`https://potupartners.site/.well-known/assetlinks.json`

1. Build the TWA: `bubblewrap build` (generates keystore)
2. Get your SHA256 fingerprint:
   ```bash
   keytool -list -v -keystore android.keystore -alias potupartners
   ```
3. Replace `REPLACE_WITH_YOUR_SIGNING_KEY_SHA256_FINGERPRINT` in `deploy/assetlinks.json`
4. The file is already served from `/public/.well-known/assetlinks.json` in the frontend

### Step 5 — Build signed APK/AAB

```bash
bubblewrap build
# Produces: app-release-signed.apk + app-release-bundle.aab
```

### Step 6 — Upload to Google Play

1. Go to [play.google.com/console](https://play.google.com/console)
2. Create app → "PotuPartners"
3. Upload `app-release-bundle.aab` (not the APK)
4. Complete: store listing, screenshots, privacy policy URL
5. Submit for review (1–3 business days)

### Step 7 — Future updates

Web updates deploy automatically via CI/CD. The TWA shell fetches the latest content from the live URL — **no Play Store resubmission needed** for content updates.

Only resubmit if `twa-manifest.json` changes (app name, orientation, icons, etc.).

---

## 12. Security Checklist

| Control | Status | Details |
|---------|--------|---------|
| JWT access tokens (15 min) | ✅ | `jsonwebtoken`, HS256 |
| JWT refresh token rotation | ✅ | Token hash stored, deleted on use |
| bcrypt password hashing | ✅ | 12 rounds in production |
| httpOnly refresh cookie | ✅ | `secure: true` in production |
| CORS whitelist | ✅ | Exact origin match required |
| Helmet.js security headers | ✅ | X-Frame-Options, HSTS, etc. |
| Rate limiting (express-rate-limit) | ✅ | 20 rpm auth, 300 rpm general |
| Nginx rate limit zones | ✅ | `limit_req_zone` per endpoint type |
| Input validation (Zod) | ✅ | All request bodies validated |
| SQL injection prevention | ✅ | Parameterized queries only via `pg` |
| File MIME type validation | ✅ | Magic bytes checked, not just extension |
| File size limits | ✅ | 25MB chat, 50MB RAG docs |
| HTTPS enforced | ✅ | Nginx redirects HTTP→HTTPS |
| TLS 1.2+ only | ✅ | Nginx `ssl_protocols TLSv1.2 TLSv1.3` |
| HSTS header | ✅ | `max-age=31536000` |
| RAG service internal-only | ✅ | Bound to `127.0.0.1:8000` |
| Inter-service auth | ✅ | `X-Service-Secret` header |
| Firewall (UFW) | ✅ | Only ports 22, 80, 443 open |
| Fail2Ban | ✅ | SSH + Nginx brute-force protection |
| Env vars validated at startup | ✅ | Zod schema, process.exit on failure |
| Soft delete for messages | ✅ | `deleted_at` column, content redacted |
| User enumeration prevention | ✅ | Constant-time response on bad login |

---

## 13. Maintenance & Operations

### PM2 commands

```bash
pm2 status                         # See all processes
pm2 logs potupartners-api          # Tail API logs
pm2 logs potupartners-rag          # Tail RAG logs
pm2 restart potupartners-api       # Restart Node backend
pm2 reload potupartners-api        # Zero-downtime reload
pm2 monit                          # Real-time monitoring dashboard
```

### PostgreSQL maintenance

```bash
# Connect to managed DB
psql $DATABASE_URL

# Check slow queries
SELECT query, calls, mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC LIMIT 10;

# Clean up expired refresh tokens (run periodically)
DELETE FROM refresh_tokens WHERE expires_at < NOW();

# Check database size
SELECT pg_size_pretty(pg_database_size(current_database()));
```

### ChromaDB backup

```bash
# On the VPS — backup the vector store
tar -czf /opt/potupartners/backups/chroma-$(date +%Y%m%d).tar.gz \
  /opt/potupartners/rag-service/chroma_db/

# List backups
ls -lh /opt/potupartners/backups/
```

### SSL certificate renewal

```bash
# Certbot auto-renews, but test manually:
certbot renew --dry-run

# Force renewal:
certbot renew --force-renewal
systemctl reload nginx
```

### Adding a new knowledge base document

1. Log in at `https://potupartners.site/admin`
2. Navigate to **Knowledge Base** tab
3. Click **Upload Document**
4. Enter title, optional description, select PDF/DOCX file
5. Wait for **Indexed ✓** status (typically 30–120 seconds)

### Monitoring (no extra tooling required)

```bash
# VPS resource usage
htop

# Nginx access log (live)
tail -f /var/log/nginx/potupartners_access.log

# Combined app logs
pm2 logs

# Check disk space (important for ChromaDB)
df -h
```

---

*PotuPartners Platform — Phase 3 Backend & Deployment*
*Stack: Node.js + Express + Socket.io + FastAPI + ChromaDB + GPT-4o + PostgreSQL + DO Spaces*
