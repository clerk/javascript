import type { AuthObject } from '@clerk/backend';
import {
  authenticatedMachineObject,
  AuthStatus,
  constants,
  signedInAuthObject,
  signedOutAuthObject,
  unauthenticatedMachineObject,
} from '@clerk/backend/internal';
import { decodeJwt } from '@clerk/backend/jwt';

import type { LoggerNoCommit } from '../../utils/debugLogger';
import { API_URL, API_VERSION, PUBLISHABLE_KEY, SECRET_KEY } from '../constants';
import type { RequestLike } from '../types';
import { assertTokenSignature, decryptClerkRequestData, getAuthKeyFromRequest, getHeader } from '../utils';

/**
 * Given a request object, builds an auth object from the request data. Used in server-side environments to get access
 * to auth data for a given request.
 */
export function getAuthDataFromRequest(
  req: RequestLike,
  opts: { secretKey?: string; logger?: LoggerNoCommit; entity: 'machine' },
): Omit<AuthObject, 'SignedInAuthObject' | 'SignedOutAuthObject'>;
export function getAuthDataFromRequest(
  req: RequestLike,
  opts: { secretKey?: string; logger?: LoggerNoCommit; entity: 'user' },
): Omit<AuthObject, 'AuthenticatedMachineObject' | 'UnauthenticatedMachineObject'>;
export function getAuthDataFromRequest(
  req: RequestLike,
  opts: { secretKey?: string; logger?: LoggerNoCommit; entity?: 'user' | 'machine' } = {},
): AuthObject {
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

  let authObject;

  if (opts.entity === 'machine' && (!authStatus || authStatus !== AuthStatus.MachineAuthenticated)) {
    authObject = unauthenticatedMachineObject(options);
  } else if (opts.entity === 'machine' && authStatus === AuthStatus.MachineAuthenticated) {
    assertTokenSignature(authToken as string, options.secretKey, authSignature);

    const jwt = decodeJwt(authToken as string);

    opts.logger?.debug('jwt', jwt.raw);
    authObject = authenticatedMachineObject(jwt.raw.text, jwt.payload);
  } else if (!authStatus || authStatus !== AuthStatus.SignedIn) {
    authObject = signedOutAuthObject(options);
  } else {
    assertTokenSignature(authToken as string, options.secretKey, authSignature);

    const jwt = decodeJwt(authToken as string);

    opts.logger?.debug('jwt', jwt.raw);

    // @ts-expect-error -- Restrict parameter type of options to only list what's needed
    authObject = signedInAuthObject(options, jwt.raw.text, jwt.payload);
  }

  return authObject;
}
