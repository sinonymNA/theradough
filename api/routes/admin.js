import { Router } from 'express';
import crypto from 'crypto';

const router = Router();

// In-memory session store: token -> { expires }
const sessions = new Map();

const SESSION_TTL = 24 * 60 * 60 * 1000; // 24 hours

function cleanExpiredSessions() {
  const now = Date.now();
  for (const [token, data] of sessions.entries()) {
    if (data.expires < now) sessions.delete(token);
  }
}

// POST /api/admin/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  cleanExpiredSessions();
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { expires: Date.now() + SESSION_TTL });
  res.json({ success: true, token });
});

// GET /api/admin/verify
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ valid: false });
  }
  const session = sessions.get(token);
  if (session.expires < Date.now()) {
    sessions.delete(token);
    return res.status(401).json({ valid: false });
  }
  res.json({ valid: true });
});

// POST /api/admin/logout
router.post('/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) sessions.delete(token);
  res.json({ success: true });
});

// Middleware to protect admin routes
export function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const session = sessions.get(token);
  if (session.expires < Date.now()) {
    sessions.delete(token);
    return res.status(401).json({ error: 'Session expired' });
  }
  next();
}

export default router;
