import type { AuthObject } from '@clerk/backend';
import {
  authenticatedMachineObject,
  type AuthenticateRequestOptions,
  AuthStatus,
  constants,
  getAuthObjectForAcceptedToken,
  getAuthObjectFromJwt,
  getMachineTokenType,
  invalidTokenAuthObject,
  isMachineTokenByPrefix,
  isTokenTypeAccepted,
  type SignedInAuthObject,
  type SignedOutAuthObject,
  signedOutAuthObject,
  TokenType,
  unauthenticatedMachineObject,
  verifyMachineAuthToken,
} from '@clerk/backend/internal';
import { decodeJwt } from '@clerk/backend/jwt';
import type { PendingSessionOptions } from '@clerk/types';

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
 * Given a request object, builds an auth object from the request data. Used in server-side environments to get access
 * to auth data for a given request.
 */
export const getAuthDataFromRequestSync = (
  req: RequestLike,
  { treatPendingAsSignedOut = true, ...opts }: GetAuthDataFromRequestOptions = {},
): SignedInAuthObject | SignedOutAuthObject => {
  const { authStatus, authMessage, authReason, authToken, authSignature } = getAuthHeaders(req);

  opts.logger?.debug('headers', { authStatus, authMessage, authReason });

  const encryptedRequestData = getHeader(req, constants.Headers.ClerkRequestData);
  const decryptedRequestData = decryptClerkRequestData(encryptedRequestData);

  const options = {
    secretKey: opts?.secretKey || decryptedRequestData.secretKey || SECRET_KEY,
    publishableKey: decryptedRequestData.publishableKey || PUBLISHABLE_KEY,
    apiUrl: API_URL,
    apiVersion: API_VERSION,
    authStatus,
    authMessage,
    authReason,
    treatPendingAsSignedOut,
  };

  // Only accept session tokens in the synchronous version.
  // Machine tokens are not supported in this function. Any machine token input will result in a signed-out state.
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
 */
export const getAuthDataFromRequestAsync = async (
  req: RequestLike,
  opts: GetAuthDataFromRequestOptions = {},
): Promise<AuthObject> => {
  const { authStatus, authMessage, authReason } = getAuthHeaders(req);
  opts.logger?.debug('headers', { authStatus, authMessage, authReason });

  const bearerToken = getHeader(req, constants.Headers.Authorization)?.replace('Bearer ', '');
  const acceptsToken = opts.acceptsToken || TokenType.SessionToken;
  const options = {
    secretKey: opts?.secretKey || SECRET_KEY,
    publishableKey: PUBLISHABLE_KEY,
    apiUrl: API_URL,
    authStatus,
    authMessage,
    authReason,
  };

  const hasMachineToken = bearerToken && isMachineTokenByPrefix(bearerToken);
  if (hasMachineToken) {
    const machineTokenType = getMachineTokenType(bearerToken);

    if (Array.isArray(acceptsToken) && !acceptsToken.includes(machineTokenType)) {
      return invalidTokenAuthObject();
    }

    const { data, errors } = await verifyMachineAuthToken(bearerToken, options);
    const authObject = errors
      ? unauthenticatedMachineObject(machineTokenType, options)
      : authenticatedMachineObject(machineTokenType, bearerToken, data);
    return getAuthObjectForAcceptedToken({ authObject, acceptsToken });
  }

  // If a random token is present and acceptsToken is an array that does NOT include session_token,
  // return invalidTokenAuthObject.
  if (bearerToken && Array.isArray(acceptsToken) && !acceptsToken.includes(TokenType.SessionToken)) {
    return invalidTokenAuthObject();
  }

  // Fallback to session logic (sync version) for all other cases
  const authObject = getAuthDataFromRequestSync(req, opts);
  return getAuthObjectForAcceptedToken({ authObject, acceptsToken });
};

const getAuthHeaders = (req: RequestLike) => {
  const authStatus = getAuthKeyFromRequest(req, 'AuthStatus');
  const authToken = getAuthKeyFromRequest(req, 'AuthToken');
  const authMessage = getAuthKeyFromRequest(req, 'AuthMessage');
  const authReason = getAuthKeyFromRequest(req, 'AuthReason');
  const authSignature = getAuthKeyFromRequest(req, 'AuthSignature');

  return {
    authStatus,
    authToken,
    authMessage,
    authReason,
    authSignature,
  };
};
