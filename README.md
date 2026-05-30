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
- `VITE_API_AUTH_MODE`: optional auth transport; defaults to `query` so browser requests include `?api_key=<key>` and avoid CORS `OPTIONS` preflights for cross-origin GET requests and multipart uploads. Set to `bearer`, `x-api-key`, `header`, or `none` only if the backend and CORS policy support that mode.
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

By default, authenticated requests include the saved key in the query string:

```http
GET /invoices/latest?n=10&api_key=<stored access key>
POST /upload?api_key=<stored access key>
```

This avoids the browser `OPTIONS` preflight that is triggered by `Authorization` and other custom auth headers on cross-origin requests. If a deployed environment still has `VITE_API_AUTH_MODE=bearer`, `header`, or `x-api-key` set, remove that override or set it to `query` so `/invoices/latest` and `/upload` can reach the backend without an `OPTIONS` request.

If the backend only accepts bearer auth, it must enable CORS for `OPTIONS` and the `Authorization` header before a browser-hosted frontend can use this example:

```bash
curl -X POST http://localhost:8000/upload \
  -H "Authorization: Bearer key1" \
  -F "file=@/path/to/invoice.jpg;type=image/jpeg"
```

The router paths used by the frontend match the FastAPI router: `/upload`, `/debug-upload`, `/upload/monzo-csv`, `/upload/amazon-csv`, `/invoice/send`, `/invoices/latest`, `/invoice/{id}`, and `/invoice/{id}/confirm`. Cross-origin `PUT /invoice/{id}` requests still require backend CORS `OPTIONS` support because `PUT` is not a browser simple request.

## If you see a 404 on GitHub Pages

1. Confirm the deploy workflow completed successfully in **Actions**.
2. Confirm Pages source is `GitHub Actions`.
3. Wait 1-3 minutes after a successful deploy and refresh.
4. Open: `https://gbenor.github.io/invoice-frontend/`.
