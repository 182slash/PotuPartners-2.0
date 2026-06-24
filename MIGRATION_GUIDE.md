# Migration Guide: Hostinger + DO Droplet → Vercel + DO App Platform

**Before you start:** keep the old Hostinger + Droplet running until the new setup is live and verified.

---

## Overview of what changed

| | Before | After |
|---|---|---|
| **Frontend** | Static export → Hostinger via SSH rsync | Next.js SSR → Vercel (git push auto-deploy) |
| **Backend** | DO Droplet + PM2 via SSH | DO App Platform (Docker, git push auto-deploy) |
| **RAG service** | DO Droplet + PM2 via SSH | DO App Platform (internal service) |
| **GitHub secrets** | 11 secrets | 2 secrets (`DO_API_TOKEN`, `DO_APP_ID`) |
| **Deploy trigger** | GitHub Actions builds + rsyncs | GitHub Actions validates → platforms auto-deploy |

---

## Step 1 — Merge the new files into your repo

Replace/add these files from the provided archive:

```
frontend/next.config.js       ← removed output: 'export', removed unoptimized
.github/workflows/deploy-frontend.yml   ← now CI-only (Vercel deploys itself)
.github/workflows/deploy-backend.yml    ← CI + DO API deploy trigger
.do/app.yaml                  ← NEW: DO App Platform spec
.github/SECRETS_REFERENCE.md ← updated secrets list
```

Commit and push — but don't push to `main` yet, use a branch first.

---

## Step 2 — Set up Vercel (frontend)

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo (`PotuPartners`)
3. Set **Root Directory** to `frontend`
4. Framework preset: **Next.js** (auto-detected)
5. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL      = https://api.potupartners.site
   NEXT_PUBLIC_SOCKET_URL   = https://api.potupartners.site
   NEXT_PUBLIC_APP_URL      = https://potupartners.vercel.app
   NEXT_PUBLIC_CDN_URL      = https://potupartners-files.sgp1.cdn.digitaloceanspaces.com
   ```
6. Deploy → verify it works at the Vercel URL

> **Custom domain:** In Vercel → Settings → Domains → add `potupartners.site`
> Then update your DNS: point the CNAME to `cname.vercel-dns.com`

---

## Step 3 — Set up DO App Platform (backend + RAG)

### 3a. Create the app

Option A — GUI:
1. DO Dashboard → **Apps** → **Create App**
2. Source: **GitHub** → connect your repo → branch: `main`
3. DO will auto-detect the Dockerfiles. If not, set:
   - Component 1: Source dir `backend/`, Dockerfile `backend/Dockerfile`
   - Component 2: Source dir `rag-service/`, Dockerfile `rag-service/Dockerfile`
4. Set all environment variables (see `.github/SECRETS_REFERENCE.md`)
5. Add domain: `api.potupartners.site`

Option B — CLI:
```bash
# Install doctl first: brew install doctl / snap install doctl
doctl auth init   # paste your DO API token
doctl apps create --spec .do/app.yaml
```

### 3b. Update `CORS_ORIGIN` in the app spec

Once you have your Vercel URL, go to:
**DO Dashboard → Apps → api component → Environment Variables**
Update:
```
CORS_ORIGIN = https://potupartners.vercel.app
```
(or your custom domain once DNS is updated)

### 3c. Update `next.config.js` PWA cache URL (optional)

If your API domain changes, update this line in `frontend/next.config.js`:
```js
urlPattern: /^https:\/\/api\.potupartners\.com\/.*/i,
```

---

## Step 4 — Add GitHub Secrets

**Remove old secrets** (Hostinger + Droplet SSH keys — no longer needed):
- `HOSTINGER_SSH_PRIVATE_KEY`, `HOSTINGER_HOST`, `HOSTINGER_USER`, `HOSTINGER_DOCUMENT_ROOT`
- `DO_SSH_PRIVATE_KEY`, `DO_HOST`, `DO_USER`
- All `NEXT_PUBLIC_*` secrets (now in Vercel dashboard)

**Add 2 new secrets:**
```
DO_API_TOKEN   = your DigitalOcean personal access token (read+write, Apps scope)
DO_APP_ID      = the UUID of your new DO App (found in App Settings)
```

---

## Step 5 — Update `.do/app.yaml`

Replace the placeholder with your real GitHub repo:
```yaml
github:
  repo: YOUR_GITHUB_USERNAME/PotuPartners   # ← change this
```

---

## Step 6 — Test the new pipeline

```bash
# Create a test branch
git checkout -b test/new-deploy-pipeline

# Make a harmless change (e.g., bump a comment in backend/src/index.ts)
# Push it
git push origin test/new-deploy-pipeline

# Open a PR → merge to main
# Watch:
#   - GitHub Actions tab: CI check should pass
#   - DO Dashboard → Apps: new deployment should appear
#   - Vercel dashboard: new deployment for the frontend
```

---

## Step 7 — Update DNS (when ready to cut over)

| Record | Type | Value |
|---|---|---|
| `potupartners.site` | CNAME | `cname.vercel-dns.com` |
| `api.potupartners.site` | CNAME | your DO App Platform URL (e.g. `potupartners-backend-xxxxx.ondigitalocean.app`) |

Wait for DNS propagation (~5 min–1 hour). Then decommission the old Droplet.

---

## Rollback

If something breaks after cutover:
- **Frontend:** Vercel → Deployments → click any previous deploy → **Promote to Production**
- **Backend:** DO Dashboard → Apps → Deployments → click any previous → **Redeploy**

Both roll back in under 2 minutes.

---

## New deploy flow (daily use)

```
git commit → git push origin main
         ↓
    GitHub Actions
    ├── Frontend CI (type-check + lint) ──→ Vercel auto-deploys ✅
    └── Backend CI (type-check + lint)
            ↓ (passes)
        Trigger DO App Platform deploy via API
        DO builds Dockerfile → zero-downtime container swap ✅
```
