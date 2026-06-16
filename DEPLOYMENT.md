# Deployment Guide — Render (Backend + Postgres) & Netlify (Frontend)

This guide shows exact commands and UI steps to deploy the AMS project.

Prerequisites

- GitHub repository with this code pushed to `main` branch.
- Render account (or Railway) and Netlify account.
- `git` and `docker` locally (optional for local verification).

Summary

- Provision managed Postgres on Render
- Create a Web Service on Render for the backend (use Dockerfile)
- Set environment variables on Render
- Deploy and run migrations/seeds
- Create Netlify site for frontend, set `VITE_API_URL` to backend public URL
- Build and verify

Commands (local verification)

1. Start local stack (Postgres + backend + frontend):

```bash
# from repo root
docker-compose up --build
```

Visit:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api/health

2. Run backend migrations and seed (when running locally without compose):

```bash
# point DATABASE_URL to your postgres
cd server
# install deps if needed
npm install
# run migrations
npm run migrate
# run seed
npm run seed
```

Render — Backend + Postgres (step-by-step)

1. Create a new PostgreSQL instance (Managed Database) on Render:
   - Render dashboard → Databases → New Database → PostgreSQL
   - Choose plan (free for testing)
   - Note the DATABASE_URL from Render (connection string)

2. Create a new Web Service on Render for the backend:
   - Render dashboard → New → Web Service
   - Connect your GitHub repo and select the `main` branch
   - Environment:
     - Build Command: `npm ci && npm run build`
     - Start Command: `node dist/index.js`
     - Branch: `main`
     - Region: choose closest region
   - In Advanced → Docker/Build, you may select Docker and point to `server/Dockerfile` (recommended)

3. Set environment variables for the Render service (Environment → Environment Variables):
   - `DATABASE_URL` = Render Postgres connection string
   - `JWT_SECRET` = a secure random string
   - `CORS_ORIGIN` = https://<your-netlify-site>.netlify.app (or your domain)
   - `FRONTEND_URL` = https://<your-netlify-site>.netlify.app
   - `NODE_ENV` = production

4. Deploy (Render will build). After the first successful deploy, open the Live URL and check:
   - `https://<render-backend>/api/health` should return JSON `{ status: 'ok' }`

5. Run migrations and seed on Render (via one-time deployment shell or Render Console):
   - Use Render's Shell (Deploys → Console) or create a one-off job to run:

```bash
# from the Render service shell (or CI step)
cd /opt/render/project/src/server || cd server
# ensure NODE_ENV and DATABASE_URL envs are set in the service
npm run migrate
npm run seed
```

Netlify — Frontend

1. Create a new site on Netlify and connect your GitHub repo.
   - Netlify → Add new site → Import from Git
   - Choose the `main` branch

2. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

3. Environment variables (Site settings → Build & deploy → Environment):
   - `VITE_API_URL` = https://<render-backend>

4. Deploy site. After deploy completes, open the site URL.

Environment Variables Summary

- Backend (Render):
  - `DATABASE_URL` (from Render Postgres)
  - `JWT_SECRET` (secret key)
  - `CORS_ORIGIN` (frontend URL)
  - `FRONTEND_URL` (frontend URL)
  - `NODE_ENV=production`

- Frontend (Netlify):
  - `VITE_API_URL` = backend base URL (e.g., https://api.example.com)

Database Migration & Seed

- After backend service is reachable, run migrations and seed either via Render Console or by SSHing into the instance (Render provides a `Shell` in the dashboard):

```bash
# In the backend container/project directory
npm run migrate
npm run seed
```

Final Testing & Verification

1. Visit frontend URL and login with seeded admin user:
   - Email: `admin@company.com`
   - Password: `admin123`

2. Verify functionality:
   - Search page: filters return expected results
   - Dashboard: stats load
   - QR Management: Generate QR → should return backend-generated QR; download/print
   - Scan QR: open site on device with camera and `Scan QR` → scans should return desk assets
   - CRUD: Add (admin), update, delete assets (admin-only routes)

Troubleshooting

- If CORS errors appear, verify `CORS_ORIGIN` matches Netlify site origin and that `VITE_API_URL` is correct.
- If migrations fail with `gen_random_uuid` errors, ensure `pgcrypto` extension exists (migrations create it).

CI/CD Notes (optional)

- GitHub Actions workflow is included in `.github/workflows/ci.yml` to build frontend and backend and run migrations during CI.

