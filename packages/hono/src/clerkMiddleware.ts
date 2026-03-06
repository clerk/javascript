import type { AuthObject } from '@clerk/backend';
import { createClerkClient } from '@clerk/backend';
import type { AuthenticateRequestOptions, AuthOptions, GetAuthFnNoRequest } from '@clerk/backend/internal';
import { getAuthObjectForAcceptedToken } from '@clerk/backend/internal';
import type { MiddlewareHandler } from 'hono';
import { env } from 'hono/adapter';

type ClerkEnv = {
  CLERK_SECRET_KEY: string;
  CLERK_PUBLISHABLE_KEY: string;
  CLERK_API_URL?: string;
  CLERK_API_VERSION?: string;
};

export type ClerkMiddlewareOptions = Omit<AuthenticateRequestOptions, 'acceptsToken'>;

/**
 * Clerk middleware for Hono that authenticates requests and attaches
 * auth data to the Hono context.
 *
 * @example
 * ```ts
 * import { Hono } from 'hono';
 * import { clerkMiddleware, getAuth } from '@clerk/hono';
 *
 * const app = new Hono();
 * app.use('*', clerkMiddleware());
 *
 * app.get('/', (c) => {
 *   const { userId } = getAuth(c);
 *   return c.json({ userId });
 * });
 * ```
 */
export const clerkMiddleware = (options?: ClerkMiddlewareOptions): MiddlewareHandler => {
  return async (c, next) => {
    const clerkEnv = env<ClerkEnv>(c);
    const { secretKey, publishableKey, apiUrl, apiVersion, ...rest } = options || {
      secretKey: clerkEnv.CLERK_SECRET_KEY || '',
      publishableKey: clerkEnv.CLERK_PUBLISHABLE_KEY || '',
      apiUrl: clerkEnv.CLERK_API_URL,
      apiVersion: clerkEnv.CLERK_API_VERSION,
    };

    if (!secretKey) {
      throw new Error(
        'Clerk: Missing Secret Key. Set CLERK_SECRET_KEY in your environment or pass secretKey to clerkMiddleware().',
      );
    }

    if (!publishableKey) {
      throw new Error(
        'Clerk: Missing Publishable Key. Set CLERK_PUBLISHABLE_KEY in your environment or pass publishableKey to clerkMiddleware().',
      );
    }

    const clerkClient = createClerkClient({
      ...rest,
      apiUrl,
      apiVersion,
      secretKey,
      publishableKey,
      userAgent: `${PACKAGE_NAME}@${PACKAGE_VERSION}`,
    });

    const requestState = await clerkClient.authenticateRequest(c.req.raw, {
      ...rest,
      secretKey,
      publishableKey,
      acceptsToken: 'any',
    });

    if (requestState.headers) {
      requestState.headers.forEach((value, key) => {
        c.res.headers.append(key, value);
      });

      const locationHeader = requestState.headers.get('location');

      if (locationHeader) {
        return c.redirect(locationHeader, 307);
      } else if (requestState.status === 'handshake') {
        throw new Error('Clerk: Unexpected handshake without redirect');
      }
    }

    const authObjectFn = ((authOptions?: AuthOptions) =>
      getAuthObjectForAcceptedToken({
        authObject: requestState.toAuth(authOptions) as AuthObject,
        acceptsToken: 'any',
      })) as GetAuthFnNoRequest;

    c.set('clerkAuth', authObjectFn);
    c.set('clerk', clerkClient);

    await next();
  };
};
