import { Router } from 'express';
import { createPrinterSchema, updatePrinterStatusSchema } from '../models/printer.js';
import { listPrinters, getPrinterById, createPrinter, updatePrinterStatus } from '../services/printer.service.js';
import { db } from '../db/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { applyRefineParams } from './refine.js';

const router = Router();

// All printer routes require authentication
router.use(authenticate);

// GET /api/printers
router.get('/', async (req, res, next) => {
  try {
    const printers = await listPrinters(db);
    const result = applyRefineParams(req, res, printers);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/printers/:id
router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const printer = await getPrinterById(db, id);
    if (!printer) {
      res.status(404).json({ error: 'Printer not found' });
      return;
    }
    res.json(printer);
  } catch (err) {
    next(err);
  }
});

// POST /api/printers — admin only
router.post('/', authorize('admin'), async (req, res, next) => {
  try {
    const parsed = createPrinterSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const printer = await createPrinter(db, parsed.data);
    res.status(201).json(printer);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/printers/:id — admin only
router.patch('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const parsed = updatePrinterStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const id = req.params.id as string;
    const printer = await updatePrinterStatus(db, id, parsed.data);
    if (!printer) {
      res.status(404).json({ error: 'Printer not found' });
      return;
    }

    res.json(printer);
  } catch (err) {
    next(err);
  }
});

export default router;
