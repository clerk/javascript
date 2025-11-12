import type { AuthObject } from '@clerk/backend';
import {
  AuthStatus,
  constants,
  createClerkRequest,
  type SignedInAuthObject,
  type SignedOutAuthObject,
} from '@clerk/backend/internal';
import type { PendingSessionOptions } from '@clerk/types';
import { redirect } from 'next/navigation';
import { cache } from 'react';

import { buildRequestLike } from '../app-router/server/utils';
import type { Log, Logger, LoggerNoCommit } from '../utils/debugLogger';
import { withLogger } from '../utils/debugLogger';
import { clerkClient } from './clerkClient';
import { createAuthenticateRequestOptions } from './clerkMiddleware';
import { PUBLISHABLE_KEY, SECRET_KEY, SIGN_IN_URL, SIGN_UP_URL } from './constants';
import type { GetAuthDataFromRequestOptions } from './data/getAuthDataFromRequest';
import {
  getAuthDataFromRequest as getAuthDataFromRequestOriginal,
  getSessionAuthDataFromRequest as getSessionAuthDataFromRequestOriginal,
} from './data/getAuthDataFromRequest';
import { getAuthAuthHeaderMissing } from './errors';
import { errorThrower } from './errorThrower';
import { detectClerkMiddleware } from './headers-utils';
import type { RequestLike } from './types';
import { assertAuthStatus, assertKey } from './utils';

async function _getAuthDataByAuthenticatingRequest(logger?: LoggerNoCommit<Logger<Log>>) {
  const request = await buildRequestLike();

  const publishableKey = assertKey(PUBLISHABLE_KEY, () => errorThrower.throwMissingPublishableKeyError());

  const secretKey = assertKey(SECRET_KEY, () => errorThrower.throwMissingSecretKeyError());
  const signInUrl = SIGN_IN_URL;
  const signUpUrl = SIGN_UP_URL;

  const options = {
    publishableKey,
    secretKey,
    signInUrl,
    signUpUrl,
  };

  const resolvedClerkClient = await clerkClient();

  const clerkRequest = createClerkRequest(request);
  console.log('clerkRequest.url', clerkRequest.url);

  const authHeader = request.headers.get(constants.Headers.Authorization);
  if (authHeader && authHeader.startsWith('Basic ')) {
    logger?.debug('Basic Auth detected');
  }

  const cspHeader = request.headers.get(constants.Headers.ContentSecurityPolicy);
  if (cspHeader) {
    logger?.debug('Content-Security-Policy detected', () => ({
      value: cspHeader,
    }));
  }

  const requestState = await resolvedClerkClient.authenticateRequest(
    clerkRequest,
    createAuthenticateRequestOptions(clerkRequest, options),
  );

  console.log('------');
  for (const [key, value] of requestState.headers.entries()) {
    console.log('key', key, 'value', value);
  }
  console.log('------');

  logger?.debug('requestState', () => ({
    status: requestState.status,
    headers: JSON.stringify(Object.fromEntries(requestState.headers)),
    reason: requestState.reason,
  }));

  const locationHeader = requestState.headers.get(constants.Headers.Location);

  const cloneURL = new URL(clerkRequest.url);
  cloneURL.search = '';

  if (locationHeader && locationHeader !== cloneURL.toString()) {
    console.log('redirecting to', locationHeader);
    redirect(locationHeader);
    // const res = NextResponse.redirect(locationHeader);
    // requestState.headers.forEach((value, key) => {
    //   if (key === constants.Headers.Location) {
    //     return;
    //   }
    //   res.headers.append(key, value);
    // });
    // return res;
  } else if (requestState.status === AuthStatus.Handshake) {
    throw new Error('Clerk: handshake status without redirect');
  }

  // const authObject = requestState.toAuth();

  // if (isRedirect(handlerResult)) {
  //   logger.debug('handlerResult is redirect');
  //   return serverRedirectWithAuth(clerkRequest, handlerResult, options);
  // }

  return requestState;
}

export const getAuthDataByAuthenticatingRequest = cache(_getAuthDataByAuthenticatingRequest);

export const checkHandshake = cache(async () => {
  const request = await buildRequestLike();

  if (!detectClerkMiddleware(request)) {
    const requestState = await getAuthDataByAuthenticatingRequest();
    console.log('hehehe requestState.headers.getSetCookie()', requestState.headers.getSetCookie());
    if (requestState.headers.getSetCookie().length > 0) {
      console.log('needs_sync');
      throw new Error('needs_sync');
    }
    console.log('no needs_sync');
    return requestState.toAuth();
  }

  return null;
});

export type GetAuthOptions = {
  acceptsToken?: GetAuthDataFromRequestOptions['acceptsToken'];
} & PendingSessionOptions;

/**
 * The async variant of our old `createGetAuth` allows for asynchronous code inside its callback.
 * Should be used with function like `auth()` that are already asynchronous.
 */
