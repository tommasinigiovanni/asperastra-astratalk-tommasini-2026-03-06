import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createMockDb } from './helpers.js';
import {
  createBooking,
  cancelBooking,
  listBookings,
} from '../services/booking.service.js';
import { ServiceError } from '../services/errors.js';

// Fixed "now" for all tests: 2026-04-01 09:00 UTC
const NOW = new Date('2026-04-01T09:00:00Z');

const PRINTER_ACTIVE = { id: 'printer-1', name: 'Prusa MK4 #1', status: 'active' };
const PRINTER_MAINTENANCE = { id: 'printer-2', name: 'Prusa MK4 #2', status: 'maintenance' };

function futureBookingInput(overrides?: Record<string, unknown>) {
  return {
    printerId: 'printer-1',
    startTime: '2026-04-01T10:00:00Z',
    endTime: '2026-04-01T12:00:00Z',
    notes: '',
    ...overrides,
  };
}

function existingBooking(overrides?: Record<string, unknown>) {
  return {
    id: 'booking-1',
    printerId: 'printer-1',
    userId: 'user-1',
    startTime: new Date('2026-04-01T10:00:00Z'),
    endTime: new Date('2026-04-01T12:00:00Z'),
    notes: '',
    createdAt: new Date(),
    ...overrides,
  };
}

