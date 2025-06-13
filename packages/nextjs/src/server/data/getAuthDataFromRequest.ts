import type { AuthObject } from '@clerk/backend';
import {
  authenticatedMachineObject,
  type AuthenticateRequestOptions,
  AuthStatus,
  constants,
  getAuthObjectFromJwt,
  getMachineTokenType,
  invalidTokenAuthObject,
  isMachineTokenByPrefix,
  isMachineTokenType,
  isTokenTypeAccepted,
  type MachineTokenType,
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
 * Note: We intentionally avoid using interface/function overloads here since these functions
 * are used internally. The complex type overloads are more valuable at the public API level
 * (like in auth.protect(), auth()) where users interact directly with the types.
 *
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

  if (bearerToken) {
    const isMachine = isMachineTokenByPrefix(bearerToken);
    const tokenType = isMachine ? getMachineTokenType(bearerToken) : undefined;

    if (Array.isArray(acceptsToken)) {
      if (isMachine) {
        if (!tokenType) {
          return signedOutAuthObject(options);
        }
        return handleMachineToken({ bearerToken, tokenType, acceptsToken, options });
      } else {
        return signedOutAuthObject(options);
      }
    } else {
      let intendedType: TokenType | undefined;
      if (isMachineTokenType(acceptsToken)) {
        intendedType = acceptsToken;
      }
      const result = await handleIntentBased({
        isMachine,
        tokenType,
        intendedType,
        bearerToken,
        acceptsToken,
        options,
      });
      if (result) {
        return result;
      }
    }
  }

  return getAuthDataFromRequestSync(req, opts);
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

/**
 * Handles verification and response shaping for machine tokens.
 * Returns an authenticated or unauthenticated machine object based on verification and type acceptance.
 */
async function handleMachineToken({
  bearerToken,
  tokenType,
  acceptsToken,
  options,
}: {
  bearerToken: string;
  tokenType: MachineTokenType;
  acceptsToken: AuthenticateRequestOptions['acceptsToken'];
  options: Record<string, any>;
}) {
  if (Array.isArray(acceptsToken)) {
    // If the token is not in the accepted array, return invalid token auth object
    if (!isTokenTypeAccepted(tokenType, acceptsToken)) {
      return invalidTokenAuthObject();
    }
  }

  if (!isTokenTypeAccepted(tokenType, acceptsToken ?? TokenType.SessionToken)) {
    return unauthenticatedMachineObject(tokenType, options);
  }
  const { data, errors } = await verifyMachineAuthToken(bearerToken, options);
  if (errors) {
    return unauthenticatedMachineObject(tokenType, options);
  }
  return authenticatedMachineObject(tokenType, bearerToken, data);
}

/**
 * Handles intent-based fallback for single-value acceptsToken.
 * Returns an unauthenticated object for the intended type, or falls back to session logic if not applicable.
 */
async function handleIntentBased({
  isMachine,
  tokenType,
  intendedType,
  bearerToken,
  acceptsToken,
  options,
}: {
  isMachine: boolean;
  tokenType: TokenType | undefined;
  intendedType: TokenType | undefined;
  bearerToken: string;
  acceptsToken: AuthenticateRequestOptions['acceptsToken'];
  options: Record<string, any>;
}) {
  if (isMachine) {
    if (!tokenType) {
      return signedOutAuthObject(options);
    }
    if (!isTokenTypeAccepted(tokenType, acceptsToken ?? TokenType.SessionToken)) {
      if (intendedType && isMachineTokenType(intendedType)) {
        return unauthenticatedMachineObject(intendedType, options);
      }
      return signedOutAuthObject(options);
    }
    const { data, errors } = await verifyMachineAuthToken(bearerToken, options);
    if (errors) {
      return unauthenticatedMachineObject(tokenType as MachineTokenType, options);
    }
    return authenticatedMachineObject(tokenType as MachineTokenType, bearerToken, data);
  } else if (intendedType && isMachineTokenType(intendedType)) {
    return unauthenticatedMachineObject(intendedType, options);
  }
  // else: fall through to session logic
  return null;
}
