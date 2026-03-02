import { and, eq, lt, gt } from 'drizzle-orm';
import { bookings, printers } from '../db/schema.js';
import type { Database } from '../db/index.js';
import type { CreateBookingInput } from '../models/booking.js';
import { ServiceError } from './errors.js';

export async function createBooking(
  db: Database,
  userId: string,
  input: CreateBookingInput,
) {
  const startTime = new Date(input.startTime);
  const endTime = new Date(input.endTime);

  // 1. No booking in the past
  if (startTime <= new Date()) {
    throw new ServiceError(400, 'Cannot book in the past');
  }

  // 2. Printer must exist and be active
  const [printer] = await db
    .select()
    .from(printers)
    .where(eq(printers.id, input.printerId));

  if (!printer) {
    throw new ServiceError(404, 'Printer not found');
  }

  if (printer.status === 'maintenance') {
    throw new ServiceError(400, 'Printer is in maintenance');
  }

  // 3. Check for overlapping bookings
  // Overlap condition: existing.start < new.end AND existing.end > new.start
  const overlapping = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.printerId, input.printerId),
        lt(bookings.startTime, endTime),
        gt(bookings.endTime, startTime),
      ),
    );

  if (overlapping.length > 0) {
    throw new ServiceError(409, 'Slot overlaps with an existing booking');
  }

  // 4. Insert booking
  const [booking] = await db
    .insert(bookings)
    .values({
      printerId: input.printerId,
      userId,
      startTime,
      endTime,
      notes: input.notes ?? '',
    })
    .returning();

  console.log(
    `[BOOKING] action=create printer=${input.printerId} user=${userId} slot=${input.startTime}/${input.endTime}`,
  );

  return booking;
}

export async function getBookingById(db: Database, id: string) {
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
  return booking ?? null;
}

export async function listBookings(
  db: Database,
  filters: { userId?: string; printerId?: string },
) {
  const conditions = [];

  if (filters.userId) {
    conditions.push(eq(bookings.userId, filters.userId));
  }

  if (filters.printerId) {
    conditions.push(eq(bookings.printerId, filters.printerId));
  }

  if (conditions.length > 0) {
    return db.select().from(bookings).where(and(...conditions));
  }

  return db.select().from(bookings);
}

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

export async function cancelBooking(
  db: Database,
  bookingId: string,
  userId: string,
  role: string,
) {
  // 1. Booking must exist
  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId));

  if (!booking) {
    throw new ServiceError(404, 'Booking not found');
  }

  // 2. Ownership check (user can only cancel own, admin can cancel any)
  if (role !== 'admin' && booking.userId !== userId) {
    throw new ServiceError(403, 'Insufficient permission to cancel this booking');
  }

  // 3. 15-minute rule
  const msUntilStart = booking.startTime.getTime() - Date.now();
  if (msUntilStart <= FIFTEEN_MINUTES_MS) {
    throw new ServiceError(409, 'Too late to cancel — less than 15 minutes before start');
  }

  // 4. Delete
  await db.delete(bookings).where(eq(bookings.id, bookingId));

  console.log(
    `[BOOKING] action=cancel booking=${bookingId} user=${userId} role=${role}`,
  );

  return booking;
}

export async function getAvailability(
  db: Database,
  printerId: string,
  date: string,
) {
  const dayStart = new Date(`${date}T00:00:00Z`);
  const dayEnd = new Date(`${date}T23:59:59Z`);

  const dayBookings = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.printerId, printerId),
        lt(bookings.startTime, dayEnd),
        gt(bookings.endTime, dayStart),
      ),
    );

  return dayBookings;
}
