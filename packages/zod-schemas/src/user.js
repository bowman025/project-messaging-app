import { z } from 'zod';

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(32, 'Username must be at most 32 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),
    email: z.string().email('Invalid email address').toLowerCase(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(32)
    .trim()
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
  avatarUrl: z
    .string()
    .url('Invalid avatar image URL')
    .regex(/\.(jpg|jpeg|png|gif|webp|avif)(\?.*)?$/i, 'Must be a valid avatar image URL')
    .optional(),
  bio: z.string().max(160, 'Bio must be at most 160 characters').trim().optional(),
});
