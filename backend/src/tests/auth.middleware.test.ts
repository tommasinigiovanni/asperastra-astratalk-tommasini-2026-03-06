import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, authorize } from '../middleware/auth.js';

const JWT_SECRET = 'test-secret';

function createMockReqRes(authHeader?: string) {
  const req = {
    headers: authHeader ? { authorization: authHeader } : {},
    user: undefined,
  } as unknown as Request & { user?: { userId: string; email: string; role: string } };

  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;

  const next = vi.fn() as NextFunction;

  return { req, res, next };
}

describe('Auth Middleware', () => {
  beforeEach(() => {
    vi.stubEnv('JWT_SECRET', JWT_SECRET);
  });

  describe('authenticate', () => {
    it('should set req.user and call next with valid token', () => {
      const payload = { userId: 'uuid-1', email: 'mario@fablab.it', role: 'user' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
      const { req, res, next } = createMockReqRes(`Bearer ${token}`);

      authenticate(req, res, next);

      expect(next).toHaveBeenCalled();
      expect((req as unknown as Record<string, unknown>).user).toBeDefined();
      const user = (req as unknown as Record<string, { userId: string; role: string }>).user;
      expect(user.userId).toBe('uuid-1');
      expect(user.role).toBe('user');
    });

    it('should return 401 when no Authorization header', () => {
      const { req, res, next } = createMockReqRes();

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', () => {
      const { req, res, next } = createMockReqRes('Bearer invalid-token');

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when Authorization header has no Bearer prefix', () => {
      const payload = { userId: 'uuid-1', email: 'mario@fablab.it', role: 'user' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
      const { req, res, next } = createMockReqRes(token);

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('should call next when user has required role', () => {
      const payload = { userId: 'uuid-1', email: 'admin@fablab.it', role: 'admin' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
      const { req, res, next } = createMockReqRes(`Bearer ${token}`);

      // Simulate authenticate having run
      (req as unknown as Record<string, unknown>).user = payload;

      authorize('admin')(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 403 when user role does not match', () => {
      const { req, res, next } = createMockReqRes();

      (req as unknown as Record<string, unknown>).user = { userId: 'uuid-1', email: 'user@fablab.it', role: 'user' };

      authorize('admin')(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
      expect(next).not.toHaveBeenCalled();
    });
  });
});
