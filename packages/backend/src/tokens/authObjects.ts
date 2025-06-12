import { createCheckAuthorization } from '@clerk/shared/authorization';
import { __experimental_JWTPayloadToAuthObjectProperties } from '@clerk/shared/jwtPayloadParser';
import type {
  CheckAuthorizationFromSessionClaims,
  Jwt,
  JwtPayload,
  PendingSessionOptions,
  ServerGetToken,
  ServerGetTokenOptions,
  SessionStatusClaim,
  SharedSignedInAuthObjectProperties,
} from '@clerk/types';

import type { APIKey, CreateBackendApiOptions, IdPOAuthAccessToken, MachineToken } from '../api';
import { createBackendApiClient } from '../api';
import { isTokenTypeAccepted } from '../internal';
import type { AuthenticateContext } from './authenticateContext';
import type { MachineTokenType, SessionTokenType } from './tokenTypes';
import { TokenType } from './tokenTypes';
import type { AuthenticateRequestOptions, MachineAuthType } from './types';

/**
 * @inline
 */
type AuthObjectDebugData = Record<string, any>;
/**
 * @inline
 */
type AuthObjectDebug = () => AuthObjectDebugData;

type Claims = Record<string, any>;

/**
 * @internal
 */
export type SignedInAuthObjectOptions = CreateBackendApiOptions & {
  token: string;
};

/**
 * @internal
 */
export type SignedInAuthObject = SharedSignedInAuthObjectProperties & {
  /**
   * The allowed token type.
   */
  tokenType: SessionTokenType;
  /**
   * A function that gets the current user's [session token](https://clerk.com/docs/backend-requests/resources/session-tokens) or a [custom JWT template](https://clerk.com/docs/backend-requests/jwt-templates).
   */
  getToken: ServerGetToken;
  /**
   * A function that checks if the user has an organization role or custom permission.
   */
  has: CheckAuthorizationFromSessionClaims;
  /**
   * Used to help debug issues when using Clerk in development.
   */
  debug: AuthObjectDebug;
};

/**
 * @internal
 */
export type SignedOutAuthObject = {
  sessionClaims: null;
  sessionId: null;
  sessionStatus: SessionStatusClaim | null;
  actor: null;
  tokenType: SessionTokenType;
  userId: null;
  orgId: null;
  orgRole: null;
  orgSlug: null;
  orgPermissions: null;
  factorVerificationAge: null;
  getToken: ServerGetToken;
  has: CheckAuthorizationFromSessionClaims;
  debug: AuthObjectDebug;
};

/**
 * Extended properties specific to each machine token type.
 * While all machine token types share common properties (id, name, subject, etc),
 * this type defines the additional properties that are unique to each token type.
 *
 * @template TAuthenticated - Whether the machine object is authenticated or not
 */
type MachineObjectExtendedProperties<TAuthenticated extends boolean> = {
  api_key: TAuthenticated extends true
    ?
        | { name: string; claims: Claims | null; userId: string; orgId: null }
        | { name: string; claims: Claims | null; userId: null; orgId: string }
    : { name: null; claims: null; userId: null; orgId: null };
  machine_token: {
    name: TAuthenticated extends true ? string : null;
    claims: TAuthenticated extends true ? Claims | null : null;
    machineId: TAuthenticated extends true ? string : null;
  };
  oauth_token: {
    userId: TAuthenticated extends true ? string : null;
    clientId: TAuthenticated extends true ? string : null;
  };
};

/**
 * @internal
 *
 * Uses `T extends any` to create a distributive conditional type.
 * This ensures that union types like `'api_key' | 'oauth_token'` are processed
 * individually, creating proper discriminated unions where each token type
 * gets its own distinct properties (e.g., oauth_token won't have claims).
 */
export type AuthenticatedMachineObject<T extends MachineTokenType = MachineTokenType> = T extends any
  ? {
      id: string;
      subject: string;
      scopes: string[];
      getToken: () => Promise<string>;
      has: CheckAuthorizationFromSessionClaims;
      debug: AuthObjectDebug;
      tokenType: T;
    } & MachineObjectExtendedProperties<true>[T]
  : never;

/**
 * @internal
 *
 * Uses `T extends any` to create a distributive conditional type.
 * This ensures that union types like `'api_key' | 'oauth_token'` are processed
 * individually, creating proper discriminated unions where each token type
 * gets its own distinct properties (e.g., oauth_token won't have claims).
 */
export type UnauthenticatedMachineObject<T extends MachineTokenType = MachineTokenType> = T extends any
  ? {
      id: null;
      subject: null;
      scopes: null;
      getToken: () => Promise<null>;
      has: CheckAuthorizationFromSessionClaims;
      debug: AuthObjectDebug;
      tokenType: T;
    } & MachineObjectExtendedProperties<false>[T]
  : never;

