import type { Clerk } from '@clerk/clerk-js';

import { AUTH_HEADER } from '../constants';
import type { JWTHandler } from './jwt-handler';

type Handler = Parameters<Clerk['__unstable__onBeforeRequest']>[0];

/** Save the appropriate JWT from the response to storage */
export function requestHandler(jwtHandler: JWTHandler) {
  const handler: Handler = async requestInit => {
    requestInit.credentials = 'omit';

    const currentJWT = await jwtHandler.get();

    if (!currentJWT) {
      requestInit.url?.searchParams.append('_is_native', '1');
      return;
    }

    requestInit.url?.searchParams.append('_is_native', '1');
    (requestInit.headers as Headers).set(AUTH_HEADER, `Bearer ${currentJWT}`);

    console.log('requestHandler (searchParams):', requestInit.url?.searchParams.toString());
    console.log('requestHandler (authHeader):', AUTH_HEADER, `Bearer ${currentJWT}`);
  };

  return handler;
}
