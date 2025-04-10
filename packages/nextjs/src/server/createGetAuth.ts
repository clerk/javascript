import type { AuthObject } from '@clerk/backend';
import { constants } from '@clerk/backend/internal';
import { isTruthy } from '@clerk/shared/underscore';

import { withLogger } from '../utils/debugLogger';
import { isNextWithUnstableServerActions } from '../utils/sdk-versions';
import { getAuthDataFromRequest } from './data/getAuthDataFromRequest';
import { getAuthAuthHeaderMissing } from './errors';
import { detectClerkMiddleware, getHeader } from './headers-utils';
import type { RequestLike } from './types';
import { assertAuthStatus } from './utils';

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
    return async (req: RequestLike, opts?: { secretKey?: string }): Promise<AuthObject> => {
      if (isTruthy(getHeader(req, constants.Headers.EnableDebug))) {
        logger.enable();
      }

      if (!detectClerkMiddleware(req)) {
        // Keep the same behaviour for versions that may have issues with bundling `node:fs`
        if (isNextWithUnstableServerActions) {
          assertAuthStatus(req, noAuthStatusMessage);
        }

        const missConfiguredMiddlewareLocation = await import('./fs/middleware-location.js')
          .then(m => m.suggestMiddlewareLocation())
          .catch(() => undefined);

        if (missConfiguredMiddlewareLocation) {
          throw new Error(missConfiguredMiddlewareLocation);
        }

        // still throw there is no suggested move location
        assertAuthStatus(req, noAuthStatusMessage);
      }

      return getAuthDataFromRequest(req, { ...opts, logger });
    };
  });

/**
 * Previous known as `createGetAuth`. We needed to create a sync and async variant in order to allow for improvements
 * that required dynamic imports (using `require` would not work).
 * It powers the synchronous top-level api `getAuh()`.
 */
export const createSyncGetAuth = ({
  debugLoggerName,
  noAuthStatusMessage,
}: {
  debugLoggerName: string;
  noAuthStatusMessage: string;
}) =>
  withLogger(debugLoggerName, logger => {
    return (req: RequestLike, opts?: { secretKey?: string }): AuthObject => {
      if (isTruthy(getHeader(req, constants.Headers.EnableDebug))) {
        logger.enable();
      }

      assertAuthStatus(req, noAuthStatusMessage);
      return getAuthDataFromRequest(req, { ...opts, logger });
    };
  });

/**
 * The `getAuth()` helper retrieves authentication state from the request object.
 *
 * > [!NOTE]
 * > If you are using App Router, use the [`auth()` helper](https://clerk.com/docs/references/nextjs/auth) instead.
 *
 * @param req - The Next.js request object.
 * @param [options] - An optional object that can be used to configure the behavior of the `getAuth()` function.
 * @param [options.secretKey] - A string that represents the Secret Key used to sign the session token. If not provided, the Secret Key is retrieved from the environment variable `CLERK_SECRET_KEY`.
 * @returns The `Auth` object. See the [Auth reference](https://clerk.com/docs/references/backend/types/auth-object) for more information.
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
 * `getAuth()` returns [`getToken()`](https://clerk.com/docs/references/backend/types/auth-object#get-token), which is a method that returns the current user's session token or a custom JWT template.
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
 * `clerkClient` is used to access the [Backend SDK](https://clerk.com/docs/references/backend/overview), which exposes Clerk's Backend API resources. You can use `getAuth()` to pass authentication information that many of the Backend SDK methods require, like the user's ID.
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
