import type { Clerk } from '@clerk/clerk-js';

import { AUTH_HEADER } from '../constants';
import type { JWTHandler } from './jwt-handler';

type Handler = Parameters<Clerk['__internal_onAfterResponse']>[0];
type Res = Parameters<Handler>[1];

/** Retrieve the JWT to the FAPI response */
export function responseHandler(jwtHandler: JWTHandler, { isProd }: { isProd: boolean }): Handler {
  const handler: Handler = async (_, response) => {
    if (isProd) {
      await prodHandler(response, jwtHandler);
    } else {
      await devHandler(response, jwtHandler);
    }
  };
  return handler;
}

/** Retrieve the JWT to the FAPI response, per development instances */
async function devHandler(response: Res, jwtHandler: JWTHandler) {
  const header = response?.headers.get(AUTH_HEADER.DEVELOPMENT);

  if (header) {
    await jwtHandler.set(header);
  } else {
    await jwtHandler.remove();
  }
}

/** Retrieve the JWT to the FAPI response, per production instances */
async function prodHandler(response: Res, jwtHandler: JWTHandler) {
  const header = response?.headers.get(AUTH_HEADER.PRODUCTION);

  if (header?.startsWith('Bearer')) {
    const jwt = header.split(' ')[1] || undefined;

    if (jwt) {
      await jwtHandler.set(jwt);
    } else {
      await jwtHandler.remove();
    }
  } else if (header) {
    await jwtHandler.set(header);
  }
}