/**
 * @interface
 */
export type AuthObject =
  | SignedInAuthObject
  | SignedOutAuthObject
  | AuthenticatedMachineObject
  | UnauthenticatedMachineObject;

const createDebug = (data: AuthObjectDebugData | undefined) => {
  return () => {
    const res = { ...data };
    res.secretKey = (res.secretKey || '').substring(0, 7);
    res.jwtKey = (res.jwtKey || '').substring(0, 7);
    return { ...res };
  };
};

/**
 * @internal
 */
export function signedInAuthObject(
  authenticateContext: Partial<AuthenticateContext>,
  sessionToken: string,
  sessionClaims: JwtPayload,
): SignedInAuthObject {
  const { actor, sessionId, sessionStatus, userId, orgId, orgRole, orgSlug, orgPermissions, factorVerificationAge } =
    __experimental_JWTPayloadToAuthObjectProperties(sessionClaims);
  const apiClient = createBackendApiClient(authenticateContext);
  const getToken = createGetToken({
    sessionId,
    sessionToken,
    fetcher: async (...args) => (await apiClient.sessions.getToken(...args)).jwt,
  });
  return {
    tokenType: TokenType.SessionToken,
    actor,
    sessionClaims,
    sessionId,
    sessionStatus,
    userId,
    orgId,
    orgRole,
    orgSlug,
    orgPermissions,
    factorVerificationAge,
    getToken,
    has: createCheckAuthorization({
      orgId,
      orgRole,
      orgPermissions,
      userId,
      factorVerificationAge,
      features: (sessionClaims.fea as string) || '',
      plans: (sessionClaims.pla as string) || '',
    }),
    debug: createDebug({ ...authenticateContext, sessionToken }),
  };
}

/**
 * @internal
 */
export function signedOutAuthObject(
  debugData?: AuthObjectDebugData,
  initialSessionStatus?: SessionStatusClaim,
): SignedOutAuthObject {
  return {
    tokenType: TokenType.SessionToken,
    sessionClaims: null,
    sessionId: null,
    sessionStatus: initialSessionStatus ?? null,
    userId: null,
    actor: null,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    orgPermissions: null,
    factorVerificationAge: null,
    getToken: () => Promise.resolve(null),
    has: () => false,
    debug: createDebug(debugData),
  };
}

/**
 * @internal
 */
export function authenticatedMachineObject<T extends MachineTokenType>(
  tokenType: T,
  token: string,
  verificationResult: MachineAuthType,
  debugData?: AuthObjectDebugData,
): AuthenticatedMachineObject<T> {
  const baseObject = {
    id: verificationResult.id,
    subject: verificationResult.subject,
    getToken: () => Promise.resolve(token),
    has: () => false,
    debug: createDebug(debugData),
  };

  // Type assertions are safe here since we know the verification result type matches the tokenType.
  // We need these assertions because TS can't infer the specific type
  // just from the tokenType discriminator.

  switch (tokenType) {
    case TokenType.ApiKey: {
      const result = verificationResult as APIKey;
      return {
        ...baseObject,
        tokenType,
        name: result.name,
        claims: result.claims,
        scopes: result.scopes,
        userId: result.subject.startsWith('user_') ? result.subject : null,
        orgId: result.subject.startsWith('org_') ? result.subject : null,
      } as unknown as AuthenticatedMachineObject<T>;
    }
    case TokenType.MachineToken: {
      const result = verificationResult as MachineToken;
      return {
        ...baseObject,
        tokenType,
        name: result.name,
        claims: result.claims,
        scopes: result.scopes,
        machineId: result.subject,
      } as unknown as AuthenticatedMachineObject<T>;
    }
    case TokenType.OAuthToken: {
      const result = verificationResult as IdPOAuthAccessToken;
      return {
        ...baseObject,
        tokenType,
        scopes: result.scopes,
        userId: result.subject,
        clientId: result.clientId,
      } as unknown as AuthenticatedMachineObject<T>;
    }
    default:
      throw new Error(`Invalid token type: ${tokenType}`);
  }
}

/**
 * @internal
 */
export function unauthenticatedMachineObject<T extends MachineTokenType>(
  tokenType: T,
  debugData?: AuthObjectDebugData,
): UnauthenticatedMachineObject<T> {
  const baseObject = {
    id: null,
    subject: null,
    scopes: null,
    has: () => false,
    getToken: () => Promise.resolve(null),
    debug: createDebug(debugData),
  };

  switch (tokenType) {
    case TokenType.ApiKey: {
      return {
        ...baseObject,
        tokenType,
        name: null,
        claims: null,
        scopes: null,
        userId: null,
        orgId: null,
      } as unknown as UnauthenticatedMachineObject<T>;
    }
    case TokenType.MachineToken: {
      return {
        ...baseObject,
        tokenType,
        name: null,
        claims: null,
        scopes: null,
        machineId: null,
      } as unknown as UnauthenticatedMachineObject<T>;
    }
    case TokenType.OAuthToken: {
      return {
        ...baseObject,
        tokenType,
        scopes: null,
        userId: null,
        clientId: null,
      } as unknown as UnauthenticatedMachineObject<T>;
    }
    default:
      throw new Error(`Invalid token type: ${tokenType}`);
  }
}

