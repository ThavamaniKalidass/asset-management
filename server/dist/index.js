import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import assetRoutes from './routes/assets.js';
dotenv.config();
const app = express();
const PORT = parseInt(process.env.PORT || '4000');
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.set('trust proxy', 1);
// Middleware
app.use(helmet());
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
}));
app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found.' });
});
// Error handler
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error.' });
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`CORS origin: ${CORS_ORIGIN}`);
});
export default app;
//# sourceMappingURL=index.js.map