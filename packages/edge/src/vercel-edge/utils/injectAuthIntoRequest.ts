import { NextRequest } from 'next/server';

import { AuthData, RequestWithAuth } from '../types';

export function injectAuthIntoRequest(req: NextRequest, authData: AuthData): RequestWithAuth {
  const { user, session, userId, sessionId, getToken, claims } = authData;
  const auth = {
    userId,
    sessionId,
    getToken,
    claims,
    actorId: claims?.act?.sub || null,
  };

  /* Object.assign is used here as NextRequest properties also include Symbols */
  return Object.assign(req, { auth, user, session });
}
