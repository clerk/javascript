import type { Clerk } from '@clerk/clerk-js';

import { AUTH_HEADER } from '../constants';
import type { JWTHandler } from './jwt-handler';

type Handler = Parameters<Clerk['__unstable__onAfterResponse']>[0];

/** Append appropriate query params to all Clerk requests */
export function responseHandler(jwtHandler: JWTHandler) {
  const handler: Handler = async (_, response) => {
    const authHeader = response?.headers.get(AUTH_HEADER);

    if (authHeader?.startsWith('Bearer')) {
      const newJWT = authHeader.split(' ')[1] || undefined;

      if (newJWT) {
        await jwtHandler.set(newJWT);
      } else {
        await jwtHandler.remove();
      }
    } else if (authHeader) {
      await jwtHandler.set(authHeader);
    }
  };

  return handler;
}
