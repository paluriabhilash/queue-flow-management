import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z
    .string({ required_error: 'Email address is required' })
    .email('Please enter a valid email address')
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password cannot be empty'),
  rememberMe: z.boolean().optional().default(false),
});

export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

export const registerFormSchema = z
  .object({
    fullName: z
      .string({ required_error: 'Full name is required' })
      .min(2, 'Full name must be at least 2 characters long')
      .max(100, 'Full name is too long')
      .trim(),
    email: z
      .string({ required_error: 'Email address is required' })
      .email('Please enter a valid email address')
      .trim(),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(val),
        'Please enter a valid phone number'
      ),
    password: z
      .string({ required_error: 'Password is required' })
      .regex(
        passwordRegex,
        'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character'
      ),
    confirmPassword: z
      .string({ required_error: 'Please confirm your password' }),
    orgCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
