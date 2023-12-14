import type {
  ActClaim,
  CheckAuthorizationWithCustomPermissions,
  JwtPayload,
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
  ServerGetToken,
  ServerGetTokenOptions,
} from '@clerk/types';

import type { CreateBackendApiOptions, Organization, Session, User } from '../api';
import { createBackendApiClient } from '../api';

type AuthObjectDebugData = Record<string, any>;
type CreateAuthObjectDebug = (data?: AuthObjectDebugData) => AuthObjectDebug;
type AuthObjectDebug = () => AuthObjectDebugData;

/**
 * @internal
 */
export type SignedInAuthObjectOptions = CreateBackendApiOptions & {
  token: string;
  session?: Session;
  user?: User;
  organization?: Organization;
};

/**
 * @internal
 */
export type SignedInAuthObject = {
  sessionClaims: JwtPayload;
  sessionId: string;
  session: Session | undefined;
  actor: ActClaim | undefined;
  userId: string;
  user: User | undefined;
  orgId: string | undefined;
  orgRole: OrganizationCustomRoleKey | undefined;
  orgSlug: string | undefined;
  orgPermissions: OrganizationCustomPermissionKey[] | undefined;
  organization: Organization | undefined;
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
  session: null;
  actor: null;
  userId: null;
  user: null;
  orgId: null;
  orgRole: null;
  orgSlug: null;
  orgPermissions: null;
  organization: null;
  getToken: ServerGetToken;
  has: CheckAuthorizationWithCustomPermissions;
  debug: AuthObjectDebug;
};

/**
 * @internal
 */
export type AuthObject = SignedInAuthObject | SignedOutAuthObject;

const createDebug: CreateAuthObjectDebug = data => {
  return () => {
    const res = { ...data } || {};
    res.secretKey = (res.secretKey || '').substring(0, 7);
    res.jwtKey = (res.jwtKey || '').substring(0, 7);
    return { ...res };
  };
};

/**
 * @internal
 */
export function signedInAuthObject(
  sessionClaims: JwtPayload,
  options: SignedInAuthObjectOptions,
  debugData?: AuthObjectDebugData,
): SignedInAuthObject {
  const {
    act: actor,
    sid: sessionId,
    org_id: orgId,
    org_role: orgRole,
    org_slug: orgSlug,
    org_permissions: orgPermissions,
    sub: userId,
  } = sessionClaims;
  const { secretKey, apiUrl, apiVersion, token, session, user, organization } = options;
  const { sessions } = createBackendApiClient({
    secretKey,
    apiUrl,
    apiVersion,
  });

  const getToken = createGetToken({
    sessionId,
    sessionToken: token,
    fetcher: (...args) => sessions.getToken(...args),
  });

  return {
    actor,
    sessionClaims,
    sessionId,
    session,
    userId,
    user,
    orgId,
    orgRole,
    orgSlug,
    orgPermissions,
    organization,
    getToken,
    has: createHasAuthorization({ orgId, orgRole, orgPermissions, userId }),
    debug: createDebug({ ...options, ...debugData }),
  };
}

/**
 * @internal
 */
export function signedOutAuthObject(debugData?: AuthObjectDebugData): SignedOutAuthObject {
  return {
    sessionClaims: null,
    sessionId: null,
    session: null,
    userId: null,
    user: null,
    actor: null,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    orgPermissions: null,
    organization: null,
    getToken: () => Promise.resolve(null),
    has: () => false,
    debug: createDebug(debugData),
  };
}

/**
 * @internal
 */
export function prunePrivateMetadata(
  resource?:
    | {
        private_metadata: any;
      }
    | {
        privateMetadata: any;
      }
    | null,
) {
  // Delete sensitive private metadata from resource before rendering in SSR
  if (resource) {
    // @ts-ignore
    delete resource['privateMetadata'];
    // @ts-ignore
    delete resource['private_metadata'];
  }

  return resource;
}

/**
 * @internal
 */
export function sanitizeAuthObject<T extends Record<any, any>>(authObject: T): T {
  const user = authObject.user ? { ...authObject.user } : authObject.user;
  const organization = authObject.organization ? { ...authObject.organization } : authObject.organization;

  prunePrivateMetadata(user);
  prunePrivateMetadata(organization);

  return { ...authObject, user, organization };
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

const createHasAuthorization =
  ({
    orgId,
    orgRole,
    userId,
    orgPermissions,
  }: {
    userId: string;
    orgId: string | undefined;
    orgRole: string | undefined;
    orgPermissions: string[] | undefined;
  }): CheckAuthorizationWithCustomPermissions =>
  params => {
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