describe('BookingService', () => {
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mockDb = createMockDb();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ─── createBooking ────────────────────────────────────────────

  describe('createBooking', () => {
    it('should create a valid booking', async () => {
      const newBooking = existingBooking();
      // 1. select printer → active  2. select overlaps → none  3. insert → booking
      mockDb.setResults([PRINTER_ACTIVE], [], [newBooking]);

      const result = await createBooking(mockDb.db, 'user-1', futureBookingInput());

      expect(result).toEqual(newBooking);
      expect(mockDb.db.insert).toHaveBeenCalled();
    });

    it('should reject booking in the past', async () => {
      const input = futureBookingInput({
        startTime: '2026-03-31T08:00:00Z', // yesterday
        endTime: '2026-03-31T10:00:00Z',
      });

      await expect(createBooking(mockDb.db, 'user-1', input))
        .rejects.toThrow(ServiceError);
      await expect(createBooking(mockDb.db, 'user-1', input))
        .rejects.toThrow(/past/i);
    });

    it('should reject booking on non-existent printer', async () => {
      mockDb.setResults([]); // printer not found

      await expect(createBooking(mockDb.db, 'user-1', futureBookingInput()))
        .rejects.toThrow(ServiceError);
      // Verify it's a 404
      try {
        mockDb.setResults([]);
        await createBooking(mockDb.db, 'user-1', futureBookingInput());
      } catch (e) {
        expect((e as ServiceError).statusCode).toBe(404);
      }
    });

    it('should reject booking on maintenance printer', async () => {
      mockDb.setResults([PRINTER_MAINTENANCE]);

      await expect(
        createBooking(mockDb.db, 'user-1', futureBookingInput({ printerId: 'printer-2' })),
      ).rejects.toThrow(/maintenance/i);

      // Verify it's a 400
      try {
        mockDb.setResults([PRINTER_MAINTENANCE]);
        await createBooking(mockDb.db, 'user-1', futureBookingInput({ printerId: 'printer-2' }));
      } catch (e) {
        expect((e as ServiceError).statusCode).toBe(400);
      }
    });

    // ─── Overlap tests (AI_RULES mandates these) ─────────────

    it('should reject total overlap (new slot inside existing)', async () => {
      // Existing: 10:00–14:00, New: 11:00–13:00
      const existing = existingBooking({
        startTime: new Date('2026-04-01T10:00:00Z'),
        endTime: new Date('2026-04-01T14:00:00Z'),
      });
      mockDb.setResults([PRINTER_ACTIVE], [existing]);

      await expect(
        createBooking(mockDb.db, 'user-1', futureBookingInput({
          startTime: '2026-04-01T11:00:00Z',
          endTime: '2026-04-01T13:00:00Z',
        })),
      ).rejects.toThrow(/overlap/i);
    });

    it('should reject partial overlap at start (new starts before, ends during)', async () => {
      // Existing: 11:00–13:00, New: 10:00–12:00
      const existing = existingBooking({
        startTime: new Date('2026-04-01T11:00:00Z'),
        endTime: new Date('2026-04-01T13:00:00Z'),
      });
      mockDb.setResults([PRINTER_ACTIVE], [existing]);

      await expect(
        createBooking(mockDb.db, 'user-1', futureBookingInput({
          startTime: '2026-04-01T10:00:00Z',
          endTime: '2026-04-01T12:00:00Z',
        })),
      ).rejects.toThrow(/overlap/i);
    });

    it('should reject partial overlap at end (new starts during, ends after)', async () => {
      // Existing: 10:00–12:00, New: 11:00–13:00
      const existing = existingBooking({
        startTime: new Date('2026-04-01T10:00:00Z'),
        endTime: new Date('2026-04-01T12:00:00Z'),
      });
      mockDb.setResults([PRINTER_ACTIVE], [existing]);

      await expect(
        createBooking(mockDb.db, 'user-1', futureBookingInput({
          startTime: '2026-04-01T11:00:00Z',
          endTime: '2026-04-01T13:00:00Z',
        })),
      ).rejects.toThrow(/overlap/i);
    });

    it('should allow adjacent bookings (end equals start)', async () => {
      // Existing: 10:00–12:00, New: 12:00–14:00 → OK, no overlap
      mockDb.setResults([PRINTER_ACTIVE], [], [existingBooking({
        id: 'booking-new',
        startTime: new Date('2026-04-01T12:00:00Z'),
        endTime: new Date('2026-04-01T14:00:00Z'),
      })]);

      const result = await createBooking(mockDb.db, 'user-1', futureBookingInput({
        startTime: '2026-04-01T12:00:00Z',
        endTime: '2026-04-01T14:00:00Z',
      }));

      expect(result).toBeDefined();
      expect(result.id).toBe('booking-new');
    });
  });

  // ─── cancelBooking ────────────────────────────────────────────

  describe('cancelBooking', () => {
    it('should cancel own booking when more than 15 min before start', async () => {
      // Now: 09:00, booking starts at 10:00 → 60 min ahead → OK
      const booking = existingBooking({ userId: 'user-1' });
      mockDb.setResults([booking]); // select booking, then delete

      const result = await cancelBooking(mockDb.db, 'booking-1', 'user-1', 'user');

      expect(result).toBeDefined();
      expect(mockDb.db.delete).toHaveBeenCalled();
    });

    it('should reject cancellation when less than 15 min before start', async () => {
      // Now: 09:50, booking starts at 10:00 → 10 min ahead → TOO LATE
      vi.setSystemTime(new Date('2026-04-01T09:50:00Z'));
      const booking = existingBooking({ userId: 'user-1' });
      mockDb.setResults([booking]);

      await expect(cancelBooking(mockDb.db, 'booking-1', 'user-1', 'user'))
        .rejects.toThrow(/too late/i);

      try {
        mockDb.setResults([booking]);
        await cancelBooking(mockDb.db, 'booking-1', 'user-1', 'user');
      } catch (e) {
        expect((e as ServiceError).statusCode).toBe(409);
      }
    });

    it('should reject when user tries to cancel another user booking', async () => {
      const booking = existingBooking({ userId: 'user-1' });
      mockDb.setResults([booking]);

      await expect(cancelBooking(mockDb.db, 'booking-1', 'user-OTHER', 'user'))
        .rejects.toThrow(/permission/i);

      try {
        mockDb.setResults([booking]);
        await cancelBooking(mockDb.db, 'booking-1', 'user-OTHER', 'user');
      } catch (e) {
        expect((e as ServiceError).statusCode).toBe(403);
      }
    });

    it('should allow admin to cancel any booking', async () => {
      // Admin cancels user-1's booking
      const booking = existingBooking({ userId: 'user-1' });
      mockDb.setResults([booking]);

      const result = await cancelBooking(mockDb.db, 'booking-1', 'admin-id', 'admin');

      expect(result).toBeDefined();
      expect(mockDb.db.delete).toHaveBeenCalled();
    });

    it('should reject cancellation of non-existent booking', async () => {
      mockDb.setResults([]);

      await expect(cancelBooking(mockDb.db, 'non-existent', 'user-1', 'user'))
        .rejects.toThrow(ServiceError);

      try {
        mockDb.setResults([]);
        await cancelBooking(mockDb.db, 'non-existent', 'user-1', 'user');
      } catch (e) {
        expect((e as ServiceError).statusCode).toBe(404);
      }
    });
  });

  // ─── listBookings ─────────────────────────────────────────────

  describe('listBookings', () => {
    it('should return bookings from DB', async () => {
      const bookings = [existingBooking(), existingBooking({ id: 'booking-2' })];
      mockDb.resolvesWith(bookings);

      const result = await listBookings(mockDb.db, {});

      expect(result).toHaveLength(2);
    });
  });
});
