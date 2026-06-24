# GitHub Actions Secrets Reference

Add these at:
**GitHub Repo → Settings → Secrets and Variables → Actions → New repository secret**

---

## Secrets removed (no longer needed)

These were used for the old Hostinger + Droplet SSH approach.
You can delete them from GitHub if they exist:

| Old Secret | Why Removed |
|---|---|
| `HOSTINGER_SSH_PRIVATE_KEY` | Frontend now on Vercel — no SSH |
| `HOSTINGER_HOST` | Frontend now on Vercel |
| `HOSTINGER_USER` | Frontend now on Vercel |
| `HOSTINGER_DOCUMENT_ROOT` | Frontend now on Vercel |
| `DO_SSH_PRIVATE_KEY` | Backend now on DO App Platform — no SSH |
| `DO_HOST` | Backend now on DO App Platform |
| `DO_USER` | Backend now on DO App Platform |
| `NEXT_PUBLIC_API_URL` | Now set directly in Vercel dashboard |
| `NEXT_PUBLIC_SOCKET_URL` | Now set directly in Vercel dashboard |
| `NEXT_PUBLIC_APP_URL` | Now set directly in Vercel dashboard |
| `NEXT_PUBLIC_CDN_URL` | Now set directly in Vercel dashboard |

---

## New GitHub Secrets (backend workflow only)

Only 2 secrets are needed in GitHub Actions now:

| Secret Name | Description | Where to get it |
|---|---|---|
| `DO_API_TOKEN` | DigitalOcean personal access token | DO Dashboard → API → Generate New Token (read+write) |
| `DO_APP_ID` | Your DO App Platform app's UUID | DO Dashboard → Apps → your app → Settings → App ID |

---

## Frontend secrets → Vercel dashboard

These are no longer in GitHub. Set them in:
**Vercel → Project → Settings → Environment Variables**

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.potupartners.site` |
| `NEXT_PUBLIC_SOCKET_URL` | `https://api.potupartners.site` |
| `NEXT_PUBLIC_APP_URL` | `https://potupartners.vercel.app` (or your custom domain) |
| `NEXT_PUBLIC_CDN_URL` | `https://potupartners-files.sgp1.cdn.digitaloceanspaces.com` |

---

## Backend secrets → DO App Platform dashboard

These are no longer in GitHub. Set them in:
**DO Dashboard → Apps → potupartners-backend → Settings → Components → api → Environment Variables**

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Min 32-char random string |
| `JWT_REFRESH_SECRET` | Min 32-char random string |
| `DO_SPACES_KEY` | Spaces access key |
| `DO_SPACES_SECRET` | Spaces secret key |
| `DO_SPACES_BUCKET` | Your bucket name |
| `RAG_SERVICE_SECRET` | Min 16-char random string |

---

## Quick token generation

```bash
# Generate a DO API token
# → digitalocean.com/account/api/tokens → Generate New Token
# Scopes needed: Apps (read + write)

# Generate JWT secrets
openssl rand -hex 32   # run twice — one for ACCESS, one for REFRESH
```
