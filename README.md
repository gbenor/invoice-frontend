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
- `VITE_API_AUTH_MODE`: optional auth transport; defaults to `bearer`, which sends `Authorization: Bearer <key>` to match the FastAPI backend. Other supported values are `x-api-key`, `query`, `header`, and `none`; use `query` only for local development against a backend that explicitly supports query fallback.
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

By default, authenticated requests send the saved key in the `Authorization` header:

```http
GET /invoices/latest?n=10
Authorization: Bearer <stored access key>

POST /upload
Authorization: Bearer <stored access key>
```

The FastAPI backend ignores `?api_key=...` in production because authentication is implemented through the `Authorization` header dependency. Requests such as `/invoices/latest?n=10&api_key=joyajoya` or `/upload?api_key=joyajoya` therefore do not authenticate unless the backend is running an explicit development-only query fallback.

Production backend auth should parse comma-separated keys from `API_KEYS` and validate only bearer tokens:

```python
import os
from fastapi import Depends, HTTPException, Query, Request, status

AUTH_ERROR = "Missing or invalid API key. Use Authorization: Bearer <key>"
DEV_MODE = os.getenv("ENV", "production").lower() in {"dev", "development", "local"}


def configured_api_keys() -> set[str]:
    return {key.strip() for key in os.getenv("API_KEYS", "").split(",") if key.strip()}


def extract_bearer_token(authorization: str | None) -> str | None:
    if not authorization:
        return None
    scheme, _, token = authorization.strip().partition(" ")
    if scheme.lower() != "bearer" or not token.strip():
        return None
    return token.strip()


async def require_api_key(request: Request, api_key: str | None = Query(default=None)) -> str:
    token = extract_bearer_token(request.headers.get("Authorization"))
    if token is None and DEV_MODE:
        token = api_key

    if not token or token not in configured_api_keys():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=AUTH_ERROR)
    return token


# Apply consistently to protected routes/routers:
# @app.post("/upload", dependencies=[Depends(require_api_key)])
# @app.get("/invoices/latest", dependencies=[Depends(require_api_key)])
# @app.get("/invoice/{invoice_id}", dependencies=[Depends(require_api_key)])
# @app.put("/invoice/{invoice_id}", dependencies=[Depends(require_api_key)])
# @app.post("/invoice/{invoice_id}/confirm", dependencies=[Depends(require_api_key)])
```

Example requests:

```bash
curl -X GET "https://invoice-production-a0d7.up.railway.app/invoices/latest?n=10" \
  -H "Authorization: Bearer joyajoya"
```

```bash
curl -X POST "https://invoice-production-a0d7.up.railway.app/upload" \
  -H "Authorization: Bearer joyajoya" \
  -F "file=@/path/to/invoice.jpg;type=image/jpeg"
```

```python
import requests

base_url = "https://invoice-production-a0d7.up.railway.app"
headers = {"Authorization": "Bearer joyajoya"}

latest = requests.get(f"{base_url}/invoices/latest", params={"n": 10}, headers=headers, timeout=30)
latest.raise_for_status()

with open("/path/to/invoice.jpg", "rb") as file_obj:
    upload = requests.post(
        f"{base_url}/upload",
        headers=headers,
        files={"file": ("invoice.jpg", file_obj, "image/jpeg")},
        timeout=120,
    )
    upload.raise_for_status()
```

The router paths used by the frontend match the FastAPI router: `/upload`, `/debug-upload`, `/upload/monzo-csv`, `/upload/amazon-csv`, `/invoice/send`, `/invoices/latest`, `/invoice/{id}`, and `/invoice/{id}/confirm`. Browser-hosted deployments using bearer auth must allow CORS `OPTIONS` preflights and the `Authorization` header.

### Browser CORS preflight for bearer authentication

A browser request that includes `Authorization: Bearer <key>` is not a “simple request”, so the browser sends an unauthenticated `OPTIONS` preflight before the real `GET`, `POST`, or `PUT`. If the backend returns `405 Method Not Allowed` to that `OPTIONS` request, the browser blocks the real request before the API key can be checked. Backend logs like these point to CORS/preflight handling rather than a bad token:

```txt
OPTIONS /invoices/latest?n=10 HTTP/1.1 405 Method Not Allowed
OPTIONS /upload HTTP/1.1 405 Method Not Allowed
```

Fix this in FastAPI by installing `CORSMiddleware` before protected routers and allowing the frontend origin plus the `Authorization` header:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://gbenor.github.io",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)
```

Do not protect `OPTIONS` with the API-key dependency. Preflight requests normally do not include the bearer token; CORS middleware should answer them and then the actual request will carry `Authorization: Bearer <stored access key>`.

## If you see a 404 on GitHub Pages

1. Confirm the deploy workflow completed successfully in **Actions**.
2. Confirm Pages source is `GitHub Actions`.
3. Wait 1-3 minutes after a successful deploy and refresh.
4. Open: `https://gbenor.github.io/invoice-frontend/`.
