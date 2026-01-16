import { Readable } from 'stream';

import { isTruthy } from '@clerk/shared/underscore';
import type { Request as ExpressRequest } from 'express';

import type { ExpressRequestWithAuth } from './types';

export const requestHasAuthObject = (req: ExpressRequest): req is ExpressRequestWithAuth => {
  return 'auth' in req;
};

export const loadClientEnv = () => {
  return {
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY || '',
    clerkJSUrl: process.env.CLERK_JS || process.env.CLERK_JS_URL || '',
    clerkUiUrl: process.env.CLERK_UI_URL || '',
    clerkJSVersion: process.env.CLERK_JS_VERSION || '',
  };
};

export const loadApiEnv = () => {
  return {
    secretKey: process.env.CLERK_SECRET_KEY || '',
    machineSecretKey: process.env.CLERK_MACHINE_SECRET_KEY || '',
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

export const incomingMessageToRequest = (req: ExpressRequest): Request => {
  const headers = Object.keys(req.headers).reduce((acc, key) => Object.assign(acc, { [key]: req?.headers[key] }), {});
  // @ts-ignore Optimistic attempt to get the protocol in case
  // req extends IncomingMessage in a useful way. No guarantee
  // it'll work.
  const protocol = req.connection?.encrypted ? 'https' : 'http';
  const dummyOriginReqUrl = new URL(req.originalUrl || req.url || '', `${protocol}://clerk-dummy`);
  return new Request(dummyOriginReqUrl, {
    method: req.method,
    headers: new Headers(headers),
  });
};

/**
 * Converts an Express request to a Fetch API Request with body streaming support.
 * This is used for proxying requests where the body needs to be forwarded.
 */
export const requestToProxyRequest = (req: ExpressRequest): Request => {
  const headers = new Headers();
  Object.entries(req.headers).forEach(([key, value]) => {
    if (value) {
      headers.set(key, Array.isArray(value) ? value.join(', ') : value);
    }
  });

  const protocol = req.protocol || (req.secure ? 'https' : 'http');
  const host = req.get('host') || 'localhost';
  const url = new URL(req.originalUrl || req.url, `${protocol}://${host}`);

  const hasBody = ['POST', 'PUT', 'PATCH'].includes(req.method);

  return new Request(url.toString(), {
    method: req.method,
    headers,
    body: hasBody ? (Readable.toWeb(req) as ReadableStream) : undefined,
    // @ts-expect-error - duplex required for streaming bodies but not in all TS definitions
    duplex: hasBody ? 'half' : undefined,
  });
};
