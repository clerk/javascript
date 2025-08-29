import type { AuthObject, MachineAuthObject } from '@clerk/backend';
import type { AuthenticateRequestOptions, MachineTokenType } from '@clerk/backend/internal';
import {
  AuthStatus,
  constants,
  getAuthObjectForAcceptedToken,
  getAuthObjectFromJwt,
  invalidTokenAuthObject,
  isMachineTokenByPrefix,
  signedOutAuthObject,
  TokenType,
} from '@clerk/backend/internal';
import { decodeJwt } from '@clerk/backend/jwt';
import type { PendingSessionOptions } from '@clerk/types';
import type { APIContext } from 'astro';

import { getSafeEnv } from './get-safe-env';
import { getAuthKeyFromRequest } from './utils';

export const createGetAuth = ({ noAuthStatusMessage }: { noAuthStatusMessage: string }) => {
  const getAuth = (
    req: Request,
    rawAuthObject: AuthObject,
    locals: APIContext['locals'],
    {
      treatPendingAsSignedOut = true,
      acceptsToken = TokenType.SessionToken,
      ...opts
    }: { secretKey?: string } & PendingSessionOptions & Pick<AuthenticateRequestOptions, 'acceptsToken'> = {},
  ): AuthObject => {
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

    // Handle machine tokens first (from raw auth object)
    const bearerToken = req.headers.get(constants.Headers.Authorization)?.replace('Bearer ', '');
    const machineAuthObject = handleMachineToken(bearerToken, rawAuthObject, acceptsToken, options);
    if (machineAuthObject) {
      return machineAuthObject;
    }

    // If a random token is present and acceptsToken is an array that does NOT include session_token,
    // return invalid token auth object.
    if (bearerToken && Array.isArray(acceptsToken) && !acceptsToken.includes(TokenType.SessionToken)) {
      return invalidTokenAuthObject();
    }

    // Handle session tokens
    if (authStatus !== AuthStatus.SignedIn) {
      return signedOutAuthObject(options);
    }
    return getAuthObjectFromJwt(decodeJwt(authToken as string), { ...options, treatPendingAsSignedOut });
  };

  return getAuth;
};

const handleMachineToken = (
  bearerToken: string | undefined,
  rawAuthObject: AuthObject | undefined,
  acceptsToken: NonNullable<AuthenticateRequestOptions['acceptsToken']>,
  options: Record<string, any>,
): MachineAuthObject<MachineTokenType> | null => {
  const hasMachineToken = bearerToken && isMachineTokenByPrefix(bearerToken);

  const acceptsOnlySessionToken =
    acceptsToken === TokenType.SessionToken ||
    (Array.isArray(acceptsToken) && acceptsToken.length === 1 && acceptsToken[0] === TokenType.SessionToken);

  // Reconstruct machine auth object here since edge middleware serializes auth object
  if (hasMachineToken && rawAuthObject && !acceptsOnlySessionToken) {
    const authObject = getAuthObjectForAcceptedToken({
      authObject: {
        ...rawAuthObject,
        debug: () => options,
      },
      acceptsToken,
    });
    return {
      ...authObject,
      getToken: () => (authObject.isAuthenticated ? Promise.resolve(bearerToken) : Promise.resolve(null)),
      has: () => false,
    } as MachineAuthObject<MachineTokenType>;
  }

  return null;
};

// TODO: Once docs for astro land, update the following message with this line
// "For more details, see <link-to-docs>"
const authAuthHeaderMissing = (helperName = 'auth') =>
  `Clerk: ${helperName}() was called but Clerk can't detect usage of clerkMiddleware(). Please ensure that the clerkMiddleware() is used in your Astro Middleware.
    `;

export const getAuth = createGetAuth({
  noAuthStatusMessage: authAuthHeaderMissing(),
});
