import type { Organization, Session, User } from '@clerk/backend-core';
import { signedOutGetToken } from '@clerk/backend-core';
import { ClerkJWTClaims } from '@clerk/types';

import { sanitizeAuthData } from '../../middleware/utils/sanitizeAuthData';
import { injectSSRStateIntoObject } from '../../middleware/utils/serializeProps';
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
  (Options extends { loadOrg: true } ? { organization: Organization | null } : {}) & {
    /**
     * To enable Clerk SSR support, include this object to the `props`
     * returned from `getServerSideProps`. This will automatically make the auth state available to
     * the Clerk components and hooks during SSR, the hydration phase and CSR.
     * @example
     * import { getAuth } from '@clerk/nextjs/server';
     *
     * export const getServerSideProps = ({ req }) => {
     *   const { authServerSideProps } = getAuth(req);
     *   const myData = getMyData();
     *
     *   return {
     *     props: { myData, authServerSideProps },
     *   };
     * };
     */
    authServerSideProps: Record<string, unknown>;
  };

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
        const authDataWithResources = { ...authData, user, session, organization };
        return { ...authDataWithResources, authServerSideProps: createAuthServerSideProps(authDataWithResources) };
      });
    }

    return { ...authData, authServerSideProps: createAuthServerSideProps(authData) };
  }) as GetAuth;
};

// TODO: Consolidate the following types between nextjs (edge + node) remix and gatsby
// The following any's are needed since we have multiple AuthData types for no reason
const createAuthServerSideProps = (authData: AuthData) => {
  // return { __clerk_ssr_state: sanitizeAuthData(authData as any) };
  return injectSSRStateIntoObject({}, sanitizeAuthData(authData as any));
};
