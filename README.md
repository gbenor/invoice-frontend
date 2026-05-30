# invoice-frontend

Minimal mobile-first React app for scanning invoices from iPhone Safari and sending them to a FastAPI backend.

## Features

- Camera capture support for iPhone Safari using `capture="environment"`
- PNG/JPG/JPEG image upload support aligned with the backend
- API-key entry on the auth screen and home screen, stored in `localStorage`
- Upload / process / edit / save / confirm flow
- GitHub Pages deploy-ready with Vite + GitHub Actions

## Setup

```bash
cd invoice-frontend
npm install
cp .env.example .env
```

Set env values in `.env`:

- `VITE_API_URL`: backend base URL (defaults to `https://invoice-production-a0d7.up.railway.app`)
- `VITE_API_KEY`: optional default key (app uses user-entered key from localStorage)
- `VITE_API_BASE_PATH`: optional backend route prefix, for example `/api` if the backend mounts routes under `/api`
- `VITE_API_AUTH_MODE`: optional auth transport; defaults to `bearer` to match the backend `Authorization: Bearer <key>` examples. Set to `x-api-key`, `query`, `header`, or `none` only if the backend is changed to expect that mode.
- `VITE_API_AUTH_QUERY_PARAM`: optional query auth parameter name; defaults to `api_key`
- `VITE_API_AUTH_HEADER_NAME`: optional custom header name when using `header`/`x-api-key`; defaults to `x-api-key`
- `VITE_APP_VERSION`: optional visible app version override; defaults to `package.json` version
- `VITE_BUILD_TIME`: optional visible build timestamp override; defaults to build time
- `VITE_GIT_SHA`: optional visible short commit override; defaults to the current short git SHA when available
- `VITE_BASE_PATH`: optional frontend base path override (for local custom testing)

## Run locally

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Deploy to GitHub Pages (recommended: automatic)

This repo is configured with `.github/workflows/deploy-pages.yml` for automatic GitHub Pages deploys.

### 1) Push to GitHub

Push this repo to GitHub and make sure your default branch is `main`.

### 2) Add required repository secrets

In **GitHub → Settings → Secrets and variables → Actions**, add:

- `VITE_API_URL` (optional; overrides the default Railway backend)
- `VITE_API_KEY` (optional)

### 3) Enable Pages from Actions

In **GitHub → Settings → Pages**:

- **Source**: `GitHub Actions`

### 4) Trigger deployment

Push to `main` or `work` to run the deploy workflow automatically (or run it manually from the Actions tab).

Your app URL will be:

- `https://<your-github-username>.github.io/<repo-name>/`

> Note: the workflow sets `VITE_BASE_PATH=/<repo-name>/` automatically, so assets and routes resolve correctly on project pages.

## Manual deploy option (legacy)

You can still deploy manually:

```bash
npm run deploy
```

This publishes `dist` to the `gh-pages` branch via the `gh-pages` package.

## API endpoints used

- `POST /upload`
- `POST /debug-upload`
- `POST /upload/monzo-csv`
- `POST /upload/amazon-csv`
- `POST /invoice/send`
- `GET /invoices/latest?n=<1..100>`
- `GET /invoice/{id}`
- `PUT /invoice/{id}`
- `POST /invoice/{id}/confirm`

By default, authenticated requests include the saved key in the backend-compatible bearer header:

```http
Authorization: Bearer <stored access key>
```

If a deployed environment still has `VITE_API_AUTH_MODE=query` set from an older build, remove that override or set it to `bearer` so requests use this header instead of `?api_key=...`.

This matches the backend upload example:

```bash
curl -X POST http://localhost:8000/upload \
  -H "Authorization: Bearer key1" \
  -F "file=@/path/to/invoice.jpg;type=image/jpeg"
```

The router paths used by the frontend match the FastAPI router: `/upload`, `/debug-upload`, `/upload/monzo-csv`, `/upload/amazon-csv`, `/invoice/send`, `/invoices/latest`, `/invoice/{id}`, and `/invoice/{id}/confirm`. Because browser `Authorization` headers trigger a CORS preflight, the backend must allow `OPTIONS` requests and the `Authorization` header for cross-origin deployments.

## If you see a 404 on GitHub Pages

1. Confirm the deploy workflow completed successfully in **Actions**.
2. Confirm Pages source is `GitHub Actions`.
3. Wait 1-3 minutes after a successful deploy and refresh.
4. Open: `https://gbenor.github.io/invoice-frontend/`.
