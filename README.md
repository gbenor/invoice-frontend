# invoice-frontend

Minimal mobile-first React app for scanning invoices from iPhone Safari and sending them to a FastAPI backend.

## Features

- Camera capture support for iPhone Safari using `capture="environment"`
- PDF and image upload support
- Simple API-key gate stored in `localStorage`
- Upload / process / edit / save / confirm flow
- GitHub Pages deploy-ready with Vite + GitHub Actions

## Setup

```bash
cd invoice-frontend
npm install
cp .env.example .env
```

Set env values in `.env`:

- `VITE_API_URL`: backend base URL (Railway deployment URL)
- `VITE_API_KEY`: optional default key (app uses user-entered key from localStorage)
- `VITE_BASE_PATH`: optional base path override (for local custom testing)

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

- `VITE_API_URL` (required)
- `VITE_API_KEY` (optional)

### 3) Enable Pages from Actions

In **GitHub → Settings → Pages**:

- **Source**: `GitHub Actions`

### 4) Trigger deployment

Every push to `main` runs the deploy workflow automatically.

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
- `GET /invoice/{id}`
- `PUT /invoice/{id}`
- `POST /invoice/{id}/confirm`

All requests include:

```http
x-api-key: <stored access key>
```
