import { Router } from 'express';
import { loginSchema } from '../models/user.js';
import { login } from '../services/auth.service.js';
import { getUserById } from '../services/user.service.js';
import { db } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login — public
router.post('/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const result = await login(db, parsed.data.email, parsed.data.password);
    if (!result) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me — authenticated
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await getUserById(db, req.user!.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { passwordHash: _, ...safe } = user;
    res.json(safe);
  } catch (err) {
    next(err);
  }
});

export default router;