export const createAsyncGetAuth = ({
  debugLoggerName,
  noAuthStatusMessage,
}: {
  debugLoggerName: string;
  noAuthStatusMessage: string;
}) =>
  withLogger(debugLoggerName, logger => {
    return async (req: RequestLike, opts?: { secretKey?: string } & GetAuthOptions): Promise<AuthObject> => {
      // if (isTruthy(getHeader(req, constants.Headers.EnableDebug))) {
      logger.enable();
      // }

      console.log('noAuthStatusMessage', noAuthStatusMessage[0]);

      // if (!detectClerkMiddleware(req)) {
      //   // Keep the same behaviour for versions that may have issues with bundling `node:fs`
      //   if (isNextWithUnstableServerActions) {
      //     assertAuthStatus(req, noAuthStatusMessage);
      //   }

      //   const missConfiguredMiddlewareLocation = await import('./fs/middleware-location.js')
      //     .then(m => m.suggestMiddlewareLocation())
      //     .catch(() => undefined);

      //   if (missConfiguredMiddlewareLocation) {
      //     throw new Error(missConfiguredMiddlewareLocation);
      //   }
      // }
      // still throw there is no suggested move location

      // assertAuthStatus(req, noAuthStatusMessage);
      if (!detectClerkMiddleware(req)) {
        return (await getAuthDataByAuthenticatingRequest(logger)).toAuth();
      }

      const getAuthDataFromRequest = (req: RequestLike, opts: GetAuthDataFromRequestOptions = {}) => {
        return getAuthDataFromRequestOriginal(req, { ...opts, logger, acceptsToken: opts?.acceptsToken });
      };

      return getAuthDataFromRequest(req, { ...opts, logger, acceptsToken: opts?.acceptsToken });
    };
  });

/**
 * Previous known as `createGetAuth`. We needed to create a sync and async variant in order to allow for improvements
 * that required dynamic imports (using `require` would not work).
 * It powers the synchronous top-level api `getAuth()`.
 */
export const createSyncGetAuth = ({
  debugLoggerName,
  noAuthStatusMessage,
}: {
  debugLoggerName: string;
  noAuthStatusMessage: string;
}) =>
  withLogger(debugLoggerName, logger => {
    return (
      req: RequestLike,
      opts?: { secretKey?: string } & GetAuthOptions,
    ): SignedInAuthObject | SignedOutAuthObject => {
      // if (isTruthy(getHeader(req, constants.Headers.EnableDebug))) {
      logger.enable();
      // }

      assertAuthStatus(req, noAuthStatusMessage);

      const getAuthDataFromRequest = (req: RequestLike, opts: GetAuthDataFromRequestOptions = {}) => {
        return getSessionAuthDataFromRequestOriginal(req, { ...opts, logger, acceptsToken: opts?.acceptsToken });
      };

      return getAuthDataFromRequest(req, { ...opts, logger, acceptsToken: opts?.acceptsToken });
    };
  });

/**
 * The `getAuth()` helper retrieves authentication state from the request object.
 *
 * > [!NOTE]
 * > If you are using App Router, use the [`auth()` helper](https://clerk.com/docs/reference/nextjs/app-router/auth) instead.
 *
 * @param req - The Next.js request object.
 * @param [options] - An optional object that can be used to configure the behavior of the `getAuth()` function.
 * @param [options.secretKey] - A string that represents the Secret Key used to sign the session token. If not provided, the Secret Key is retrieved from the environment variable `CLERK_SECRET_KEY`.
 * @returns The `Auth` object. See the [Auth reference](https://clerk.com/docs/reference/backend/types/auth-object) for more information.
 *
 * @example
 * ### Protect API routes
 *
 * The following example demonstrates how to protect an API route by checking if the `userId` is present in the `getAuth()` response.
 *
 * ```tsx {{ filename: 'app/api/example/route.ts' }}
 * import { getAuth } from '@clerk/nextjs/server'
 * import type { NextApiRequest, NextApiResponse } from 'next'
 *
 * export default async function handler(req: NextApiRequest, res: NextApiResponse) {
 *   const { userId } = getAuth(req)
 *
 *   if (!userId) {
 *     return res.status(401).json({ error: 'Not authenticated' })
 *   }
 *
 *   // Add logic that retrieves the data for the API route
 *
 *   return res.status(200).json({ userId: userId })
 * }
 * ```
 *
 * @example
 * ### Usage with `getToken()`
 *
 * `getAuth()` returns [`getToken()`](https://clerk.com/docs/reference/backend/types/auth-object#get-token), which is a method that returns the current user's session token or a custom JWT template.
 *
 * ```tsx {{ filename: 'app/api/example/route.ts' }}
 * import { getAuth } from '@clerk/nextjs/server'
 * import type { NextApiRequest, NextApiResponse } from 'next'
 *
 * export default async function handler(req: NextApiRequest, res: NextApiResponse) {
 *   const { getToken } = getAuth(req)
 *
 *   const token = await getToken({ template: 'supabase' })
 *
 *   // Add logic that retrieves the data
 *   // from your database using the token
 *
 *   return res.status(200).json({})
 * }
 * ```
 *
 * @example
 * ### Usage with `clerkClient`
 *
 * `clerkClient` is used to access the [Backend SDK](https://clerk.com/docs/reference/backend/overview), which exposes Clerk's Backend API resources. You can use `getAuth()` to pass authentication information that many of the Backend SDK methods require, like the user's ID.
 *
 * ```tsx {{ filename: 'app/api/example/route.ts' }}
 * import { clerkClient, getAuth } from '@clerk/nextjs/server'
 * import type { NextApiRequest, NextApiResponse } from 'next'
 *
 * export default async function handler(req: NextApiRequest, res: NextApiResponse) {
 *   const { userId } = getAuth(req)
 *
 *   const client = await clerkClient()
 *
 *   const user = userId ? await client.users.getUser(userId) : null
 *
 *   return res.status(200).json({})
 * }
 * ```
 */
export const getAuth = createSyncGetAuth({
  debugLoggerName: 'getAuth()',
  noAuthStatusMessage: getAuthAuthHeaderMissing(),
});
