# PotuPartners — Security Checklist

Complete security verification for the production deployment.
Audit this list before going live and after every major infrastructure change.

---

## ✅ Authentication & Authorization

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1 | JWT access tokens expire in 15 minutes | ✅ | `JWT_ACCESS_EXPIRES_IN=15m` |
| 2 | Refresh tokens expire in 7 days | ✅ | `JWT_REFRESH_EXPIRES_IN=7d` |
| 3 | Refresh tokens are hashed (SHA-256) before storing in DB | ✅ | `hashRefreshToken()` in `utils/auth.ts` |
| 4 | Refresh token rotation: old token invalidated on each refresh | ✅ | `auth.service.ts:refreshTokens()` |
| 5 | Logout deletes refresh token from DB | ✅ | `DELETE FROM refresh_tokens WHERE token_hash = $1` |
| 6 | All refresh tokens cleared on password change | ✅ | |
| 7 | Passwords hashed with bcrypt, rounds ≥ 12 | ✅ | `BCRYPT_ROUNDS=12` env var |
| 8 | Admin-only routes protected by `requireRole('admin')` middleware | ✅ | All `/api/admin/*` routes |
| 9 | Users cannot access other users' conversations | ✅ | Verified in conversation service |
| 10 | Staff cannot access admin RAG endpoints | ✅ | Role check on `/api/admin/*` |
| 11 | JWT secrets are ≥ 64 characters, random | ⚠️ | **You must generate these. See `.env.example`** |

---

## ✅ Input Validation

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 12 | All request bodies validated with Zod schemas | ✅ | `validators.ts` + `validate()` middleware |
| 13 | Email validated as proper email format | ✅ | `z.string().email()` |
| 14 | Password minimum length enforced (8+ chars) | ✅ | `z.string().min(8)` |
| 15 | File type validated server-side (MIME, not just extension) | ✅ | `file-type` npm package in `upload.middleware.ts` |
| 16 | File size enforced at Nginx level (28MB) | ✅ | `client_max_body_size 28m` in nginx.conf |
| 17 | File size enforced at Express level (25MB) | ✅ | `multer({ limits: { fileSize: 25MB } })` |
| 18 | SQL injection: all queries use parameterized `$1, $2` placeholders | ✅ | `pg` library parameterized queries throughout |
| 19 | No raw string concatenation in SQL | ✅ | Code review confirmed |
| 20 | XSS: API only returns JSON, no HTML rendering | ✅ | Express JSON-only responses |
| 21 | Conversation ID ownership verified before reading messages | ✅ | Service-level check |

---

## ✅ Rate Limiting

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 22 | Auth endpoints: 5 requests/15min per IP | ✅ | `authLimiter` in `index.ts` + Nginx `api_auth` zone |
| 23 | General API: 300 requests/15min per IP | ✅ | `generalLimiter` in `index.ts` |
| 24 | Upload endpoints: 50 requests/hour per IP | ✅ | `uploadLimiter` in `index.ts` |
| 25 | AI chat: 30 requests/min per IP (Nginx) | ✅ | `api_ai` zone in `nginx.conf` |
| 26 | Rate limit exceeded returns 429 (not 503) | ✅ | `standardHeaders: true` |
| 27 | Fail2Ban active for repeated 429 responses | ✅ | Configured in `setup.sh` |

---

## ✅ HTTPS & Transport Security

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 28 | HTTP redirects to HTTPS (301) | ✅ | Nginx: `return 301 https://...` |
| 29 | HSTS header set (63072000 seconds, includeSubDomains, preload) | ✅ | Nginx `add_header Strict-Transport-Security` |
| 30 | TLS 1.2 and 1.3 only (TLS 1.0/1.1 disabled) | ✅ | `ssl_protocols TLSv1.2 TLSv1.3` |
| 31 | Modern cipher suites only | ✅ | ECDHE + AES-GCM + ChaCha20 |
| 32 | OCSP stapling enabled | ✅ | `ssl_stapling on` |
| 33 | Let's Encrypt certificate auto-renewal | ✅ | Certbot auto-renewal cron |
| 34 | cookies are `Secure`, `HttpOnly`, `SameSite=Strict` | ✅ | Refresh token cookie settings |

---

