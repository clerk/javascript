import {
  type AuthObject,
  AuthStatus,
  type SignedInAuthObject,
  signedInAuthObject,
  type SignedOutAuthObject,
  signedOutAuthObject,
} from '@clerk/backend/internal';
import { decodeJwt } from '@clerk/backend/jwt';
import type { APIContext } from 'astro';

import { getSafeEnv } from './get-safe-env';
import { getAuthKeyFromRequest } from './utils';

type AuthObjectWithoutResources<T extends AuthObject> = Omit<T, 'user' | 'organization' | 'session'>;

export type GetAuthReturn =
  | AuthObjectWithoutResources<SignedInAuthObject>
  | AuthObjectWithoutResources<SignedOutAuthObject>;

export const createGetAuth = ({ noAuthStatusMessage }: { noAuthStatusMessage: string }) => {
  return (
    req: Request,
    locals: APIContext['locals'],
    opts?: { secretKey?: string },
  ): AuthObjectWithoutResources<SignedInAuthObject> | AuthObjectWithoutResources<SignedOutAuthObject> => {
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
    return signedInAuthObject({ ...options, sessionToken: jwt.raw.text }, jwt.payload);
  };
};

const authAuthHeaderMissing = (helperName = 'auth') =>
  `Clerk: ${helperName}() was called but Clerk can't detect usage of authMiddleware(). Please ensure the following:
    - authMiddleware() is used in your Next.js Middleware.
    - Your Middleware matcher is configured to match this route or page.
    - If you are using the src directory, make sure the Middleware file is inside of it.
    
    For more details, see https://clerk.com/docs/quickstarts/get-started-with-nextjs
    `;

export const getAuth = createGetAuth({
  noAuthStatusMessage: authAuthHeaderMissing('getAuth'),
});
