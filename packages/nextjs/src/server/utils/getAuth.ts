import { createGetToken, Organization, Session, signedOutGetToken, User } from '@clerk/backend-core';
import { ClerkJWTClaims } from '@clerk/types';

import { sanitizeAuthData } from '../../middleware/utils/sanitizeAuthData';
import { injectSSRStateIntoObject } from '../../middleware/utils/serializeProps';
import type { RequestLike } from '../types';
import { AuthData, AuthResult, SESSION_COOKIE_NAME, SessionsApi } from '../types';
import { getAuthDataFromClaims } from './getAuthDataFromClaims';
import { getAuthResultFromRequest, getCookie, getHeader } from './requestResponseUtils';

type GetAuthResult = AuthData;

export type GetAuth = (req: RequestLike) => GetAuthResult;

type CreateGetAuthParams = { sessions: SessionsApi };

export const createGetAuth = ({ sessions }: CreateGetAuthParams): GetAuth => {
  return ((req: RequestLike) => {
    // When the auth result is set, we trust that the middleware has already run
    // Then, we don't have to re-verify the JWT here,
    // we can just strip out the claims manually.
    const authResult = getAuthResultFromRequest(req);

    if (!authResult) {
      throw new Error(
        'You need to use "withClerkMiddleware" in your Next.js middleware file. See https://clerk.dev/docs/quickstarts/get-started-with-nextjs',
      );
    }

    if (authResult !== AuthResult.StandardSignedIn) {
      // Signed out case assumed
      return { sessionId: null, userId: null, orgId: null, getToken: signedOutGetToken, claims: null };
    }

    // Signed in case, get the token from header or cookie
    const { sessionClaims, cookieToken, headerToken } = parseRequest(req);
    const authData = getAuthDataFromClaims({ sessionClaims });
    const getToken = createGetToken({
      headerToken,
      cookieToken,
      sessionId: authData.sessionId,
      fetcher: sessions.getToken,
    });
    return { ...authData, getToken, claims: sessionClaims };
  }) as GetAuth;
};

type BuildClerkPropsInitState = { user?: User | null; session?: Session | null; organization?: Organization | null };

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
type BuildClerkProps = (req: RequestLike, authState?: BuildClerkPropsInitState) => Record<string, unknown>;

export const buildClerkProps: BuildClerkProps = (req, initState = {}) => {
  const authResult = getAuthResultFromRequest(req);
  if (!authResult || authResult !== AuthResult.StandardSignedIn) {
    return {};
  }
  const { sessionClaims } = parseRequest(req);
  const authData = getAuthDataFromClaims({ sessionClaims });
  return injectSSRStateIntoObject({}, sanitizeAuthData({ ...authData, ...initState } as any));
};

const parseRequest = (req: RequestLike) => {
  const headerToken = getHeader(req, 'authorization')?.replace('Bearer ', '');
  const cookieToken = getCookie(req, SESSION_COOKIE_NAME);
  const sessionClaims = JSON.parse(atob((headerToken || cookieToken || '').split('.')[1])) as ClerkJWTClaims;
  return { headerToken, cookieToken, sessionClaims };
};
