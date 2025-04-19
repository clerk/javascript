import { createCheckAuthorization } from '@clerk/shared/authorization';
import { __experimental_JWTPayloadToAuthObjectProperties } from '@clerk/shared/jwtPayloadParser';
import type {
  CheckAuthorizationFromSessionClaims,
  JwtPayload,
  Override,
  ServerGetToken,
  ServerGetTokenOptions,
  SharedSignedInAuthObjectProperties,
} from '@clerk/types';

import type { CreateBackendApiOptions } from '../api';
import { APIKey, createBackendApiClient, IdPOAuthAccessToken, MachineToken } from '../api';
import type { AuthenticateContext } from './authenticateContext';
import type { MachineAuthType, NonSessionTokenType } from './types';

type AuthObjectDebugData = Record<string, any>;
type AuthObjectDebug = () => AuthObjectDebugData;

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
  tokenType: 'session_token';
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
  tokenType: 'session_token';
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

type BaseMachineAuthObject<T extends NonSessionTokenType> = {
  tokenType: T;
  name: string;
  subject: string;
  claims: Record<string, string> | null;
  createdAt: number;
  getToken: () => Promise<string>;
  has: CheckAuthorizationFromSessionClaims;
  debug: AuthObjectDebug;
};

export type AuthenticatedAPIKeyObject = BaseMachineAuthObject<'api_key'> &
  Pick<APIKey, 'type' | 'createdBy' | 'creationReason' | 'secondsUntilExpiration' | 'expiresAt'>;

export type AuthenticatedOAuthTokenObject = BaseMachineAuthObject<'oauth_token'> &
  Pick<IdPOAuthAccessToken, 'type' | 'expiresAt'>;

export type AuthenticatedMachineTokenObject = BaseMachineAuthObject<'machine_token'> &
  Pick<MachineToken, 'revoked' | 'expired' | 'expiration' | 'createdBy' | 'creationReason' | 'updatedAt'>;

/**
 * @internal
 */
export type AuthenticatedMachineObject =
  | AuthenticatedAPIKeyObject
  | AuthenticatedOAuthTokenObject
  | AuthenticatedMachineTokenObject;

export type UnauthenticatedAPIKeyObject = Override<
  AuthenticatedAPIKeyObject,
  {
    getToken: () => Promise<null>;
    name: null;
    subject: null;
    claims: null;
    createdAt: null;
    type: null;
    createdBy: null;
    creationReason: null;
    secondsUntilExpiration: null;
    expiresAt: null;
  }
>;

export type UnauthenticatedOAuthTokenObject = Override<
  AuthenticatedOAuthTokenObject,
  {
    getToken: () => Promise<null>;
    name: null;
    subject: null;
    claims: null;
    createdAt: null;
    type: null;
    expiresAt: null;
  }
>;

export type UnauthenticatedMachineTokenObject = Override<
  AuthenticatedMachineTokenObject,
  {
    getToken: () => Promise<null>;
    name: null;
    subject: null;
    claims: null;
    createdAt: null;
    revoked: null;
    expired: null;
    expiration: null;
    createdBy: null;
    creationReason: null;
    updatedAt: null;
  }
>;

/**
 * @internal
 */
export type UnauthenticatedMachineObject =
  | UnauthenticatedAPIKeyObject
  | UnauthenticatedOAuthTokenObject
  | UnauthenticatedMachineTokenObject;

/**
 * @internal
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
    tokenType: 'session_token',
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
    tokenType: 'session_token',
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
export function authenticatedMachineObject(
  tokenType: NonSessionTokenType,
  machineToken: string,
  verificationResult: MachineAuthType,
  debugData?: AuthObjectDebugData,
): AuthenticatedMachineObject {
  const baseObject = {
    name: verificationResult.name,
    subject: verificationResult.subject,
    claims: verificationResult.claims,
    createdAt: verificationResult.createdAt,
    getToken: () => Promise.resolve(machineToken),
    has: () => false,
    debug: createDebug(debugData),
  };

  if (verificationResult instanceof APIKey) {
    return {
      ...baseObject,
      tokenType: 'api_key',
      type: verificationResult.type,
      createdBy: verificationResult.createdBy,
      creationReason: verificationResult.creationReason,
      secondsUntilExpiration: verificationResult.secondsUntilExpiration,
      expiresAt: verificationResult.expiresAt,
    };
  }

  if (verificationResult instanceof IdPOAuthAccessToken) {
    return {
      ...baseObject,
      tokenType: 'oauth_token',
      type: verificationResult.type,
      expiresAt: verificationResult.expiresAt,
    };
  }

  if (verificationResult instanceof MachineToken) {
    return {
      ...baseObject,
      tokenType: 'machine_token',
      revoked: verificationResult.revoked,
      expired: verificationResult.expired,
      expiration: verificationResult.expiration,
      createdBy: verificationResult.createdBy,
      creationReason: verificationResult.creationReason,
      updatedAt: verificationResult.updatedAt,
    };
  }

  throw new Error(`Unsupported machine token type: ${tokenType}`);
}

/**
 * @internal
 */
export function unauthenticatedMachineObject(
  tokenType: NonSessionTokenType,
  debugData?: AuthObjectDebugData,
): UnauthenticatedMachineObject {
  const baseObject = {
    getToken: () => Promise.resolve(null),
    has: () => false,
    debug: createDebug(debugData),
  };

  if (tokenType === 'api_key') {
    return {
      ...baseObject,
      tokenType: 'api_key',
      name: null,
      subject: null,
      claims: null,
      createdAt: null,
      type: null,
      createdBy: null,
      creationReason: null,
      secondsUntilExpiration: null,
      expiresAt: null,
    };
  }

  if (tokenType === 'oauth_token') {
    return {
      ...baseObject,
      tokenType: 'oauth_token',
      name: null,
      subject: null,
      claims: null,
      createdAt: null,
      type: null,
      expiresAt: null,
    };
  }

  if (tokenType === 'machine_token') {
    return {
      ...baseObject,
      tokenType: 'machine_token',
      name: null,
      subject: null,
      claims: null,
      createdAt: null,
      revoked: null,
      expired: null,
      expiration: null,
      createdBy: null,
      creationReason: null,
      updatedAt: null,
    };
  }

  throw new Error(`Unsupported machine token type: ${tokenType}`);
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
