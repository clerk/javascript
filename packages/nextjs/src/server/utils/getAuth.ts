import { signedOutGetToken } from '@clerk/backend-core';
import { Organization, Session, User } from '@clerk/clerk-sdk-node';
import { ClerkJWTClaims } from '@clerk/types';

import type { RequestLike } from '../types';
import { AuthData, AuthResult, OrganizationsApi, SESSION_COOKIE_NAME, SessionsApi, UsersApi } from '../types';
import { getAuthDataFromClaims } from './getAuthDataFromClaims';
import { getAuthResultFromRequest, getCookie, getHeader } from './requestResponseUtils';

type GetAuthOptions = {
  loadUser?: boolean;
  loadSession?: boolean;
  loadOrg?: boolean;
};

type GetAuthResult<Options> = AuthData &
  (Options extends { loadSession: true } ? { session: Session | null } : {}) &
  (Options extends { loadUser: true } ? { user: User | null } : {}) &
  (Options extends { loadOrg: true } ? { organization: Organization | null } : {});

export interface GetAuth {
  (req: RequestLike): GetAuthResult<{}>;
  (req: RequestLike, opts: Record<string, never>): GetAuthResult<{}>;
  <Opts extends GetAuthOptions>(req: RequestLike, opts: Opts): Promise<GetAuthResult<Opts>>;
}

type CreateGetAuthParams = { sessions: SessionsApi; users: UsersApi; organizations: OrganizationsApi };

export const createGetAuth = ({ organizations, sessions, users }: CreateGetAuthParams): GetAuth => {
  return ((req: RequestLike, opts?: GetAuthOptions) => {
    const { loadUser, loadSession, loadOrg } = opts || {};
    // When the auth result is set, we trust that the middleware has already run
    // Then, we don't have to re-verify the JWT here,
    // we can just strip out the claims manually.
    const authResult = getAuthResultFromRequest(req);

    if (!authResult) {
      throw 'You need to use "withClerkMiddleware" in your Next.js middleware.js file. See https://clerk.dev/docs/quickstarts/get-started-with-nextjs.';
    }

    if (authResult !== AuthResult.StandardSignedIn) {
      // Signed out case assumed
      return { sessionId: null, userId: null, orgId: null, getToken: signedOutGetToken, claims: null };
    }

    // Signed in case, get the token from header or cookie
    const headerToken = getHeader(req, 'authorization')?.replace('Bearer ', '');
    const cookieToken = getCookie(req, SESSION_COOKIE_NAME);
    const token = headerToken || cookieToken || '';
    const sessionClaims = JSON.parse(atob(token.split('.')[1])) as ClerkJWTClaims;
    const authData = getAuthDataFromClaims({ sessionClaims, sessions, headerToken, cookieToken });

    // If a load option is passed in, this function will return a promise instead
    if (loadUser || loadSession || loadOrg) {
      const { orgId, sessionId, userId } = authData;
      const getUser = loadUser && userId ? users.getUser(userId) : Promise.resolve(undefined);
      const getSession = loadSession && sessionId ? sessions.getSession(sessionId) : Promise.resolve(undefined);
      const getOrg =
        loadOrg && orgId ? organizations.getOrganization({ organizationId: orgId }) : Promise.resolve(undefined);

      return Promise.all([getUser, getSession, getOrg]).then(([user, session, organization]) => {
        return { ...authData, user, session, organization };
      });
    }

    return authData;
  }) as GetAuth;
};
