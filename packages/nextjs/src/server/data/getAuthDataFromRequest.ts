import type { AuthObject, MachineAuthObject } from '@clerk/backend';
import type {
  AuthenticateRequestOptions,
  MachineTokenType,
  SignedInAuthObject,
  SignedOutAuthObject,
} from '@clerk/backend/internal';
import {
  AuthStatus,
  constants,
  getAuthObjectForAcceptedToken,
  getAuthObjectFromJwt,
  invalidTokenAuthObject,
  isMachineTokenByPrefix,
  isTokenTypeAccepted,
  signedOutAuthObject,
  TokenType,
} from '@clerk/backend/internal';
import { decodeJwt } from '@clerk/backend/jwt';
import type { PendingSessionOptions } from '@clerk/shared/types';

import type { LoggerNoCommit } from '../../utils/debugLogger';
import { API_URL, API_VERSION, PUBLISHABLE_KEY, SECRET_KEY } from '../constants';
import { getAuthKeyFromRequest, getHeader } from '../headers-utils';
import type { RequestLike } from '../types';
import { assertTokenSignature, decryptClerkRequestData } from '../utils';

export type GetAuthDataFromRequestOptions = {
  secretKey?: string;
  logger?: LoggerNoCommit;
  acceptsToken?: AuthenticateRequestOptions['acceptsToken'];
} & PendingSessionOptions;

/**
 * Extracts auth headers from the request
 */
const getAuthHeaders = (req: RequestLike) => {
  return {
    authStatus: getAuthKeyFromRequest(req, 'AuthStatus'),
    authToken: getAuthKeyFromRequest(req, 'AuthToken'),
    authMessage: getAuthKeyFromRequest(req, 'AuthMessage'),
    authReason: getAuthKeyFromRequest(req, 'AuthReason'),
    authSignature: getAuthKeyFromRequest(req, 'AuthSignature'),
  };
};

/**
 * Creates auth options object with fallbacks from encrypted request data
 */
const createAuthOptions = (req: RequestLike, opts: GetAuthDataFromRequestOptions, treatPendingAsSignedOut = true) => {
  const encryptedRequestData = getHeader(req, constants.Headers.ClerkRequestData);
  const decryptedRequestData = decryptClerkRequestData(encryptedRequestData);

  return {
    secretKey: opts?.secretKey || decryptedRequestData.secretKey || SECRET_KEY,
    publishableKey: decryptedRequestData.publishableKey || PUBLISHABLE_KEY,
    apiUrl: API_URL,
    apiVersion: API_VERSION,
    authStatus: getAuthKeyFromRequest(req, 'AuthStatus'),
    authMessage: getAuthKeyFromRequest(req, 'AuthMessage'),
    authReason: getAuthKeyFromRequest(req, 'AuthReason'),
    treatPendingAsSignedOut,
  };
};

/**
 * Given a request object, builds an auth object from the request data. Used in server-side environments to get access
 * to auth data for a given request.
 */
export const getSessionAuthDataFromRequest = (
  req: RequestLike,
  { treatPendingAsSignedOut = true, ...opts }: GetAuthDataFromRequestOptions = {},
): SignedInAuthObject | SignedOutAuthObject => {
  const { authStatus, authMessage, authReason, authToken, authSignature } = getAuthHeaders(req);

  opts.logger?.debug('headers', { authStatus, authMessage, authReason });

  const options = createAuthOptions(req, opts, treatPendingAsSignedOut);

  // Only accept session tokens in this function.
  // Machine tokens are not supported and will result in a signed-out state.
  if (!isTokenTypeAccepted(TokenType.SessionToken, opts.acceptsToken || TokenType.SessionToken)) {
    return signedOutAuthObject(options);
  }

  let authObject;
  if (!authStatus || authStatus !== AuthStatus.SignedIn) {
    authObject = signedOutAuthObject(options);
  } else {
    assertTokenSignature(authToken as string, options.secretKey, authSignature);

    const jwt = decodeJwt(authToken as string);

    opts.logger?.debug('jwt', jwt.raw);

    return getAuthObjectFromJwt(jwt, options);
  }

  return authObject;
};

/**
 * Given a request object, builds an auth object from the request data. Used in server-side environments to get access
 * to auth data for a given request.
 *
 * This function handles both session tokens and machine tokens:
 * - Session tokens: Decoded from JWT and validated
 * - Machine tokens: Retrieved from encrypted request data (x-clerk-request-data header)
 */
export const getAuthDataFromRequest = (req: RequestLike, opts: GetAuthDataFromRequestOptions = {}): AuthObject => {
  const { authStatus, authMessage, authReason } = getAuthHeaders(req);
  opts.logger?.debug('headers', { authStatus, authMessage, authReason });

  const encryptedRequestData = getHeader(req, constants.Headers.ClerkRequestData);
  const decryptedRequestData = decryptClerkRequestData(encryptedRequestData);

  const bearerToken = getHeader(req, constants.Headers.Authorization)?.replace('Bearer ', '');
  const acceptsToken = opts.acceptsToken || TokenType.SessionToken;

  const options = createAuthOptions(req, opts);

  // Handle machine tokens first (from encrypted request data)
  // Machine tokens are passed via x-clerk-request-data header from middleware
  const machineAuthObject = handleMachineToken(
    bearerToken,
    decryptedRequestData.machineAuthObject,
    acceptsToken,
    options,
  );
  if (machineAuthObject) {
    return machineAuthObject;
  }

  // If a random token is present and acceptsToken is an array that does NOT include session_token,
  // return invalid token auth object.
  if (bearerToken && Array.isArray(acceptsToken) && !acceptsToken.includes(TokenType.SessionToken)) {
    return invalidTokenAuthObject();
  }

  // Fallback to session logic for all other cases
  return getSessionAuthDataFromRequest(req, opts);
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
