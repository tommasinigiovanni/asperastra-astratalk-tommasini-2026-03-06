import { describe, it, expect, beforeEach, vi } from 'vitest';
import bcrypt from 'bcrypt';
import { createMockDb } from './helpers.js';
import { createUser, listUsers, getUserById, getUserByEmail } from '../services/user.service.js';

describe('UserService', () => {
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mockDb = createMockDb();
  });

  describe('createUser', () => {
    it('should hash the password and return the user without password_hash', async () => {
      const input = { email: 'mario@fablab.it', password: 'password123', name: 'Mario Rossi', role: 'user' as const };
      const dbUser = {
        id: 'uuid-1',
        email: input.email,
        passwordHash: '$2b$10$hashedvalue',
        name: input.name,
        role: input.role,
        createdAt: new Date(),
      };
      mockDb.resolvesWith([dbUser]);

      const result = await createUser(mockDb.db, input);

      expect(result).toBeDefined();
      expect(result.email).toBe(input.email);
      expect(result.name).toBe(input.name);
      expect(result.role).toBe('user');
      // password_hash must not be returned
      expect((result as Record<string, unknown>).passwordHash).toBeUndefined();
      expect((result as Record<string, unknown>).password).toBeUndefined();
      // bcrypt was called
      expect(mockDb.db.insert).toHaveBeenCalled();
    });

    it('should use bcrypt to hash the password', async () => {
      const spy = vi.spyOn(bcrypt, 'hash');
      const input = { email: 'test@fablab.it', password: 'mypassword', name: 'Test', role: 'user' as const };
      const dbUser = { id: 'uuid-2', email: input.email, passwordHash: 'hashed', name: input.name, role: 'user', createdAt: new Date() };
      mockDb.resolvesWith([dbUser]);

      await createUser(mockDb.db, input);

      expect(spy).toHaveBeenCalledWith('mypassword', 10);
      spy.mockRestore();
    });
  });

  describe('listUsers', () => {
    it('should return all users without password hashes', async () => {
      const users = [
        { id: 'uuid-1', email: 'a@b.it', passwordHash: 'hash1', name: 'A', role: 'admin', createdAt: new Date() },
        { id: 'uuid-2', email: 'c@d.it', passwordHash: 'hash2', name: 'C', role: 'user', createdAt: new Date() },
      ];
      mockDb.resolvesWith(users);

      const result = await listUsers(mockDb.db);

      expect(result).toHaveLength(2);
      result.forEach((u) => {
        expect((u as Record<string, unknown>).passwordHash).toBeUndefined();
      });
    });
  });

  describe('getUserById', () => {
    it('should return the user by id', async () => {
      const user = { id: 'uuid-1', email: 'a@b.it', passwordHash: 'hash', name: 'A', role: 'admin', createdAt: new Date() };
      mockDb.resolvesWith([user]);

      const result = await getUserById(mockDb.db, 'uuid-1');

      expect(result).toBeDefined();
      expect(result!.id).toBe('uuid-1');
    });

    it('should return undefined when user not found', async () => {
      mockDb.resolvesWith([]);

      const result = await getUserById(mockDb.db, 'non-existent');

      expect(result).toBeUndefined();
    });
  });

  describe('getUserByEmail', () => {
    it('should return the user by email', async () => {
      const user = { id: 'uuid-1', email: 'mario@fablab.it', passwordHash: 'hash', name: 'Mario', role: 'user', createdAt: new Date() };
      mockDb.resolvesWith([user]);

      const result = await getUserByEmail(mockDb.db, 'mario@fablab.it');

      expect(result).toBeDefined();
      expect(result!.email).toBe('mario@fablab.it');
    });

    it('should return undefined for non-existent email', async () => {
      mockDb.resolvesWith([]);

      const result = await getUserByEmail(mockDb.db, 'nope@fablab.it');

      expect(result).toBeUndefined();
    });
  });
});
