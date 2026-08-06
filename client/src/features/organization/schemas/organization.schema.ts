import { z } from 'zod';

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
const orgCodeRegex = /^[A-Z0-9_-]+$/;

export const organizationFormSchema = z.object({
  name: z
    .string({ required_error: 'Organization name is required' })
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name is too long')
    .trim(),
  code: z
    .string()
    .min(2, 'Code must be at least 2 characters long')
    .max(20, 'Code is too long')
    .toUpperCase()
    .regex(orgCodeRegex, 'Alphanumeric uppercase characters only')
    .optional(),
  description: z.string().max(500, 'Description is too long').optional(),
  logoUrl: z.string().url('Please enter a valid image URL').optional().or(z.literal('')),
});

export const organizationSettingsFormSchema = z.object({
  maxTokensPerDay: z.coerce
    .number({ invalid_type_error: 'Max tokens must be a number' })
    .int()
    .min(1, 'Max tokens per day must be at least 1'),
  autoCallEnabled: z.boolean().default(false),
  smsGatewayEnabled: z.boolean().default(false),
  smsApiKey: z.string().optional(),
  themeColor: z
    .string({ required_error: 'Theme color is required' })
    .regex(hexColorRegex, 'Invalid hex color code format (e.g. #0c8ce9)'),
});

export type OrganizationFormValues = z.infer<typeof organizationFormSchema>;
export type OrganizationSettingsFormValues = z.infer<typeof organizationSettingsFormSchema>;
