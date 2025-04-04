import type { apiTypes } from '@clerk/backend';
import type { APIContext } from 'astro';

import { clerkClient } from './clerk-client';
import { getAuth } from './get-auth';

export const createCurrentUser = (req: Request, context: APIContext) => {
  return async (): Promise<apiTypes.User | null> => {
    const { userId } = getAuth(req, context.locals);
    if (!userId) {
      return null;
    }

    return clerkClient(context).api.users.get(userId);
  };
};
