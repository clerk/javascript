import type { Clerk } from '@clerk/clerk-js';

import { AUTH_HEADER } from '../constants';
import type { JWTHandler } from './jwt-handler';

type Handler = Parameters<Clerk['__unstable__onBeforeRequest']>[0];
type Req = Parameters<Handler>[0];

/** Save the appropriate JWT from the response to storage */
export function requestHandler(jwtHandler: JWTHandler, { isProd }: { isProd: boolean }) {
  const handler: Handler = async requestInit => {
    requestInit.credentials = 'omit';

    const currentJWT = await jwtHandler.get();

    if (!currentJWT) {
      unauthenticatedHandler(requestInit);
    } else if (isProd) {
      prodHandler(requestInit, currentJWT);
      console.log('requestHandler (authHeader):', AUTH_HEADER, `Bearer ${currentJWT}`);
    } else {
      devHandler(requestInit, currentJWT);
    }

    console.log('requestHandler (searchParams):', requestInit.url?.searchParams.toString());
  };

  return handler;
}

function unauthenticatedHandler(_requestInit: Req) {
  // requestInit.url?.searchParams.append('_is_native', '1');
}

function devHandler(requestInit: Req, jwt: string) {
  requestInit.url?.searchParams.append('__clerk_db_jwt', jwt);
}

function prodHandler(requestInit: Req, jwt: string) {
  requestInit.url?.searchParams.append('_is_native', '1');
  (requestInit.headers as Headers).set(AUTH_HEADER, `Bearer ${jwt}`);
}
