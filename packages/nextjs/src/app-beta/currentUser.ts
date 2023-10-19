import type { User } from '@clerk/backend';
import { deprecated } from '@clerk/shared/deprecated';

deprecated(
  '@clerk/nextjs/app-beta',
  'Use imports from `@clerk/nextjs` instead.\nFor more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware',
);
import { auth } from './auth';
import { clerkClient } from './clerkClient';

/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export async function currentUser(): Promise<User | null> {
  const { userId } = auth();
  return userId ? clerkClient.users.getUser(userId) : null;
}
