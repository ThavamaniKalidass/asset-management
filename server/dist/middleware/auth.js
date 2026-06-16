import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'ams-dev-secret-key-change-in-production';
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is required in production.');
}
export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
}
export function requireAdmin(req, res, next) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required.' });
    }
    next();
}
export function generateToken(user) {
    return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}
//# sourceMappingURL=auth.js.map