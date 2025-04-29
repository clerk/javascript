import type { AuthObject } from '@clerk/backend';
import type { AuthenticateRequestOptions, SignedInAuthObject, SignedOutAuthObject } from '@clerk/backend/internal';
import {
  authenticatedMachineObject,
  AuthStatus,
  constants,
  getMachineTokenType,
  isMachineToken,
  isTokenTypeAccepted,
  signedInAuthObject,
  signedOutAuthObject,
  TokenType,
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
  acceptsToken?: AuthenticateRequestOptions['acceptsToken'];
};

export const getAuthDataFromRequestSync = (
  req: RequestLike,
  opts: GetAuthDataFromRequestOptions = {},
): SignedInAuthObject | SignedOutAuthObject => {
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

  // Only accept session tokens in sync version
  if (!isTokenTypeAccepted(TokenType.SessionToken, opts.acceptsToken || TokenType.SessionToken)) {
    return signedOutAuthObject(options);
  }

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
export const getAuthDataFromRequestAsync = async (
  req: RequestLike,
  opts: GetAuthDataFromRequestOptions = {},
): Promise<AuthObject> => {
  const bearerToken = getHeader(req, constants.Headers.Authorization)?.replace('Bearer ', '');
  const acceptsToken = opts.acceptsToken || TokenType.SessionToken;

  if (bearerToken && isMachineToken(bearerToken)) {
    const tokenType = getMachineTokenType(bearerToken);

    if (!isTokenTypeAccepted(tokenType, acceptsToken)) {
      return unauthenticatedMachineObject(tokenType);
    }

    const options = {
      secretKey: opts?.secretKey || SECRET_KEY,
      publishableKey: PUBLISHABLE_KEY,
      apiUrl: API_URL,
      apiVersion: API_VERSION,
    };

    // TODO: Cache the result of verifyMachineAuthToken
    const { data, errors } = await verifyMachineAuthToken(bearerToken, options);
    if (errors) {
      return unauthenticatedMachineObject(tokenType);
    }

    return authenticatedMachineObject(tokenType, bearerToken, data);
  }

  return getAuthDataFromRequestSync(req, opts);
};