/**
 * Auth objects moving through the server -> client boundary need to be serializable
 * as we need to ensure that they can be transferred via the network as pure strings.
 * Some frameworks like Remix or Next (/pages dir only) handle this serialization by simply
 * ignoring any non-serializable keys, however Nextjs /app directory is stricter and
 * throws an error if a non-serializable value is found.
 *
 * @internal
 */
export const makeAuthObjectSerializable = <T extends Record<string, unknown>>(obj: T): T => {
  // remove any non-serializable props from the returned object

  const { debug, getToken, has, ...rest } = obj as unknown as AuthObject;
  return rest as unknown as T;
};

type TokenFetcher = (sessionId: string, template: string) => Promise<string>;

type CreateGetToken = (params: { sessionId: string; sessionToken: string; fetcher: TokenFetcher }) => ServerGetToken;

const createGetToken: CreateGetToken = params => {
  const { fetcher, sessionToken, sessionId } = params || {};

  return async (options: ServerGetTokenOptions = {}) => {
    if (!sessionId) {
      return null;
    }

    if (options.template) {
      return fetcher(sessionId, options.template);
    }

    return sessionToken;
  };
};

/**
 * @internal
 */
export const getAuthObjectFromJwt = (
  jwt: Jwt,
  { treatPendingAsSignedOut = true, ...options }: PendingSessionOptions & Partial<AuthenticateContext>,
) => {
  const authObject = signedInAuthObject(options, jwt.raw.text, jwt.payload);

  if (treatPendingAsSignedOut && authObject.sessionStatus === 'pending') {
    return signedOutAuthObject(options, authObject.sessionStatus);
  }

  return authObject;
};

/**
 * @internal
 * Filters and coerces an AuthObject based on the accepted token type(s).
 *
 * This function is used after authentication to ensure that the returned auth object
 * matches the expected token type(s) specified by `acceptsToken`. If the token type
 * of the provided `authObject` does not match any of the types in `acceptsToken`,
 * it returns an unauthenticated or signed-out version of the object, depending on the token type.
 *
 * - If `acceptsToken` is `'any'`, the original auth object is returned.
 * - If `acceptsToken` is a single token type or an array of token types, the function checks if
 *   `authObject.tokenType` matches any of them.
 * - If the token type does not match and is a session token, a signed-out object is returned.
 * - If the token type does not match and is a machine token, an unauthenticated machine object is returned.
 * - If the token type matches, the original auth object is returned.
 *
 * @param {Object} params
 * @param {AuthObject} params.authObject - The authenticated object to filter.
 * @param {AuthenticateRequestOptions['acceptsToken']} [params.acceptsToken=TokenType.SessionToken] - The accepted token type(s). Can be a string, array of strings, or 'any'.
 * @returns {AuthObject} The filtered or coerced auth object.
 *
 * @example
 * // Accept only 'api_key' tokens
 * const authObject = { tokenType: 'session_token', userId: 'user_123' };
 * const result = getAuthObjectForAcceptedToken({ authObject, acceptsToken: 'api_key' });
 * // result will be a signed-out object (since tokenType is 'session_token' and does not match)
 *
 * @example
 * // Accept 'api_key' or 'machine_token'
 * const authObject = { tokenType: 'machine_token', id: 'm2m_123' };
 * const result = getAuthObjectForAcceptedToken({ authObject, acceptsToken: ['api_key', 'machine_token'] });
 * // result will be the original authObject (since tokenType matches one in the array)
 *
 * @example
 * // Accept any token type
 * const authObject = { tokenType: 'api_key', id: 'ak_123' };
 * const result = getAuthObjectForAcceptedToken({ authObject, acceptsToken: 'any' });
 * // result will be the original authObject
 */
export function getAuthObjectForAcceptedToken({
  authObject,
  acceptsToken = TokenType.SessionToken,
}: {
  authObject: AuthObject;
  acceptsToken: AuthenticateRequestOptions['acceptsToken'];
}): AuthObject {
  if (acceptsToken === 'any') {
    return authObject;
  }

  if (!isTokenTypeAccepted(authObject.tokenType, acceptsToken)) {
    if (authObject.tokenType === TokenType.SessionToken) {
      return signedOutAuthObject(authObject.debug);
    }
    return unauthenticatedMachineObject(authObject.tokenType, authObject.debug);
  }

  return authObject;
}
