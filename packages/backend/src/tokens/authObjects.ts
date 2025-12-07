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

import type { APIKey, CreateBackendApiOptions, IdPOAuthAccessToken, M2MToken } from '../api';
import { createBackendApiClient } from '../api';
import { isTokenTypeAccepted } from '../internal';
import type { AuthenticateContext } from './authenticateContext';
import { isMachineTokenType } from './machine';
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
   * A function that gets the current user's [session token](https://clerk.com/docs/guides/sessions/session-tokens) or a [custom JWT template](https://clerk.com/docs/guides/sessions/jwt-templates).
   */
  getToken: ServerGetToken;
  /**
   * A function that checks if the user has an Organization Role or Custom Permission.
   */
  has: CheckAuthorizationFromSessionClaims;
  /**
   * Used to help debug issues when using Clerk in development.
   */
  debug: AuthObjectDebug;
  isAuthenticated: true;
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
  isAuthenticated: false;
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
  m2m_token: {
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
      isAuthenticated: true;
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
      isAuthenticated: false;
    } & MachineObjectExtendedProperties<false>[T]
  : never;

export type InvalidTokenAuthObject = {
  isAuthenticated: false;
  tokenType: null;
  getToken: () => Promise<null>;
  has: () => false;
  debug: AuthObjectDebug;
};

/**
 * @interface
 */
export type AuthObject =
  | SignedInAuthObject
  | SignedOutAuthObject
  | AuthenticatedMachineObject
  | UnauthenticatedMachineObject
  | InvalidTokenAuthObject;

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
    fetcher: async (sessionId, template, expiresInSeconds) =>
      (await apiClient.sessions.getToken(sessionId, template || '', expiresInSeconds)).jwt,
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
    isAuthenticated: true,
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
    isAuthenticated: false,
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
    isAuthenticated: true,
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
    case TokenType.M2MToken: {
      const result = verificationResult as M2MToken;
      return {
        ...baseObject,
        tokenType,
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
    isAuthenticated: false,
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
    case TokenType.M2MToken: {
      return {
        ...baseObject,
        tokenType,
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
 * @internal
 */
export function invalidTokenAuthObject(): InvalidTokenAuthObject {
  return {
    isAuthenticated: false,
    tokenType: null,
    getToken: () => Promise.resolve(null),
    has: () => false,
    debug: () => ({}),
  };
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

/**
 * A function that fetches a session token from the Clerk API.
 *
 * @param sessionId - The ID of the session
 * @param template - The JWT template name to use for token generation
 * @param expiresInSeconds - Optional expiration time in seconds for the token
 * @returns A promise that resolves to the token string
 */
type TokenFetcher = (sessionId: string, template?: string, expiresInSeconds?: number) => Promise<string>;

/**
 * Factory function type that creates a getToken function for auth objects.
 *
 * @param params - Configuration object containing session information and token fetcher
 * @returns A ServerGetToken function that can be used to retrieve tokens
 */
type CreateGetToken = (params: { sessionId: string; sessionToken: string; fetcher: TokenFetcher }) => ServerGetToken;

/**
 * Creates a token retrieval function for authenticated sessions.
 *
 * This factory function returns a getToken function that can either return the raw session token
 * or generate a JWT using a specified template with optional custom expiration.
 *
 * @param params - Configuration object
 * @param params.sessionId - The session ID for token generation
 * @param params.sessionToken - The raw session token to return when no template is specified
 * @param params.fetcher - Function to fetch tokens from the Clerk API
 *
 * @returns A function that retrieves tokens based on the provided options
 */
const createGetToken: CreateGetToken = params => {
  const { fetcher, sessionToken, sessionId } = params || {};

  return async (options: ServerGetTokenOptions = {}) => {
    if (!sessionId) {
      return null;
    }

    if (options.template || options.expiresInSeconds !== undefined) {
      return fetcher(sessionId, options.template, options.expiresInSeconds);
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
 * Returns an auth object matching the requested token type(s).
 *
 * If the parsed token type does not match any in acceptsToken, returns:
 *   - an invalid token auth object if the token is not in the accepted array
 *   - an unauthenticated machine object for machine tokens, or
 *   - a signed-out session object otherwise.
 *
 * This ensures the returned object always matches the developer's intent.
 */
export const getAuthObjectForAcceptedToken = ({
  authObject,
  acceptsToken = TokenType.SessionToken,
}: {
  authObject: AuthObject;
  acceptsToken: AuthenticateRequestOptions['acceptsToken'];
}): AuthObject => {
  // 1. any token: return as-is
  if (acceptsToken === 'any') {
    return authObject;
  }

  // 2. array of tokens: must match one of the accepted types
  if (Array.isArray(acceptsToken)) {
    if (!isTokenTypeAccepted(authObject.tokenType, acceptsToken)) {
      return invalidTokenAuthObject();
    }
    return authObject;
  }

  // 3. single token: must match exactly, else return appropriate unauthenticated object
  if (!isTokenTypeAccepted(authObject.tokenType, acceptsToken)) {
    if (isMachineTokenType(acceptsToken)) {
      return unauthenticatedMachineObject(acceptsToken, authObject.debug);
    }
    return signedOutAuthObject(authObject.debug);
  }

  // 4. default: return as-is
  return authObject;
};
