import { vi } from 'vitest';
import type { Database } from '../db/index.js';

/**
 * Creates a mock Drizzle database that supports chainable query builders.
 * Use `resolvesWith` to set what a query chain returns.
 *
 * Usage:
 *   const { db, resolvesWith } = createMockDb();
 *   resolvesWith([{ id: '1', name: 'Printer' }]);
 *   const result = await listPrinters(db);
 */
export function createMockDb() {
  let resolvedValue: unknown = [];

  const returning = vi.fn(() => Promise.resolve(resolvedValue));

  const chain: Record<string, ReturnType<typeof vi.fn>> = {
    from: vi.fn(function () {
      const promise = Promise.resolve(resolvedValue);
      return Object.assign(promise, { where: chain.where, limit: chain.limit });
    }),
    where: vi.fn(function () { return Object.assign(Promise.resolve(resolvedValue), { returning }); }),
    values: vi.fn(function () { return { returning, onConflictDoNothing: vi.fn(() => ({ returning })) }; }),
    set: vi.fn(function () { return { where: chain.where }; }),
    limit: vi.fn(function () { return Promise.resolve(resolvedValue); }),
  };

  const db = {
    select: vi.fn(() => ({ from: chain.from })),
    insert: vi.fn(() => ({ values: chain.values })),
    update: vi.fn(() => ({ set: chain.set })),
    delete: vi.fn(() => ({ where: chain.where })),
  } as unknown as Database;

  function resolvesWith(value: unknown) {
    resolvedValue = value;
  }

  return { db, chain, returning, resolvesWith };
}
