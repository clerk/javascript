import { createGetToken, JWTPayload } from '@clerk/backend-core';
import { NextRequest } from 'next/server';

import { ClerkAPI } from '../ClerkAPI';
import { AuthData, WithEdgeMiddlewareAuthOptions } from '../types';

/**
 * @internal
 */
export async function getAuthData(
  req: NextRequest,
  { sid, sub, loadSession, loadUser }: WithEdgeMiddlewareAuthOptions & JWTPayload,
): Promise<AuthData> {
  const [user, session] = await Promise.all([
    loadUser ? ClerkAPI.users.getUser(sub as string) : Promise.resolve(undefined),
    loadSession ? ClerkAPI.sessions.getSession(sid as string) : Promise.resolve(undefined),
  ]);

  const sessionId = sid;
  const userId = sub;
  const getToken = createGetToken({
    sessionId,
    cookieToken: req.cookies['__session'],
    headerToken: req.headers.get('authorization')?.replace('Bearer ', ''),
    fetcher: (...args) => ClerkAPI.sessions.getToken(...args),
  });

  return { sessionId, userId, getToken, user, session };
}
