import { Router } from 'express';
import { createBookingSchema } from '../models/booking.js';
import { createBooking, listBookings, cancelBooking, getAvailability } from '../services/booking.service.js';
import { db } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All booking routes require authentication
router.use(authenticate);

// GET /api/bookings
router.get('/', async (req, res, next) => {
  try {
    const filters: { userId?: string; printerId?: string } = {};

    // User sees only own bookings, admin sees all
    if (req.user!.role !== 'admin') {
      filters.userId = req.user!.userId;
    }

    if (typeof req.query.printerId === 'string') {
      filters.printerId = req.query.printerId;
    }

    const bookings = await listBookings(db, filters);
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

// POST /api/bookings
router.post('/', async (req, res, next) => {
  try {
    const parsed = createBookingSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const booking = await createBooking(db, req.user!.userId, parsed.data);
    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/bookings/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const booking = await cancelBooking(db, req.params.id, req.user!.userId, req.user!.role);
    res.json(booking);
  } catch (err) {
    next(err);
  }
});

// GET /api/bookings/availability/:printerId
router.get('/availability/:printerId', async (req, res, next) => {
  try {
    const date = typeof req.query.date === 'string' ? req.query.date : new Date().toISOString().slice(0, 10);
    const bookings = await getAvailability(db, req.params.printerId, date);
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

export default router;
