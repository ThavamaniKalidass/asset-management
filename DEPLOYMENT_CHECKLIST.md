# Deployment Checklist

- [ ] Push all code to `main` branch in GitHub
- [ ] Create Render PostgreSQL instance
- [ ] Create Render Web Service for backend (or use Dockerfile)
- [ ] Set backend environment variables on Render (`DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `FRONTEND_URL`, `NODE_ENV`)
- [ ] Deploy backend and verify `/api/health`
- [ ] Run migrations: `npm run migrate` on backend service
- [ ] Run seed: `npm run seed` on backend service
- [ ] Create Netlify site and connect repo
- [ ] Set Netlify env var `VITE_API_URL` to backend base URL
- [ ] Deploy frontend on Netlify and verify site loads
- [ ] Login with seeded admin account (`admin@company.com` / `admin123`)
- [ ] Test search, dashboard, CRUD, QR generate/download/print, QR scanning across devices
- [ ] Update `JWT_SECRET` to a secure secret and rotate if necessary
- [ ] Enable HTTPS and custom domain if needed
- [ ] (Optional) Configure GitHub Actions deploy steps
