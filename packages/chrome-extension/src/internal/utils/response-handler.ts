import type { Clerk } from '@clerk/clerk-js';

import { AUTH_HEADER, AUTH_HEADER_DEV } from '../constants';
import type { JWTHandler } from './jwt-handler';

type Handler = Parameters<Clerk['__unstable__onAfterResponse']>[0];
type Res = Parameters<Handler>[1];

/** Append appropriate query params to all Clerk requests */
export function responseHandler(jwtHandler: JWTHandler, { isProd }: { isProd: boolean }) {
  const handler: Handler = async (_, response) => {
    if (isProd) {
      await prodHandler(response, jwtHandler);
    } else {
      await devHandler(response, jwtHandler);
    }
  };
  return handler;
}

async function devHandler(response: Res, jwtHandler: JWTHandler) {
  const header = response?.headers.get(AUTH_HEADER_DEV);

  if (header) {
    await jwtHandler.set(header);
  } else {
    await jwtHandler.remove();
  }
}

async function prodHandler(response: Res, jwtHandler: JWTHandler) {
  const header = response?.headers.get(AUTH_HEADER);

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
