# filipekstrom.com

Personal playground site. Static React frontend hosted on GitHub Pages; MERN backend planned but paused for now.

## Structure

- `frontend/` — React (Vite) app. Builds to static files, deployed to GitHub Pages.
- `backend/` — Express + Node + MongoDB API (placeholder, paused).
- `docker-compose.yml` — local development.

## Local development

Requires Docker and docker-compose:

```sh
docker compose up --build
```

The site is served at http://localhost:5173 with hot reload.

## Deployment

Pushing to `main` triggers the GitHub Actions workflow in `.github/workflows/deploy.yml`, which builds the frontend and deploys it to GitHub Pages.

One-time setup:

1. In the GitHub repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. In **Settings → Pages → Custom domain**, enter `filipekstrom.com` (the `frontend/public/CNAME` file keeps it persisted across deploys).
3. At the domain registrar, create A records pointing `@` to GitHub's IPs and a CNAME record pointing `www` to `<username>.github.io`.

GitHub will automatically issue a free SSL certificate once DNS propagates.
