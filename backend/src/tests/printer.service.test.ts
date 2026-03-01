import { describe, it, expect, beforeEach } from 'vitest';
import { createMockDb } from './helpers.js';
import { listPrinters, createPrinter, updatePrinterStatus } from '../services/printer.service.js';

describe('PrinterService', () => {
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mockDb = createMockDb();
  });

  describe('listPrinters', () => {
    it('should return all printers', async () => {
      const printers = [
        { id: 'uuid-1', name: 'Prusa MK4 #1', status: 'active' },
        { id: 'uuid-2', name: 'Prusa MK4 #2', status: 'maintenance' },
      ];
      mockDb.resolvesWith(printers);

      const result = await listPrinters(mockDb.db);

      expect(result).toEqual(printers);
      expect(mockDb.db.select).toHaveBeenCalled();
    });

    it('should return empty array when no printers exist', async () => {
      mockDb.resolvesWith([]);

      const result = await listPrinters(mockDb.db);

      expect(result).toEqual([]);
    });
  });

  describe('createPrinter', () => {
    it('should create and return a new printer', async () => {
      const newPrinter = { id: 'uuid-3', name: 'Ender 3 V3', status: 'active' };
      mockDb.resolvesWith([newPrinter]);

      const result = await createPrinter(mockDb.db, { name: 'Ender 3 V3' });

      expect(result).toEqual(newPrinter);
      expect(mockDb.db.insert).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });
  });

  describe('updatePrinterStatus', () => {
    it('should update status and return the printer', async () => {
      const updated = { id: 'uuid-1', name: 'Prusa MK4 #1', status: 'maintenance' };
      mockDb.resolvesWith([updated]);

      const result = await updatePrinterStatus(mockDb.db, 'uuid-1', { status: 'maintenance' });

      expect(result).toEqual(updated);
      expect(mockDb.db.update).toHaveBeenCalled();
    });

    it('should return undefined when printer not found', async () => {
      mockDb.resolvesWith([]);

      const result = await updatePrinterStatus(mockDb.db, 'non-existent', { status: 'active' });

      expect(result).toBeUndefined();
    });
  });
});
