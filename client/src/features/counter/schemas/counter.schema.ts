import { z } from 'zod';
import { CounterStatus } from '../types';

export const counterFormSchema = z.object({
  branchId: z.string({ required_error: 'Branch selection is required' }).uuid('Invalid Branch ID'),
  name: z
    .string({ required_error: 'Counter name is required' })
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),
  number: z.coerce
    .number({ invalid_type_error: 'Counter number must be a number' })
    .int('Must be an integer')
    .min(1, 'Counter number must be at least 1'),
  status: z.enum(['OPEN', 'PAUSED', 'CLOSED', 'MAINTENANCE'] as [CounterStatus, ...CounterStatus[]]).default('CLOSED'),
  isActive: z.boolean().default(true),
});

export type CounterFormValues = z.infer<typeof counterFormSchema>;
