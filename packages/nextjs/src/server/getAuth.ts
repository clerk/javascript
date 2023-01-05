import type { Organization, Session, User } from '@clerk/backend';
import {
  type SignedInAuthObject,
  type SignedOutAuthObject,
  AuthStatus,
  constants,
  decodeJwt,
  sanitizeAuthObject,
  signedInAuthObject,
  signedOutAuthObject,
} from '@clerk/backend';

import { API_KEY, API_URL, API_VERSION } from './clerk';
import type { RequestLike } from './types';
import { getAuthStatusFromRequest, getCookie, getHeader, injectSSRStateIntoObject } from './utils';

export const getAuth = (req: RequestLike): SignedInAuthObject | SignedOutAuthObject => {
  // When the auth status is set, we trust that the middleware has already run
  // Then, we don't have to re-verify the JWT here,
  // we can just strip out the claims manually.
  const authStatus = getAuthStatusFromRequest(req);

  if (!authStatus) {
    throw new Error(
      'You need to use "withClerkMiddleware" in your Next.js middleware file. See https://clerk.dev/docs/quickstarts/get-started-with-nextjs',
    );
  }

  if (authStatus !== AuthStatus.SignedIn) {
    return signedOutAuthObject();
  }

  const jwt = parseJwt(req);

  return signedInAuthObject(jwt.payload, {
    apiKey: API_KEY,
    apiUrl: API_URL,
    apiVersion: API_VERSION,
    token: jwt.raw.text,
  });
};

type BuildClerkPropsInitState = { user?: User; session?: Session; organization?: Organization };

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
  const authStatus = getAuthStatusFromRequest(req);

  if (!authStatus || authStatus !== AuthStatus.SignedIn) {
    return {};
  }

  const { payload, raw } = parseJwt(req);

  const authObject = signedInAuthObject(payload, {
    apiKey: API_KEY,
    apiUrl: API_URL,
    apiVersion: API_VERSION,
    token: raw.text,
  });

  const sanitizedAuthObject = sanitizeAuthObject({ ...authObject, ...initState });
  return injectSSRStateIntoObject({}, sanitizedAuthObject);
};

const parseJwt = (req: RequestLike) => {
  const cookieToken = getCookie(req, constants.Cookies.Session);
  const headerToken = getHeader(req, 'authorization')?.replace('Bearer ', '');
  return decodeJwt(cookieToken || headerToken || '');
};
