import { z } from 'zod';
import { PriorityLevel } from '../types';

const serviceCodeRegex = /^[A-Z0-9_-]+$/;

export const serviceFormSchema = z.object({
  branchId: z.string({ required_error: 'Branch selection is required' }).uuid('Invalid Branch ID'),
  name: z
    .string({ required_error: 'Service name is required' })
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),
  code: z
    .string({ required_error: 'Service code is required' })
    .min(2, 'Code must be at least 2 characters long')
    .max(20, 'Code cannot exceed 20 characters')
    .toUpperCase()
    .regex(serviceCodeRegex, 'Uppercase letters, numbers, hyphens only'),
  description: z.string().max(255, 'Description is too long').optional(),
  avgServiceTime: z.coerce
    .number({ invalid_type_error: 'Duration must be a number' })
    .int('Duration must be an integer')
    .min(1, 'Duration must be at least 1 minute'),
  priority: z.enum(['NORMAL', 'SENIOR_CITIZEN', 'EMERGENCY', 'VIP'] as [PriorityLevel, ...PriorityLevel[]]).default('NORMAL'),
  isActive: z.boolean().default(true),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
