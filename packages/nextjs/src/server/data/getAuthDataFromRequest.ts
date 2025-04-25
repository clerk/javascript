import type { AuthObject } from '@clerk/backend';
import type { SignedInAuthObject, SignedOutAuthObject, TokenType } from '@clerk/backend/internal';
import {
  authenticatedMachineObject,
  AuthStatus,
  constants,
  isMachineToken,
  signedInAuthObject,
  signedOutAuthObject,
  unauthenticatedMachineObject,
  verifyMachineAuthToken,
} from '@clerk/backend/internal';
import { decodeJwt } from '@clerk/backend/jwt';

import type { LoggerNoCommit } from '../../utils/debugLogger';
import { API_URL, API_VERSION, PUBLISHABLE_KEY, SECRET_KEY } from '../constants';
import { getAuthKeyFromRequest, getHeader } from '../headers-utils';
import type { RequestLike } from '../types';
import { assertTokenSignature, decryptClerkRequestData } from '../utils';

export type GetAuthDataFromRequestOptions = {
  secretKey?: string;
  logger?: LoggerNoCommit;
  acceptsToken?: TokenType | TokenType[] | 'any';
};

type SessionAuthObject = SignedInAuthObject | SignedOutAuthObject;

export const getAuthDataFromRequestSync = (
  req: RequestLike,
  opts: GetAuthDataFromRequestOptions = {},
): SessionAuthObject => {
  const authStatus = getAuthKeyFromRequest(req, 'AuthStatus');
  const authToken = getAuthKeyFromRequest(req, 'AuthToken');
  const authMessage = getAuthKeyFromRequest(req, 'AuthMessage');
  const authReason = getAuthKeyFromRequest(req, 'AuthReason');
  const authSignature = getAuthKeyFromRequest(req, 'AuthSignature');

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
  };

  opts.logger?.debug('auth options', options);

  if (!authStatus || authStatus !== AuthStatus.SignedIn) {
    return signedOutAuthObject(options);
  }

  assertTokenSignature(authToken as string, options.secretKey, authSignature);
  const jwt = decodeJwt(authToken as string);
  opts.logger?.debug('jwt', jwt.raw);

  // @ts-expect-error -- Restrict parameter type of options to only list what's needed
  return signedInAuthObject(options, jwt.raw.text, jwt.payload);
};

/**
 * Given a request object, builds an auth object from the request data. Used in server-side environments to get access
 * to auth data for a given request.
 */
export const getAuthDataFromRequest = async (
  req: RequestLike,
  opts: GetAuthDataFromRequestOptions = {},
): Promise<AuthObject> => {
  const authStatus = getAuthKeyFromRequest(req, 'AuthStatus');
  const authMessage = getAuthKeyFromRequest(req, 'AuthMessage');
  const authReason = getAuthKeyFromRequest(req, 'AuthReason');

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
  };

  const bearerToken = getHeader(req, constants.Headers.Authorization)?.replace('Bearer ', '');

  // Handle machine tokens if bearer token exists and is a machine token
  if (bearerToken && isMachineToken(bearerToken)) {
    const { data, errors, tokenType } = await verifyMachineAuthToken(bearerToken, options);
    if (errors) {
      return unauthenticatedMachineObject(tokenType, {
        reason: authReason,
        message: authMessage,
        headers: new Headers(),
      });
    }

    return authenticatedMachineObject(tokenType, bearerToken, data);
  }

  // Fall back to sync version for session tokens
  return getAuthDataFromRequestSync(req, opts);
};
