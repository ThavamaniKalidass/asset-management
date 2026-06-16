# Asset Management (AMS)

This repository contains a Vite + React frontend and an Express + PostgreSQL backend for asset management with QR code generation.

Local development

1. Copy env example files

```bash
cp server/.env.example server/.env
```

2. Start with Docker Compose (recommended)

```bash
docker-compose up --build
```

3. Backend

- API: http://localhost:4000/api

4. Frontend

- App: http://localhost:3000

Deployment

- Frontend: Deploy `dist/` to Netlify. Use `netlify.toml` already provided and set `BACKEND_URL` in the Netlify site settings.
- Backend: Deploy to Render, Railway, or Fly.io. Provide `DATABASE_URL` and `JWT_SECRET` for production.

Notes

- The migration script ensures `pgcrypto` extension is created for UUID generation.
- The project includes GitHub Actions to build frontend and backend on push to `main`.
