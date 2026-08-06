import { z } from 'zod';
import { CounterStatusEnum } from '@prisma/client';

export const createCounterSchema = z.object({
  body: z.object({
    branchId: z.string({ required_error: 'Branch ID is required' }).uuid('Invalid Branch ID'),
    name: z
      .string({ required_error: 'Counter name is required' })
      .min(2, 'Counter name must be at least 2 characters long')
      .max(100, 'Counter name cannot exceed 100 characters')
      .trim(),
    number: z
      .number({ required_error: 'Counter number is required' })
      .int('Counter number must be an integer')
      .min(1, 'Counter number must be at least 1'),
    status: z.nativeEnum(CounterStatusEnum).optional().default(CounterStatusEnum.CLOSED),
  }),
});

export const updateCounterSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Counter ID parameter'),
  }),
  body: z.object({
    name: z.string().min(2).max(100).trim().optional(),
    status: z.nativeEnum(CounterStatusEnum).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getCounterSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Counter ID parameter'),
  }),
});

export const assignStaffSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Counter ID parameter'),
  }),
  body: z.object({
    staffProfileId: z.string({ required_error: 'Staff Profile ID is required' }).uuid('Invalid Staff Profile ID'),
  }),
});

export const assignServicesSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Counter ID parameter'),
  }),
  body: z.object({
    serviceIds: z
      .array(z.string().uuid('Invalid Service ID'))
      .min(1, 'At least one service ID must be provided'),
  }),
});
