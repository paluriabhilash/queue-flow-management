import { z } from 'zod';
import { DayOfWeek } from '../types';

const branchCodeRegex = /^[A-Z0-9_-]+$/;
const timeFormatRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const branchFormSchema = z.object({
  name: z
    .string({ required_error: 'Branch name is required' })
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),
  code: z
    .string({ required_error: 'Branch code is required' })
    .min(2, 'Code must be at least 2 characters long')
    .max(20, 'Code cannot exceed 20 characters')
    .toUpperCase()
    .regex(branchCodeRegex, 'Uppercase letters, numbers, hyphens only'),
  address: z.string().max(255, 'Address cannot exceed 255 characters').optional(),
  phone: z.string().max(50, 'Phone cannot exceed 50 characters').optional(),
  timeZone: z.string().default('UTC'),
  isActive: z.boolean().default(true),
});

export const workingHourFormSchema = z.object({
  dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as [DayOfWeek, ...DayOfWeek[]]),
  openTime: z.string().regex(timeFormatRegex, 'HH:MM format required'),
  closeTime: z.string().regex(timeFormatRegex, 'HH:MM format required'),
  lunchStartTime: z.string().regex(timeFormatRegex, 'HH:MM format').optional().or(z.literal('')),
  lunchEndTime: z.string().regex(timeFormatRegex, 'HH:MM format').optional().or(z.literal('')),
  isClosed: z.boolean().default(false),
});

export const holidayFormSchema = z.object({
  name: z.string().min(2, 'Holiday name is required').max(100).trim(),
  date: z.string().min(1, 'Date is required'),
  description: z.string().max(255).optional(),
});

export type BranchFormValues = z.infer<typeof branchFormSchema>;
export type WorkingHourFormValues = z.infer<typeof workingHourFormSchema>;
export type HolidayFormValues = z.infer<typeof holidayFormSchema>;
