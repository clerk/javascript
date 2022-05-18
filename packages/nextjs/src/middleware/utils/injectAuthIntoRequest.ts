import { GetServerSidePropsContext } from 'next';

import { AuthData, ContextWithAuth } from '../types';

/**
 * Inject `auth`, `user` and `session` properties into ctx.request
 * @internal
 */
export function injectAuthIntoRequest(ctx: GetServerSidePropsContext, authData: AuthData): ContextWithAuth {
  const { user, session, userId, sessionId, getToken, claims } = authData;
  (ctx.req as any).auth = { userId, sessionId, getToken, claims };
  (ctx.req as any).user = user;
  (ctx.req as any).session = session;
  return ctx as ContextWithAuth;
}
