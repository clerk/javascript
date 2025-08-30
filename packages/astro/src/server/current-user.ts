import type { User } from '@clerk/backend';
import { TokenType } from '@clerk/backend/internal';
import type { APIContext } from 'astro';

import { clerkClient } from './clerk-client';
import { getAuth } from './get-auth';

export const createCurrentUser = (req: Request, context: APIContext) => {
  return async (): Promise<User | null> => {
    const authObject = getAuth(req, context.locals, { acceptsToken: TokenType.SessionToken });

    if (authObject.tokenType !== TokenType.SessionToken) {
      return null;
    }

    const { userId } = authObject;
    if (!userId) {
      return null;
    }

    return clerkClient(context).users.getUser(userId);
  };
};
