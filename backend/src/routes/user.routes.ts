import { Router } from 'express';
import { createUserSchema } from '../models/user.js';
import { createUser, listUsers } from '../services/user.service.js';
import { db } from '../db/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { applyRefineParams } from './refine.js';

const router = Router();

// All user routes require admin
router.use(authenticate, authorize('admin'));

// GET /api/users
router.get('/', async (req, res, next) => {
  try {
    const users = await listUsers(db);
    const result = applyRefineParams(req, res, users);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/users
router.post('/', async (req, res, next) => {
  try {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const user = await createUser(db, parsed.data);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

export default router;
