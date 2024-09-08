import type {
  ActClaim,
  CheckAuthorizationWithCustomPermissions,
  JwtPayload,
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
  ServerGetToken,
  ServerGetTokenOptions,
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
export type SignedInAuthObject = {
  sessionClaims: JwtPayload;
  sessionId: string;
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
   * @experimental This API is experimental and may change at any moment.
   */
  __experimental_factorVerificationAge: [number | null, number | null];
  getToken: ServerGetToken;
  has: CheckAuthorizationWithCustomPermissions;
  debug: AuthObjectDebug;
};

/**
 * @internal
 */
export type SignedOutAuthObject = {
  sessionClaims: null;
  sessionId: null;
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
   * @experimental This API is experimental and may change at any moment.
   */
  __experimental_factorVerificationAge: [null, null];
  getToken: ServerGetToken;
  has: CheckAuthorizationWithCustomPermissions;
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

/**
 * @internal
 */
export function signedInAuthObject(
  authenticateContext: AuthenticateContext,
  sessionToken: string,
  sessionClaims: JwtPayload,
): SignedInAuthObject {
  const {
    act: actor,
    sid: sessionId,
    org_id: orgId,
    org_role: orgRole,
    org_slug: orgSlug,
    org_permissions: orgPermissions,
    sub: userId,
    fva: __experimental_factorVerificationAge,
  } = sessionClaims;
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
    userId,
    orgId,
    orgRole,
    orgSlug,
    orgPermissions,
    __experimental_factorVerificationAge,
    getToken,
    has: createHasAuthorization({ orgId, orgRole, orgPermissions, userId }),
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
    userId: null,
    actor: null,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    orgPermissions: null,
    __experimental_factorVerificationAge: [null, null],
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

const createHasAuthorization = (options: {
  userId: string;
  orgId: string | undefined;
  orgRole: string | undefined;
  orgPermissions: string[] | undefined;
}): CheckAuthorizationWithCustomPermissions => {
  const { orgId, orgRole, userId, orgPermissions } = options;

  return params => {
    if (!params?.permission && !params?.role) {
      throw new Error(
        'Missing parameters. `has` from `auth` or `getAuth` requires a permission or role key to be passed. Example usage: `has({permission: "org:posts:edit"`',
      );
    }

    if (!orgId || !userId || !orgRole || !orgPermissions) {
      return false;
    }

    if (params.permission) {
      return orgPermissions.includes(params.permission);
    }

    if (params.role) {
      return orgRole === params.role;
    }

    return false;
  };
};
