import { eq } from 'drizzle-orm';
import { printers } from '../db/schema.js';
import type { Database } from '../db/index.js';
import type { CreatePrinterInput, UpdatePrinterStatusInput } from '../models/printer.js';

export async function listPrinters(db: Database) {
  return db.select().from(printers);
}

export async function getPrinterById(db: Database, id: string) {
  const [printer] = await db.select().from(printers).where(eq(printers.id, id));
  return printer ?? null;
}

export async function createPrinter(db: Database, input: CreatePrinterInput) {
  const [printer] = await db.insert(printers).values(input).returning();
  return printer;
}

export async function updatePrinterStatus(db: Database, id: string, input: UpdatePrinterStatusInput) {
  const [printer] = await db
    .update(printers)
    .set(input)
    .where(eq(printers.id, id))
    .returning();
  return printer;
}
