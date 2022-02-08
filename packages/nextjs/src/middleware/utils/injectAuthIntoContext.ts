import { GetServerSidePropsContext } from 'next';

import { AuthData, ContextWithAuth } from '../types';

/**
 *
 * Inject the `auth` attribute to the SSR provided context (ctx) object and
 * `user` and `session` attribute to the request (req) object.
 *
 * @internal
 * @param ctx
 * @param authData
 */
export function injectAuthIntoContext(
  ctx: GetServerSidePropsContext,
  authData: AuthData,
): ContextWithAuth {
  const { user, session, userId, sessionId } = authData;
  const auth = {
    userId,
    sessionId,
    getToken: authData.getToken,
  };
  return { ...ctx, auth, user, session };
}
