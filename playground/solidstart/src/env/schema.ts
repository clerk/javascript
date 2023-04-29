import { z } from 'zod';

export const serverScheme = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLERK_SECRET_KEY: z.string().min(1),
});

export const clientScheme = z.object({
  MODE: z.enum(['development', 'production', 'test']).default('development'),
  VITE_CLERK_PUBLISHABLE_KEY: z.string().min(1),
});
