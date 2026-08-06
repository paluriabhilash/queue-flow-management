import { z } from 'zod';
import { PriorityLevelEnum } from '@prisma/client';

const serviceCodeRegex = /^[A-Z0-9_-]+$/;

export const createServiceSchema = z.object({
  body: z.object({
    branchId: z.string({ required_error: 'Branch ID is required' }).uuid('Invalid Branch ID'),
    name: z
      .string({ required_error: 'Service name is required' })
      .min(2, 'Service name must be at least 2 characters long')
      .max(100, 'Service name cannot exceed 100 characters')
      .trim(),
    code: z
      .string({ required_error: 'Service code is required' })
      .min(2, 'Service code must be at least 2 characters long')
      .max(20, 'Service code cannot exceed 20 characters')
      .toUpperCase()
      .regex(serviceCodeRegex, 'Service code can only contain uppercase letters, numbers, hyphens, and underscores'),
    description: z.string().max(255, 'Description cannot exceed 255 characters').optional(),
    avgServiceTime: z
      .number({ required_error: 'Average service duration is required' })
      .int('Average service duration must be an integer')
      .min(1, 'Average service duration must be a positive integer'),
    priority: z.nativeEnum(PriorityLevelEnum).optional().default(PriorityLevelEnum.NORMAL),
  }),
});

export const updateServiceSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Service ID parameter'),
  }),
  body: z.object({
    name: z.string().min(2).max(100).trim().optional(),
    description: z.string().max(255).optional(),
    avgServiceTime: z.number().int().min(1, 'Average service duration must be at least 1').optional(),
    priority: z.nativeEnum(PriorityLevelEnum).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getServiceSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Service ID parameter'),
  }),
});
