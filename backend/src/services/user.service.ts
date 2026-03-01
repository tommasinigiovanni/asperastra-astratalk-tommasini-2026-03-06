import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema.js';
import type { Database } from '../db/index.js';
import type { CreateUserInput } from '../models/user.js';

const SALT_ROUNDS = 10;

function omitPasswordHash<T extends { passwordHash: string }>(user: T) {
  const { passwordHash: _, ...safe } = user;
  return safe;
}

export async function createUser(db: Database, input: CreateUserInput) {
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const [user] = await db
    .insert(users)
    .values({
      email: input.email,
      passwordHash,
      name: input.name,
      role: input.role,
    })
    .returning();
  return omitPasswordHash(user);
}

export async function listUsers(db: Database) {
  const rows = await db.select().from(users);
  return rows.map(omitPasswordHash);
}

export async function getUserById(db: Database, id: string) {
  const rows = await db.select().from(users).where(eq(users.id, id));
  return rows[0];
}

export async function getUserByEmail(db: Database, email: string) {
  const rows = await db.select().from(users).where(eq(users.email, email));
  return rows[0];
}
