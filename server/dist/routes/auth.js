import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
const router = Router();
// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }
        const result = await query('SELECT id, email, password_hash, name, role FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }
        const token = generateToken({ id: user.id, email: user.email, role: user.role });
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const result = await query('SELECT id, email, name, role, created_at FROM users WHERE id = $1', [req.user.id]);
        const user = result.rows[0];
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.json(user);
    }
    catch (err) {
        console.error('Get user error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
export default router;
//# sourceMappingURL=auth.js.map