/* eslint-disable turbo/no-undeclared-env-vars */
import { deprecated } from '@clerk/shared/deprecated';
import type { IncomingMessage, ServerResponse } from 'http';

// https://nextjs.org/docs/api-routes/api-middlewares#connectexpress-middleware-support
export function runMiddleware(req: IncomingMessage, res: ServerResponse, fn: (...args: any) => any) {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    void fn(req, res, result => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export const loadClientEnv = () => {
  if (process.env.CLERK_FRONTEND_API) {
    deprecated('CLERK_FRONTEND_API', 'Use `CLERK_PUBLISHABLE_KEY` instead.');
  }

  return {
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY || '',
    frontendApi: process.env.CLERK_FRONTEND_API || '',
    clerkJSUrl: process.env.CLERK_JS || '',
    clerkJSVersion: process.env.CLERK_JS_VERSION || '',
  };
};

export const loadApiEnv = () => {
  if (process.env.CLERK_API_KEY) {
    deprecated('CLERK_API_KEY', 'Use `CLERK_SECRET_KEY` instead.');
  }

  return {
    secretKey: process.env.CLERK_SECRET_KEY || process.env.CLERK_API_KEY || '',
    apiKey: process.env.CLERK_API_KEY || '',
    apiUrl: process.env.CLERK_API_URL || 'https://api.clerk.com',
    apiVersion: process.env.CLERK_API_VERSION || 'v1',
    domain: process.env.CLERK_DOMAIN || '',
    proxyUrl: process.env.CLERK_PROXY_URL || '',
    signInUrl: process.env.CLERK_SIGN_IN_URL || '',
    isSatellite: process.env.CLERK_IS_SATELLITE === 'true',
    jwtKey: process.env.CLERK_JWT_KEY || '',
  };
};
