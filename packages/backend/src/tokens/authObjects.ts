import { createCheckAuthorization } from '@clerk/shared/authorization';
import type {
  ActClaim,
  CheckAuthorizationFromSessionClaims,
  JwtPayload,
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
  ServerGetToken,
  ServerGetTokenOptions,
  SessionStatusClaim,
} from '@clerk/types';

import type { CreateBackendApiOptions } from '../api';
import { createBackendApiClient } from '../api';
import type { AuthenticateContext } from './authenticateContext';

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
type SignedInAuthObjectProperties = {
  sessionClaims: JwtPayload;
  sessionId: string;
  sessionStatus: SessionStatusClaim | null;
  actor: ActClaim | undefined;
  userId: string;
  orgId: string | undefined;
  orgRole: OrganizationCustomRoleKey | undefined;
  orgSlug: string | undefined;
  orgPermissions: OrganizationCustomPermissionKey[] | undefined;
  /**
   * Factor Verification Age
   * Each item represents the minutes that have passed since the last time a first or second factor were verified.
   * [fistFactorAge, secondFactorAge]
   */
  factorVerificationAge: [firstFactorAge: number, secondFactorAge: number] | null;
};

/**
 * @internal
 */
export type SignedInAuthObject = SignedInAuthObjectProperties & {
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
 * @internal
 */
export type AuthObject = SignedInAuthObject | SignedOutAuthObject;

const createDebug = (data: AuthObjectDebugData | undefined) => {
  return () => {
    const res = { ...data };
    res.secretKey = (res.secretKey || '').substring(0, 7);
    res.jwtKey = (res.jwtKey || '').substring(0, 7);
    return { ...res };
  };
};

const generateSignedInAuthObjectProperties = (claims: JwtPayload): SignedInAuthObjectProperties => {
  // fva can be undefined for instances that have not opt-in
  const factorVerificationAge = claims.fva ?? null;

  // sts can be undefined for instances that have not opt-in
  const sessionStatus = claims.sts ?? null;

  // TODO(jwt-v2): replace this when the new claim for org permissions is added, this will not break
  // anything since the JWT v2 is not yet available
  const orgPermissions = claims.org_permissions;

  return {
    sessionClaims: claims,
    sessionId: claims.sid,
    sessionStatus,
    actor: claims.act,
    userId: claims.sub,
    orgId: claims.org_id,
    orgRole: claims.org_role,
    orgSlug: claims.org_slug,
    orgPermissions,
    factorVerificationAge,
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
    generateSignedInAuthObjectProperties(sessionClaims);
  const apiClient = createBackendApiClient(authenticateContext);
  const getToken = createGetToken({
    sessionId,
    sessionToken,
    fetcher: async (...args) => (await apiClient.sessions.getToken(...args)).jwt,
  });

  return {
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
    }),
    debug: createDebug({ ...authenticateContext, sessionToken }),
  };
}

/**
 * @internal
 */
export function signedOutAuthObject(debugData?: AuthObjectDebugData): SignedOutAuthObject {
  return {
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
