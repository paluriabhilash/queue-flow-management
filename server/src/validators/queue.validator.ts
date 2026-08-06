import { z } from 'zod';
import { PriorityLevelEnum } from '@prisma/client';

export const generateTokenSchema = z.object({
  body: z.object({
    branchId: z.string({ required_error: 'Branch ID is required' }).uuid('Invalid Branch ID'),
    serviceId: z.string({ required_error: 'Service ID is required' }).uuid('Invalid Service ID'),
    priority: z.nativeEnum(PriorityLevelEnum).optional().default(PriorityLevelEnum.NORMAL),
    customerName: z.string().max(100).optional(),
    customerPhone: z.string().max(20).optional(),
    notes: z.string().max(255).optional(),
  }),
});

export const tokenIdSchema = z.object({
  params: z.object({
    tokenId: z.string().uuid('Invalid Token ID parameter'),
  }),
});

export const counterIdSchema = z.object({
  params: z.object({
    counterId: z.string().uuid('Invalid Counter ID parameter'),
  }),
});

export const callNextSchema = z.object({
  body: z.object({
    counterId: z.string({ required_error: 'Counter ID is required' }).uuid('Invalid Counter ID'),
  }),
});
