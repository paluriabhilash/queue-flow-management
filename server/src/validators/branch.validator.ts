import { z } from 'zod';
import { DayOfWeekEnum } from '@prisma/client';

const branchCodeRegex = /^[A-Z0-9_-]+$/;
const timeFormatRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const createBranchSchema = z.object({
  body: z.object({
    organizationId: z.string({ required_error: 'Organization ID is required' }).uuid('Invalid Organization ID'),
    name: z
      .string({ required_error: 'Branch name is required' })
      .min(2, 'Branch name must be at least 2 characters long')
      .max(100, 'Branch name cannot exceed 100 characters')
      .trim(),
    code: z
      .string({ required_error: 'Branch code is required' })
      .min(2, 'Branch code must be at least 2 characters long')
      .max(20, 'Branch code cannot exceed 20 characters')
      .toUpperCase()
      .regex(branchCodeRegex, 'Branch code can only contain uppercase letters, numbers, hyphens, and underscores'),
    address: z.string().max(255, 'Address cannot exceed 255 characters').optional(),
    phone: z.string().max(50, 'Phone cannot exceed 50 characters').optional(),
    timeZone: z.string().optional().default('UTC'),
  }),
});

export const updateBranchSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Branch ID parameter'),
  }),
  body: z.object({
    name: z.string().min(2).max(100).trim().optional(),
    address: z.string().max(255).optional(),
    phone: z.string().max(50).optional(),
    timeZone: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getBranchSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Branch ID parameter'),
  }),
});

export const createWorkingHourSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Branch ID parameter'),
  }),
  body: z.object({
    dayOfWeek: z.nativeEnum(DayOfWeekEnum, { required_error: 'Day of week is required' }),
    openTime: z
      .string({ required_error: 'Opening time is required' })
      .regex(timeFormatRegex, 'Opening time must be in HH:MM format (e.g. 08:00)'),
    closeTime: z
      .string({ required_error: 'Closing time is required' })
      .regex(timeFormatRegex, 'Closing time must be in HH:MM format (e.g. 17:00)'),
    lunchStartTime: z.string().regex(timeFormatRegex, 'HH:MM format').optional(),
    lunchEndTime: z.string().regex(timeFormatRegex, 'HH:MM format').optional(),
    isClosed: z.boolean().optional().default(false),
  }),
});

export const updateWorkingHourSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Working Hour ID parameter'),
  }),
  body: z.object({
    openTime: z.string().regex(timeFormatRegex, 'HH:MM format').optional(),
    closeTime: z.string().regex(timeFormatRegex, 'HH:MM format').optional(),
    lunchStartTime: z.string().regex(timeFormatRegex, 'HH:MM format').optional(),
    lunchEndTime: z.string().regex(timeFormatRegex, 'HH:MM format').optional(),
    isClosed: z.boolean().optional(),
  }),
});

export const createHolidaySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Branch ID parameter'),
  }),
  body: z.object({
    name: z
      .string({ required_error: 'Holiday name is required' })
      .min(2, 'Holiday name must be at least 2 characters long')
      .trim(),
    date: z
      .string({ required_error: 'Holiday date is required' })
      .datetime({ message: 'Holiday date must be a valid ISO Date string' }),
    description: z.string().max(255).optional(),
  }),
});

export const updateHolidaySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Holiday ID parameter'),
  }),
  body: z.object({
    name: z.string().min(2).trim().optional(),
    date: z.string().datetime().optional(),
    description: z.string().max(255).optional(),
  }),
});
