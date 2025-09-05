import type { User } from '@clerk/backend';
import type { APIContext } from 'astro';

import { clerkClient } from './clerk-client';

export const createCurrentUser = (context: APIContext) => {
  return async (): Promise<User | null> => {
    const { userId } = context.locals.auth();

    if (!userId) {
      return null;
    }

    return clerkClient(context).users.getUser(userId);
  };
};
