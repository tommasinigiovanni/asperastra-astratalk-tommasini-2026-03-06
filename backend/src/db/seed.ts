import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db, pool } from './index.js';
import { users, printers } from './schema.js';

const SALT_ROUNDS = 10;

async function seed() {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@asperastra.it';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin1234';

  // Seed admin user
  const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail));
  if (existingAdmin.length === 0) {
    const passwordHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);
    await db.insert(users).values({
      email: adminEmail,
      passwordHash,
      name: 'Admin',
      role: 'admin',
    });
    console.log(`[SEED] Admin user created: ${adminEmail}`);
  } else {
    console.log(`[SEED] Admin user already exists: ${adminEmail}`);
  }

  // Seed default printers
  const defaultPrinters = ['Prusa MK4 #1', 'Prusa MK4 #2'];
  for (const name of defaultPrinters) {
    const existing = await db.select().from(printers).where(eq(printers.name, name));
    if (existing.length === 0) {
      await db.insert(printers).values({ name, status: 'active' });
      console.log(`[SEED] Printer created: ${name}`);
    } else {
      console.log(`[SEED] Printer already exists: ${name}`);
    }
  }

  await pool.end();
  console.log('[SEED] Done');
}

seed().catch((err) => {
  console.error('[SEED] Failed:', err);
  process.exit(1);
});
