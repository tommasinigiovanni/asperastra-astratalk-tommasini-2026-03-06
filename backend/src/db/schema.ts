import { pgTable, uuid, varchar, text, timestamp, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 10 }).notNull().default('user'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const printers = pgTable('printers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  status: varchar('status', { length: 15 }).notNull().default('active'),
});

export const bookings = pgTable(
  'bookings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    printerId: uuid('printer_id').notNull().references(() => printers.id),
    userId: uuid('user_id').notNull().references(() => users.id),
    startTime: timestamp('start_time', { withTimezone: true }).notNull(),
    endTime: timestamp('end_time', { withTimezone: true }).notNull(),
    notes: text('notes').default(''),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_bookings_printer_time').on(table.printerId, table.startTime, table.endTime),
    index('idx_bookings_user').on(table.userId),
    check('start_before_end', sql`${table.startTime} < ${table.endTime}`),
  ],
);
