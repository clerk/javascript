import type { Clerk } from '@clerk/clerk-js';

import { AUTH_HEADER } from '../constants';
import type { JWTHandler } from './jwt-handler';

type Handler = Parameters<Clerk['__internal_onBeforeRequest']>[0];
type Req = Parameters<Handler>[0];

/** Append the JWT to the FAPI request */
export function requestHandler(jwtHandler: JWTHandler, { isProd }: { isProd: boolean }) {
  const handler: Handler = async requestInit => {
    requestInit.credentials = 'omit';

    const currentJWT = await jwtHandler.get();

    if (!currentJWT) {
      return;
    }

    if (isProd) {
      prodHandler(requestInit, currentJWT);
    } else {
      devHandler(requestInit, currentJWT);
    }
  };

  return handler;
}

/** Append the JWT to the FAPI request, per development instances */
function devHandler(requestInit: Req, jwt: string) {
  requestInit.url?.searchParams.append('__clerk_db_jwt', jwt);
}

/** Append the JWT to the FAPI request, per production instances */
function prodHandler(requestInit: Req, jwt: string) {
  requestInit.url?.searchParams.append('_is_native', '1');
  (requestInit.headers as Headers).set(AUTH_HEADER.PRODUCTION, `Bearer ${jwt}`);
}
