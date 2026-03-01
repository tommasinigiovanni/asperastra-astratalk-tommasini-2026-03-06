import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import printerRoutes from './routes/printer.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import { ServiceError } from './services/errors.js';

const app = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/printers', printerRoutes);
app.use('/api/bookings', bookingRoutes);

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ServiceError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error('[ERROR]', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`[SERVER] listening on port ${port}`);
});

export default app;
