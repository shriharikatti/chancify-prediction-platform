import { z } from 'zod';

export const signupSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    role: z.enum(['USER', 'ADMIN']).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const voteSchema = z.object({
  predictionId: z.string(),
  choice: z.enum(['YES', 'NO']),
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(10000, 'Maximum bet is ₹10,000'),
});

export const createPredictionSchema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters'),
  description: z.string().optional(),
  category: z.enum([
    'SPORTS',
    'POLITICS',
    'ENTERTAINMENT',
    'TECHNOLOGY',
    'FINANCE',
  ]),
  endTime: z.iso.datetime(),
  imageUrl: z.url().optional(),
});
