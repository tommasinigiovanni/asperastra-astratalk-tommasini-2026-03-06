import { z } from 'zod';

const MIN_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const MAX_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours

const isoDateString = z.string().refine(
  (val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(val);
  },
  { message: 'Must be a valid ISO 8601 date string' },
);

export const createBookingSchema = z
  .object({
    printerId: z.string().uuid('Invalid printer ID'),
    startTime: isoDateString,
    endTime: isoDateString,
    notes: z.string().optional().default(''),
  })
  .refine(
    (data) => new Date(data.startTime) < new Date(data.endTime),
    { message: 'start_time must be before end_time', path: ['startTime'] },
  )
  .refine(
    (data) => {
      const duration = new Date(data.endTime).getTime() - new Date(data.startTime).getTime();
      return duration >= MIN_DURATION_MS;
    },
    { message: 'Slot must be at least 30 minutes', path: ['endTime'] },
  )
  .refine(
    (data) => {
      const duration = new Date(data.endTime).getTime() - new Date(data.startTime).getTime();
      return duration <= MAX_DURATION_MS;
    },
    { message: 'Slot must be at most 8 hours', path: ['endTime'] },
  );

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
