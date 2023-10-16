import { deprecated } from '@clerk/shared';
import type { ActClaim, JwtPayload, ServerGetToken, ServerGetTokenOptions } from '@clerk/types';

import type { Organization, Session, User } from '../api';
import { createBackendApiClient } from '../api';
import type { RequestState } from './authStatus';
import type { AuthenticateRequestOptions } from './request';

type AuthObjectDebugData = Partial<AuthenticateRequestOptions & RequestState>;
type CreateAuthObjectDebug = (data?: AuthObjectDebugData) => AuthObjectDebug;
type AuthObjectDebug = () => unknown;

export type SignedInAuthObjectOptions = {
  /**
   * @deprecated Use `secretKey` instead.
   */
  apiKey?: string;
  secretKey?: string;
  apiUrl: string;
  apiVersion: string;
  token: string;
  session?: Session;
  user?: User;
  organization?: Organization;
};

export type SignedInAuthObject = {
  sessionClaims: JwtPayload;
  sessionId: string;
  session: Session | undefined;
  actor: ActClaim | undefined;
  userId: string;
  user: User | undefined;
  orgId: string | undefined;
  orgRole: string | undefined;
  orgSlug: string | undefined;
  organization: Organization | undefined;
  getToken: ServerGetToken;
  debug: AuthObjectDebug;
};

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
  organization: null;
  getToken: ServerGetToken;
  debug: AuthObjectDebug;
};

export type AuthObject = SignedInAuthObject | SignedOutAuthObject;

const createDebug: CreateAuthObjectDebug = data => {
  return () => {
    const res = { ...data } || {};
    res.apiKey = (res.apiKey || '').substring(0, 7);
    res.secretKey = (res.secretKey || '').substring(0, 7);
    res.jwtKey = (res.jwtKey || '').substring(0, 7);
    return { ...res };
  };
};

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
    sub: userId,
  } = sessionClaims;
  const { apiKey, secretKey, apiUrl, apiVersion, token, session, user, organization } = options;

  if (apiKey) {
    deprecated('apiKey', 'Use `secretKey` instead.');
  }

  const { sessions } = createBackendApiClient({
    apiKey,
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
    organization,
    getToken,
    debug: createDebug({ ...options, ...debugData }),
  };
}

export function signedOutAuthObject(debugData?: AuthObjectDebugData): SignedOutAuthObject {
  if (debugData?.apiKey) {
    deprecated('apiKey', 'Use `secretKey` instead.');
  }

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
    organization: null,
    getToken: () => Promise.resolve(null),
    debug: createDebug(debugData),
  };
}

export function prunePrivateMetadata(resource?: { private_metadata: any } | { privateMetadata: any } | null) {
  // Delete sensitive private metadata from resource before rendering in SSR
  if (resource) {
    // @ts-ignore
    delete resource['privateMetadata'];
    // @ts-ignore
    delete resource['private_metadata'];
  }

  return resource;
}

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
 */
export const makeAuthObjectSerializable = <T extends Record<string, unknown>>(obj: T): T => {
  // remove any non-serializable props from the returned object
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { debug, getToken, ...rest } = obj as unknown as AuthObject;
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
