# invoice-frontend

Minimal mobile-first React app for scanning invoices from iPhone Safari and sending them to a FastAPI backend.

## Features

- Camera capture support for iPhone Safari using `capture="environment"`
- PDF and image upload support
- Simple API-key gate stored in `localStorage`
- Upload / process / edit / save / confirm flow
- GitHub Pages deploy-ready with Vite + `gh-pages`

## Setup

```bash
cd invoice-frontend
npm install
cp .env.example .env
```

Set env values in `.env`:

- `VITE_API_URL`: backend base URL (Railway deployment URL)
- `VITE_API_KEY`: optional default key (app uses user-entered key from localStorage)
- `VITE_BASE_PATH`: GitHub Pages base path (e.g. `/invoice-frontend/`)

## Run locally

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Deploy to GitHub Pages

1. Ensure `base` path in `vite.config.js` matches your repo pages path.
2. Push your repository to GitHub.
3. Run:

```bash
npm run deploy
```

This publishes the `dist` directory to the `gh-pages` branch.

## Push to `https://github.com/gbenor/invoice-frontend`

If your local repository does not already point to GitHub, run:

```bash
git remote add origin https://github.com/gbenor/invoice-frontend.git
git push -u origin work
```

Then deploy GitHub Pages from this branch:

```bash
npm run deploy
```

## API endpoints used

- `POST /upload`
- `GET /invoice/{id}`
- `PUT /invoice/{id}`
- `POST /invoice/{id}/confirm`

All requests include:

```http
x-api-key: <stored access key>
```
