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
  fva: [number, number];
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
  fva: null;
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
    fva,
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
    fva,
    getToken,
    has: createHasAuthorization({ orgId, orgRole, orgPermissions, userId, fva }),
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
    fva: null,
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

const stringsToNumbers: { [key in '1m' | '10m' | '1h' | '4h' | '1d' | '1w']: number } = {
  '1m': 1,
  '10m': 10,
  '1h': 60,
  '4h': 240, //4 * 60,
  '1d': 1440, //24 * 60,
  '1w': 10080, //7 * 24 * 60,
};

const createHasAuthorization = (options: {
  userId: string;
  orgId: string | undefined;
  orgRole: string | undefined;
  orgPermissions: string[] | undefined;
  fva: [number, number] | undefined;
}): CheckAuthorizationWithCustomPermissions => {
  const { orgId, orgRole, userId, orgPermissions, fva } = options;

  return params => {
    // if (!params?.permission && !params?.role) {
    //   throw new Error(
    //     'Missing parameters. `has` from `auth` or `getAuth` requires a permission or role key to be passed. Example usage: `has({permission: "org:posts:edit"`',
    //   );
    // }

    let orgAuthorization = null;
    let stepUpAuthorization = null;

    if (!userId) {
      return false;
    }

    if (params.role || params.permission) {
      const missingOrgs = !orgId || !orgRole || !orgPermissions;

      if (params.permission && !missingOrgs) {
        orgAuthorization = orgPermissions.includes(params.permission);
      }

      if (params.role && !missingOrgs) {
        orgAuthorization = orgRole === params.role;
      }
    }

    if (params.assurance && fva) {
      if (params.assurance.level === 'firstFactor') {
        stepUpAuthorization = stringsToNumbers[params.assurance.maxAge] > fva[0];
      } else if (params.assurance.level === 'secondFactor') {
        stepUpAuthorization = stringsToNumbers[params.assurance.maxAge] > fva[1];
      } else {
        stepUpAuthorization =
          stringsToNumbers[params.assurance.maxAge] > fva[0] && stringsToNumbers[params.assurance.maxAge] > fva[1];
      }
    }

    const final = [orgAuthorization, stepUpAuthorization].filter(Boolean).some(a => a === true);

    console.log(final ? 'You are authorized' : 'You are NOT authorized', stepUpAuthorization, orgAuthorization);

    return final;
  };
};