## ✅ Security Headers

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 35 | `X-Frame-Options: SAMEORIGIN` | ✅ | Nginx |
| 36 | `X-Content-Type-Options: nosniff` | ✅ | Nginx |
| 37 | `X-XSS-Protection: 1; mode=block` | ✅ | Nginx |
| 38 | `Referrer-Policy: strict-origin-when-cross-origin` | ✅ | Nginx |
| 39 | `Permissions-Policy` (geo, mic, camera disabled) | ✅ | Nginx |
| 40 | `Content-Security-Policy` set | ✅ | Nginx |
| 41 | `server_tokens off` (hide Nginx version) | ✅ | Nginx |
| 42 | Helmet.js security headers on Express | ✅ | `index.ts` |

---

## ✅ CORS

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 43 | CORS whitelist explicitly set (not `*`) | ✅ | `CORS_ORIGIN` env var |
| 44 | CORS only allows `potupartners.site` in production | ✅ | |
| 45 | Socket.io CORS matches REST API CORS | ✅ | Same `env.CORS_ORIGIN` value |
| 46 | CORS pre-flight (OPTIONS) handled correctly | ✅ | `cors()` middleware |

---

## ✅ File Storage

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 47 | Files stored in DigitalOcean Spaces (not on VPS disk) | ✅ | S3 SDK in `storage.ts` |
| 48 | Chat files in `/chat-files/` folder | ✅ | Key prefix in `files.service.ts` |
| 49 | RAG documents in `/rag-documents/` folder | ✅ | Key prefix in `admin.service.ts` |
| 50 | Presigned URLs for private file access (15 min expiry) | ✅ | `getSignedUrl()` in `files.service.ts` |
| 51 | File names sanitised (UUID-based keys, not user-provided names) | ✅ | `${uuidv4()}-${sanitisedName}` |
| 52 | Only allowed MIME types accepted (.pdf, .doc, .docx, .jpg, .png) | ✅ | `ALLOWED_MIME_TYPES` in upload middleware |

---

## ✅ Infrastructure

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 53 | RAG service port 8000 blocked from public internet | ✅ | UFW `ufw deny 8000` |
| 54 | API port 4000 blocked from public internet | ✅ | UFW `ufw deny 4000` (Nginx proxies) |
| 55 | PostgreSQL not exposed to public internet | ✅ | DO Managed DB — private network only |
| 56 | App runs as non-root user (`potupartners`) | ✅ | `setup.sh` creates system user |
| 57 | SSH root login disabled | ✅ | `PermitRootLogin no` in setup.sh |
| 58 | SSH password authentication disabled | ✅ | `PasswordAuthentication no` |
| 59 | Fail2Ban protecting SSH, Nginx | ✅ | `fail2ban.local` in setup.sh |
| 60 | Unrecognised virtual hosts return 444 | ✅ | Default server block in nginx.conf |
| 61 | Common PHP/script extensions blocked at Nginx level | ✅ | `location ~* \.(php|asp|...)` in nginx.conf |
| 62 | PM2 cluster mode — crash recovery | ✅ | `max_restarts: 10` in ecosystem.config.js |
| 63 | Graceful shutdown on SIGTERM (finish in-flight requests) | ✅ | `server.close()` in `index.ts` |

---

## ✅ Secrets Management

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 64 | `.env` files never committed to git | ✅ | `.gitignore` |
| 65 | All secrets in environment variables (not hardcoded) | ✅ | `config/env.ts` with Zod validation |
| 66 | GitHub Secrets used for CI/CD (not plaintext in YAML) | ✅ | All `secrets.*` references in workflows |
| 67 | RAG service authenticated with shared secret | ✅ | `X-Service-Secret` header |
| 68 | DB credentials never logged | ✅ | Winston configured to not log sensitive fields |

---

## ⚠️ Action Required Before Go-Live

These items require you to take action — they cannot be automated:

1. **Generate secure JWT secrets:**
   ```bash
   openssl rand -hex 64  # JWT_ACCESS_SECRET
   openssl rand -hex 64  # JWT_REFRESH_SECRET
   openssl rand -hex 32  # RAG_SERVICE_SECRET
   ```

2. **Set strong admin password in seed script** (`ADMIN_PASSWORD` env var)

3. **Verify `CORS_ORIGIN`** matches your exact production frontend URL (no trailing slash)

4. **Test rate limits** — use a tool like `ab` or `k6` to confirm they trigger

5. **Run SSL Labs test**: https://www.ssllabs.com/ssltest/ — should score A+

6. **Enable DO Managed Database backups** in your DigitalOcean control panel

7. **Verify Certbot auto-renewal:**
   ```bash
   certbot renew --dry-run
   ```

8. **Set up uptime monitoring** (e.g., UptimeRobot free tier) for `https://api.potupartners.site/health`

---

*Last updated: Phase 3 deployment*
