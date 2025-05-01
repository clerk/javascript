import { createCheckAuthorization } from '@clerk/shared/authorization';
import { __experimental_JWTPayloadToAuthObjectProperties } from '@clerk/shared/jwtPayloadParser';
import type {
  CheckAuthorizationFromSessionClaims,
  JwtPayload,
  ServerGetToken,
  ServerGetTokenOptions,
  SharedSignedInAuthObjectProperties,
} from '@clerk/types';

import type { APIKey, CreateBackendApiOptions, MachineToken } from '../api';
import { createBackendApiClient } from '../api';
import type { AuthenticateContext } from './authenticateContext';
import type { MachineTokenType, SessionTokenType } from './tokenTypes';
import { TokenType } from './tokenTypes';
import type { MachineAuthType } from './types';

type AuthObjectDebugData = Record<string, any>;
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
  tokenType: SessionTokenType;
  getToken: ServerGetToken;
  has: CheckAuthorizationFromSessionClaims;
  debug: AuthObjectDebug;
};

/**
 * @internal
 */
export type SignedOutAuthObject = {
  sessionClaims: null;
  sessionId: null;
  sessionStatus: null;
  actor: null;
  tokenType: SessionTokenType;
  userId: null;
  orgId: null;
  orgRole: null;
  orgSlug: null;
  orgPermissions: null;
  /**
   * Factor Verification Age
   * Each item represents the minutes that have passed since the last time a first or second factor were verified.
   * [fistFactorAge, secondFactorAge]
   */
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
 * @example
 * api_key & machine_token: adds `claims` property
 * oauth_token: adds no additional properties (empty object)
 *
 * @template TAuthenticated - Whether the machine object is authenticated or not
 */
type MachineObjectExtendedProperties<TAuthenticated extends boolean> = {
  api_key: { claims: TAuthenticated extends true ? Claims | null : null };
  machine_token: { claims: TAuthenticated extends true ? Claims | null : null };
  oauth_token: object;
};

/**
 * @internal
 */
export type AuthenticatedMachineObject<T extends MachineTokenType = MachineTokenType> = {
  id: string;
  name: string;
  subject: string;
  scopes: string[];
  getToken: () => Promise<string>;
  has: CheckAuthorizationFromSessionClaims;
  debug: AuthObjectDebug;
  tokenType: T;
} & MachineObjectExtendedProperties<true>[T];

/**
 * @internal
 */
export type UnauthenticatedMachineObject<T extends MachineTokenType = MachineTokenType> = {
  id: null;
  name: null;
  subject: null;
  scopes: null;
  getToken: () => Promise<null>;
  has: CheckAuthorizationFromSessionClaims;
  debug: AuthObjectDebug;
  tokenType: T;
} & MachineObjectExtendedProperties<false>[T];

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
  authenticateContext: AuthenticateContext,
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
export function signedOutAuthObject(debugData?: AuthObjectDebugData): SignedOutAuthObject {
  return {
    tokenType: TokenType.SessionToken,
    sessionClaims: null,
    sessionId: null,
    sessionStatus: null,
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
    name: verificationResult.name,
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
        claims: result.claims,
        scopes: result.scopes,
      };
    }
    case TokenType.MachineToken: {
      const result = verificationResult as MachineToken;
      return {
        ...baseObject,
        tokenType,
        claims: result.claims,
        scopes: result.scopes,
      };
    }
    case TokenType.OAuthToken: {
      return {
        ...baseObject,
        tokenType,
        scopes: verificationResult.scopes,
      } as AuthenticatedMachineObject<T>;
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
    name: null,
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
        claims: null,
      };
    }
    case TokenType.MachineToken: {
      return {
        ...baseObject,
        tokenType,
        claims: null,
      };
    }
    case TokenType.OAuthToken: {
      return {
        ...baseObject,
        tokenType,
      } as UnauthenticatedMachineObject<T>;
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
