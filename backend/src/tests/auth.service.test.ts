import { describe, it, expect, beforeEach, vi } from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createMockDb } from './helpers.js';
import { login, verifyToken } from '../services/auth.service.js';

const JWT_SECRET = 'test-secret';

describe('AuthService', () => {
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mockDb = createMockDb();
    vi.stubEnv('JWT_SECRET', JWT_SECRET);
  });

  describe('login', () => {
    it('should return a JWT token for valid credentials', async () => {
      const passwordHash = await bcrypt.hash('password123', 10);
      const user = { id: 'uuid-1', email: 'mario@fablab.it', passwordHash, name: 'Mario', role: 'user', createdAt: new Date() };
      mockDb.resolvesWith([user]);

      const result = await login(mockDb.db, 'mario@fablab.it', 'password123');

      expect(result).toBeDefined();
      expect(result!.token).toBeDefined();
      expect(typeof result!.token).toBe('string');

      // Verify token content
      const decoded = jwt.verify(result!.token, JWT_SECRET) as Record<string, unknown>;
      expect(decoded.userId).toBe('uuid-1');
      expect(decoded.email).toBe('mario@fablab.it');
      expect(decoded.role).toBe('user');
    });

    it('should return null for wrong password', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 10);
      const user = { id: 'uuid-1', email: 'mario@fablab.it', passwordHash, name: 'Mario', role: 'user', createdAt: new Date() };
      mockDb.resolvesWith([user]);

      const result = await login(mockDb.db, 'mario@fablab.it', 'wrong-password');

      expect(result).toBeNull();
    });

    it('should return null for non-existent email', async () => {
      mockDb.resolvesWith([]);

      const result = await login(mockDb.db, 'ghost@fablab.it', 'password123');

      expect(result).toBeNull();
    });
  });

  describe('verifyToken', () => {
    it('should return decoded payload for a valid token', () => {
      const payload = { userId: 'uuid-1', email: 'mario@fablab.it', role: 'user' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

      const result = verifyToken(token);

      expect(result).toBeDefined();
      expect(result!.userId).toBe('uuid-1');
      expect(result!.email).toBe('mario@fablab.it');
      expect(result!.role).toBe('user');
    });

    it('should return null for an invalid token', () => {
      const result = verifyToken('this.is.not.a.valid.token');

      expect(result).toBeNull();
    });

    it('should return null for an expired token', () => {
      const payload = { userId: 'uuid-1', email: 'mario@fablab.it', role: 'user' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '0s' });

      const result = verifyToken(token);

      expect(result).toBeNull();
    });

    it('should return null for a token signed with wrong secret', () => {
      const payload = { userId: 'uuid-1', email: 'mario@fablab.it', role: 'user' };
      const token = jwt.sign(payload, 'wrong-secret', { expiresIn: '24h' });

      const result = verifyToken(token);

      expect(result).toBeNull();
    });
  });
});
