import { createCheckAuthorization } from '@clerk/shared/authorization';
import { __experimental_JWTPayloadToAuthObjectProperties } from '@clerk/shared/jwtPayloadParser';
import type {
  CheckAuthorizationFromSessionClaims,
  JwtPayload,
  ServerGetToken,
  ServerGetTokenOptions,
  SessionStatusClaim,
  SharedSignedInAuthObjectProperties,
} from '@clerk/types';

import type { CreateBackendApiOptions } from '../api';
import { createBackendApiClient } from '../api';
import type { AuthenticateContext } from './authenticateContext';

/**
 * @inline
 */
type AuthObjectDebugData = Record<string, any>;
/**
 * @inline
 */
type AuthObjectDebug = () => AuthObjectDebugData;

/**
 * @internal
 */
export type SignedInAuthObjectOptions = CreateBackendApiOptions & {
  token: string;
};

/**
 * @interface
 */
export type SignedInAuthObject = SharedSignedInAuthObjectProperties & {
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
 * @interface
 */
export type SignedOutAuthObject = {
  sessionClaims: null;
  sessionId: null;
  sessionStatus: SessionStatusClaim | null;
  actor: null;
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
 * @interface
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
  const { actor, sessionId, sessionStatus, userId, orgId, orgRole, orgSlug, orgPermissions, factorVerificationAge } =
    __experimental_JWTPayloadToAuthObjectProperties(sessionClaims);
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
