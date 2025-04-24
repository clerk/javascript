import type { AuthObject } from '@clerk/backend';
import type {
  AuthenticatedMachineObject,
  SignedInAuthObject,
  SignedOutAuthObject,
  TokenType,
  UnauthenticatedMachineObject,
} from '@clerk/backend/internal';
import { AuthStatus, constants, signedInAuthObject, signedOutAuthObject } from '@clerk/backend/internal';
import { decodeJwt } from '@clerk/backend/jwt';

import type { LoggerNoCommit } from '../../utils/debugLogger';
import { API_URL, API_VERSION, PUBLISHABLE_KEY, SECRET_KEY } from '../constants';
import { getAuthKeyFromRequest, getHeader } from '../headers-utils';
import type { InferAuthObjectFromTokenArray, RequestLike } from '../types';
import { assertTokenSignature, decryptClerkRequestData } from '../utils';

export type GetAuthDataFromRequestOptions = {
  secretKey?: string;
  logger?: LoggerNoCommit;
  acceptsToken?: TokenType | TokenType[] | 'any';
};

type SessionAuthObject = SignedInAuthObject | SignedOutAuthObject;
type MachineAuthObject = AuthenticatedMachineObject | UnauthenticatedMachineObject;

export interface GetAuthDataRequestFn {
  <T extends TokenType>(
    req: RequestLike,
    opts: GetAuthDataFromRequestOptions & { acceptsToken: T },
  ): T extends 'session_token' ? SessionAuthObject : MachineAuthObject;

  <T extends TokenType[]>(
    req: RequestLike,
    opts: GetAuthDataFromRequestOptions & { acceptsToken: T },
  ): InferAuthObjectFromTokenArray<T, SessionAuthObject, MachineAuthObject>;

  (req: RequestLike, opts: GetAuthDataFromRequestOptions & { acceptsToken: 'any' }): AuthObject;

  (req: RequestLike, opts?: GetAuthDataFromRequestOptions): SessionAuthObject;
}

/**
 * Given a request object, builds an auth object from the request data. Used in server-side environments to get access
 * to auth data for a given request.
 */
export const getAuthDataFromRequest: GetAuthDataRequestFn = ((
  req: RequestLike,
  opts: GetAuthDataFromRequestOptions = {},
): AuthObject => {
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

  let authObject: AuthObject;

  // TODO: Handle machine tokens

  if (!authStatus || authStatus !== AuthStatus.SignedIn) {
    authObject = signedOutAuthObject(options);
  } else {
    assertTokenSignature(authToken as string, options.secretKey, authSignature);

    const jwt = decodeJwt(authToken as string);

    opts.logger?.debug('jwt', jwt.raw);

    // @ts-expect-error -- Restrict parameter type of options to only list what's needed
    authObject = signedInAuthObject(options, jwt.raw.text, jwt.payload);
  }

  return authObject;
}) as GetAuthDataRequestFn;
