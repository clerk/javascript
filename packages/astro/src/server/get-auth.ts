import { type AuthObject, AuthStatus, signedInAuthObject, signedOutAuthObject } from '@clerk/backend/internal';
import { decodeJwt } from '@clerk/backend/jwt';
import type { APIContext } from 'astro';

import { getSafeEnv } from './get-safe-env';
import { getAuthKeyFromRequest } from './utils';

export type GetAuthReturn = AuthObject;

export const createGetAuth = ({ noAuthStatusMessage }: { noAuthStatusMessage: string }) => {
  return (req: Request, locals: APIContext['locals'], opts?: { secretKey?: string }): GetAuthReturn => {
    // When the auth status is set, we trust that the middleware has already run
    // Then, we don't have to re-verify the JWT here,
    // we can just strip out the claims manually.
    const authToken = locals.authToken || getAuthKeyFromRequest(req, 'AuthToken');
    const authStatus = locals.authStatus || (getAuthKeyFromRequest(req, 'AuthStatus') as AuthStatus);
    const authMessage = locals.authMessage || getAuthKeyFromRequest(req, 'AuthMessage');
    const authReason = locals.authReason || getAuthKeyFromRequest(req, 'AuthReason');

    if (!authStatus) {
      throw new Error(noAuthStatusMessage);
    }

    const options = {
      authStatus,
      apiUrl: getSafeEnv(locals).apiUrl,
      apiVersion: getSafeEnv(locals).apiVersion,
      authMessage,
      secretKey: opts?.secretKey || getSafeEnv(locals).sk,
      authReason,
    };

    if (authStatus !== AuthStatus.SignedIn) {
      return signedOutAuthObject(options);
    }

    const jwt = decodeJwt(authToken as string);
    // @ts-expect-error - TODO: Align types
    return signedInAuthObject(options, jwt.raw.text, jwt.payload);
  };
};

// TODO: Once docs for astro land, update the following message with this line
// "For more details, see <link-to-docs>"
const authAuthHeaderMissing = (helperName = 'auth') =>
  `Clerk: ${helperName}() was called but Clerk can't detect usage of clerkMiddleware(). Please ensure that the clerkMiddleware() is used in your Astro Middleware.
    `;

export const getAuth = createGetAuth({
  noAuthStatusMessage: authAuthHeaderMissing(),
});
