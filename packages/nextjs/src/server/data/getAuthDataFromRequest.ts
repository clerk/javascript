import type { AuthObject } from '@clerk/backend';
import type { AuthenticatedMachineObject, UnauthenticatedMachineObject } from '@clerk/backend/internal';
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
export type GetAuthDataFromRequestOptions = {
  secretKey?: string;
  logger?: LoggerNoCommit;
  entity?: 'user' | 'machine' | 'any';
};
export function getAuthDataFromRequest(
  req: RequestLike,
  opts: GetAuthDataFromRequestOptions & { entity: 'machine' },
): AuthenticatedMachineObject | UnauthenticatedMachineObject;
export function getAuthDataFromRequest(
  req: RequestLike,
  opts: GetAuthDataFromRequestOptions & { entity: 'user' },
): AuthObject;
export function getAuthDataFromRequest(
  req: RequestLike,
  opts: GetAuthDataFromRequestOptions & { entity: 'any' },
): AuthObject | AuthenticatedMachineObject | UnauthenticatedMachineObject;
export function getAuthDataFromRequest(req: RequestLike, opts?: GetAuthDataFromRequestOptions): AuthObject;
export function getAuthDataFromRequest(req: RequestLike, opts: GetAuthDataFromRequestOptions = {}) {
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

  if (!authStatus) {
    switch (opts.entity) {
      case 'machine':
        return unauthenticatedMachineObject(options);
      case 'user':
      default:
        return signedOutAuthObject(options);
    }
  }

  assertTokenSignature(authToken as string, options.secretKey, authSignature);
  const jwt = decodeJwt(authToken as string);
  opts.logger?.debug('jwt', jwt.raw);

  let authObject;
  // If entity is `any`, automatically derive the property entity type so we can return the proper auth object
  const realEntity = opts.entity === 'any' ? getEntityFromSubClaim(authToken) : opts.entity;

  switch (realEntity) {
    case 'machine':
      if (authStatus !== AuthStatus.MachineAuthenticated) {
        authObject = unauthenticatedMachineObject(options);
      } else {
        authObject = authenticatedMachineObject(jwt.raw.text, jwt.payload);
      }
      break;
    case 'user':
      if (authStatus !== AuthStatus.SignedIn) {
        authObject = signedOutAuthObject(options);
      } else {
        // @ts-expect-error -- Restrict parameter type of options to only list what's needed
        authObject = signedInAuthObject(options, jwt.raw.text, jwt.payload);
      }
      break;
    default:
      // fallback to signed out, shouldn't ever happen

      // @ts-expect-error -- Restrict parameter type of options to only list what's needed
      authObject = signedInAuthObject(options, jwt.raw.text, jwt.payload);
      break;
  }

  return authObject;
}

function getEntityFromSubClaim(authToken: string | null | undefined) {
  if (!authToken) {
    return 'user';
  }
  const jwt = decodeJwt(authToken);
  if (jwt.payload.sub.startsWith('mch_')) {
    return 'machine';
  }

  return 'user';
}
