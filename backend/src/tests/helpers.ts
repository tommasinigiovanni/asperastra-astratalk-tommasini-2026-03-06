import { vi } from 'vitest';
import type { Database } from '../db/index.js';

/**
 * Creates a mock Drizzle database that supports chainable query builders.
 *
 * Two modes:
 * - `resolvesWith(value)` — all queries return the same value (simple CRUD tests)
 * - `setResults(v1, v2, v3)` — each db operation (select/insert/update/delete)
 *    advances to the next result in the queue (multi-query service tests)
 */
export function createMockDb() {
  const queue: unknown[] = [];
  let queueIndex = 0;
  let defaultValue: unknown = [];
  let currentResult: unknown = [];

  function startChain() {
    if (queueIndex < queue.length) {
      currentResult = queue[queueIndex++];
    } else {
      currentResult = defaultValue;
    }
  }

  const returning = vi.fn(() => Promise.resolve(currentResult));

  const chain: Record<string, ReturnType<typeof vi.fn>> = {
    from: vi.fn(function () {
      const promise = Promise.resolve(currentResult);
      return Object.assign(promise, { where: chain.where, limit: chain.limit });
    }),
    where: vi.fn(function () {
      return Object.assign(Promise.resolve(currentResult), { returning });
    }),
    values: vi.fn(function () {
      return { returning, onConflictDoNothing: vi.fn(() => ({ returning })) };
    }),
    set: vi.fn(function () {
      return { where: chain.where };
    }),
    limit: vi.fn(function () {
      return Promise.resolve(currentResult);
    }),
  };

  const db = {
    select: vi.fn(() => { startChain(); return { from: chain.from }; }),
    insert: vi.fn(() => { startChain(); return { values: chain.values }; }),
    update: vi.fn(() => { startChain(); return { set: chain.set }; }),
    delete: vi.fn(() => { startChain(); return { where: chain.where }; }),
  } as unknown as Database;

  /** All queries return the same value (backward compatible). */
  function resolvesWith(value: unknown) {
    defaultValue = value;
    currentResult = value;
    queue.length = 0;
    queueIndex = 0;
  }

  /** Each db.select/insert/update/delete call consumes the next result. */
  function setResults(...values: unknown[]) {
    queue.length = 0;
    queue.push(...values);
    queueIndex = 0;
  }

  return { db, chain, returning, resolvesWith, setResults };
}
