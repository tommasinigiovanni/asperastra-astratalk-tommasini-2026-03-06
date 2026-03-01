import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from './index.js';

async function runMigrations() {
  console.log('[DB] Running migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('[DB] Migrations completed');
  await pool.end();
}

runMigrations().catch((err) => {
  console.error('[DB] Migration failed:', err);
  process.exit(1);
});
