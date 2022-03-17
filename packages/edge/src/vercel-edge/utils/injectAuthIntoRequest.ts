import { NextRequest } from 'next/server';

import { AuthData, RequestWithAuth } from '../types';

export function injectAuthIntoRequest(
  req: NextRequest,
  authData: AuthData,
): RequestWithAuth {
  const { user, session, userId, sessionId, getToken } = authData;
  const auth = {
    userId,
    sessionId,
    getToken,
  };

  /* Object.assign is used here as NextRequest properties also include Symbols */
  return Object.assign(req, { auth, user, session });
}
