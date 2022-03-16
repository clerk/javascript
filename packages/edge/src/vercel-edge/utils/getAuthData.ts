import { JWTPayload } from '@clerk/backend-core';
import { GetSessionTokenOptions } from '@clerk/types';
import { NextRequest } from 'next/server';

import { ClerkAPI } from '../ClerkAPI';
import { AuthData, WithAuthOptions } from '../types';

export async function getAuthData(
  req: NextRequest,
  { sid, sub, loadSession, loadUser }: WithAuthOptions & JWTPayload,
): Promise<AuthData> {
  const getToken = (options: GetSessionTokenOptions = {}) => {
    if (options.template) {
      throw new Error(
        'Retrieving a JWT template during edge runtime will be supported soon.',
      );
    }
    return req.cookies['__session'] || null;
  };

  const [user, session] = await Promise.all([
    loadUser
      ? ClerkAPI.users.getUser(sub as string)
      : Promise.resolve(undefined),
    loadSession
      ? ClerkAPI.sessions.getSession(sid as string)
      : Promise.resolve(undefined),
  ]);

  return {
    sessionId: sid as string,
    userId: sub as string,
    getToken,
    user,
    session,
  };
}
