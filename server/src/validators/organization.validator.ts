import { z } from 'zod';

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
const orgCodeRegex = /^[A-Z0-9_-]+$/;

export const createOrganizationSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Organization name is required' })
      .min(2, 'Organization name must be at least 2 characters long')
      .max(100, 'Organization name cannot exceed 100 characters')
      .trim(),
    code: z
      .string({ required_error: 'Organization code is required' })
      .min(2, 'Organization code must be at least 2 characters long')
      .max(20, 'Organization code cannot exceed 20 characters')
      .toUpperCase()
      .regex(orgCodeRegex, 'Organization code can only contain uppercase letters, numbers, hyphens, and underscores'),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    logoUrl: z.string().url('Invalid Logo URL format').optional().or(z.literal('')),
    themeColor: z
      .string()
      .regex(hexColorRegex, 'Invalid hex color code format (e.g. #0c8ce9)')
      .optional(),
    maxTokensPerDay: z.number().int().min(1, 'Max tokens per day must be at least 1').optional(),
    autoCallEnabled: z.boolean().optional(),
    smsGatewayEnabled: z.boolean().optional(),
    smsApiKey: z.string().optional(),
  }),
});

export const updateOrganizationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Organization ID parameter'),
  }),
  body: z.object({
    name: z.string().min(2).max(100).trim().optional(),
    description: z.string().max(500).optional(),
    logoUrl: z.string().url().optional().or(z.literal('')),
    isActive: z.boolean().optional(),
  }),
});

export const getOrganizationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Organization ID parameter'),
  }),
});

export const updateSettingsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Organization ID parameter'),
  }),
  body: z.object({
    maxTokensPerDay: z.number().int().min(1, 'Max tokens per day must be at least 1').optional(),
    autoCallEnabled: z.boolean().optional(),
    smsGatewayEnabled: z.boolean().optional(),
    smsApiKey: z.string().optional(),
    themeColor: z.string().regex(hexColorRegex, 'Invalid hex color code format (e.g. #0c8ce9)').optional(),
    customConfig: z.string().optional(),
  }),
});
