import { isTruthy } from '@clerk/shared/underscore';
import type { Request as ExpressRequest } from 'express';
import type { IncomingMessage } from 'http';

import type { ExpressRequestWithAuth } from './types';

export const requestHasAuthObject = (req: ExpressRequest): req is ExpressRequestWithAuth => {
  return 'auth' in req;
};

export const loadClientEnv = () => {
  return {
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY || '',
    clerkJSUrl: process.env.CLERK_JS || '',
    clerkJSVersion: process.env.CLERK_JS_VERSION || '',
  };
};

export const loadApiEnv = () => {
  return {
    secretKey: process.env.CLERK_SECRET_KEY || '',
    apiUrl: process.env.CLERK_API_URL || 'https://api.clerk.com',
    apiVersion: process.env.CLERK_API_VERSION || 'v1',
    domain: process.env.CLERK_DOMAIN || '',
    proxyUrl: process.env.CLERK_PROXY_URL || '',
    signInUrl: process.env.CLERK_SIGN_IN_URL || '',
    isSatellite: isTruthy(process.env.CLERK_IS_SATELLITE),
    jwtKey: process.env.CLERK_JWT_KEY || '',
    sdkMetadata: {
      name: PACKAGE_NAME,
      version: PACKAGE_VERSION,
      environment: process.env.NODE_ENV,
    },
    telemetry: {
      disabled: isTruthy(process.env.CLERK_TELEMETRY_DISABLED),
      debug: isTruthy(process.env.CLERK_TELEMETRY_DEBUG),
    },
  };
};

export const incomingMessageToRequest = (req: IncomingMessage): Request => {
  const headers = Object.keys(req.headers).reduce((acc, key) => Object.assign(acc, { [key]: req?.headers[key] }), {});
  // @ts-ignore Optimistic attempt to get the protocol in case
  // req extends IncomingMessage in a useful way. No guarantee
  // it'll work.
  const protocol = req.connection?.encrypted ? 'https' : 'http';
  const dummyOriginReqUrl = new URL(req.url || '', `${protocol}://clerk-dummy`);
  return new Request(dummyOriginReqUrl, {
    method: req.method,
    headers: new Headers(headers),
  });
};
