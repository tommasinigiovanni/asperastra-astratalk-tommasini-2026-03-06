import { describe, it, expect } from 'vitest';
import { createPrinterSchema, updatePrinterStatusSchema } from '../models/printer.js';
import { createBookingSchema } from '../models/booking.js';
import { createUserSchema, loginSchema } from '../models/user.js';

describe('Printer schemas', () => {
  describe('createPrinterSchema', () => {
    it('should accept a valid printer name', () => {
      const result = createPrinterSchema.safeParse({ name: 'Prusa MK4 #1' });
      expect(result.success).toBe(true);
    });

    it('should reject an empty name', () => {
      const result = createPrinterSchema.safeParse({ name: '' });
      expect(result.success).toBe(false);
    });

    it('should reject missing name', () => {
      const result = createPrinterSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('updatePrinterStatusSchema', () => {
    it('should accept status active', () => {
      const result = updatePrinterStatusSchema.safeParse({ status: 'active' });
      expect(result.success).toBe(true);
    });

    it('should accept status maintenance', () => {
      const result = updatePrinterStatusSchema.safeParse({ status: 'maintenance' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid status', () => {
      const result = updatePrinterStatusSchema.safeParse({ status: 'broken' });
      expect(result.success).toBe(false);
    });
  });
});

describe('Booking schemas', () => {
  describe('createBookingSchema', () => {
    it('should accept a valid booking', () => {
      const result = createBookingSchema.safeParse({
        printerId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        startTime: '2026-04-01T10:00:00Z',
        endTime: '2026-04-01T12:00:00Z',
        notes: 'PLA grande',
      });
      expect(result.success).toBe(true);
    });

    it('should accept a booking without notes', () => {
      const result = createBookingSchema.safeParse({
        printerId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        startTime: '2026-04-01T10:00:00Z',
        endTime: '2026-04-01T12:00:00Z',
      });
      expect(result.success).toBe(true);
    });

    it('should reject when start_time >= end_time', () => {
      const result = createBookingSchema.safeParse({
        printerId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        startTime: '2026-04-01T12:00:00Z',
        endTime: '2026-04-01T10:00:00Z',
      });
      expect(result.success).toBe(false);
    });

    it('should reject slot shorter than 30 minutes', () => {
      const result = createBookingSchema.safeParse({
        printerId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        startTime: '2026-04-01T10:00:00Z',
        endTime: '2026-04-01T10:20:00Z',
      });
      expect(result.success).toBe(false);
    });

    it('should accept slot of exactly 30 minutes', () => {
      const result = createBookingSchema.safeParse({
        printerId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        startTime: '2026-04-01T10:00:00Z',
        endTime: '2026-04-01T10:30:00Z',
      });
      expect(result.success).toBe(true);
    });

    it('should reject slot longer than 8 hours', () => {
      const result = createBookingSchema.safeParse({
        printerId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        startTime: '2026-04-01T10:00:00Z',
        endTime: '2026-04-01T18:01:00Z',
      });
      expect(result.success).toBe(false);
    });

    it('should accept slot of exactly 8 hours', () => {
      const result = createBookingSchema.safeParse({
        printerId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        startTime: '2026-04-01T10:00:00Z',
        endTime: '2026-04-01T18:00:00Z',
      });
      expect(result.success).toBe(true);
    });

    it('should reject non-ISO date strings', () => {
      const result = createBookingSchema.safeParse({
        printerId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        startTime: '01/04/2026 10:00',
        endTime: '01/04/2026 12:00',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid UUID for printerId', () => {
      const result = createBookingSchema.safeParse({
        printerId: 'not-a-uuid',
        startTime: '2026-04-01T10:00:00Z',
        endTime: '2026-04-01T12:00:00Z',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('User schemas', () => {
  describe('createUserSchema', () => {
    it('should accept a valid user', () => {
      const result = createUserSchema.safeParse({
        email: 'mario@fablab.it',
        password: 'password123',
        name: 'Mario Rossi',
        role: 'user',
      });
      expect(result.success).toBe(true);
    });

    it('should accept admin role', () => {
      const result = createUserSchema.safeParse({
        email: 'admin@fablab.it',
        password: 'securepass',
        name: 'Admin',
        role: 'admin',
      });
      expect(result.success).toBe(true);
    });

    it('should default to user role when not provided', () => {
      const result = createUserSchema.safeParse({
        email: 'mario@fablab.it',
        password: 'password123',
        name: 'Mario Rossi',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe('user');
      }
    });

    it('should reject invalid email', () => {
      const result = createUserSchema.safeParse({
        email: 'not-an-email',
        password: 'password123',
        name: 'Mario',
      });
      expect(result.success).toBe(false);
    });

    it('should reject password shorter than 8 characters', () => {
      const result = createUserSchema.safeParse({
        email: 'mario@fablab.it',
        password: 'short',
        name: 'Mario',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid role', () => {
      const result = createUserSchema.safeParse({
        email: 'mario@fablab.it',
        password: 'password123',
        name: 'Mario',
        role: 'superadmin',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty name', () => {
      const result = createUserSchema.safeParse({
        email: 'mario@fablab.it',
        password: 'password123',
        name: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should accept valid login credentials', () => {
      const result = loginSchema.safeParse({
        email: 'mario@fablab.it',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email on login', () => {
      const result = loginSchema.safeParse({
        email: 'bad-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty password on login', () => {
      const result = loginSchema.safeParse({
        email: 'mario@fablab.it',
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });
});
