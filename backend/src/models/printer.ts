import { z } from 'zod';

export const createPrinterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export const updatePrinterStatusSchema = z.object({
  status: z.enum(['active', 'maintenance']),
});

export type CreatePrinterInput = z.infer<typeof createPrinterSchema>;
export type UpdatePrinterStatusInput = z.infer<typeof updatePrinterStatusSchema>;
