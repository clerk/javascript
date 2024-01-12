import type { Organization, Session, User } from '@clerk/backend';
import {
  AuthStatus,
  decodeJwt,
  makeAuthObjectSerializable,
  sanitizeAuthObject,
  signedInAuthObject,
  signedOutAuthObject,
} from '@clerk/backend';

import { API_KEY, API_URL, API_VERSION, SECRET_KEY } from './clerkClient';
import type { RequestLike } from './types';
import { getAuthKeyFromRequest, injectSSRStateIntoObject } from './utils';

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
  const authToken = getAuthKeyFromRequest(req, 'AuthToken');
  const authStatus = getAuthKeyFromRequest(req, 'AuthStatus') as AuthStatus;
  const authMessage = getAuthKeyFromRequest(req, 'AuthMessage');
  const authReason = getAuthKeyFromRequest(req, 'AuthReason');

  const options = {
    apiKey: API_KEY,
    secretKey: SECRET_KEY,
    apiUrl: API_URL,
    apiVersion: API_VERSION,
    authStatus,
    authMessage,
    authReason,
  };

  let authObject;
  if (!authStatus || authStatus !== AuthStatus.SignedIn) {
    authObject = signedOutAuthObject(options);
  } else {
    const { payload, raw } = decodeJwt(authToken as string);
    authObject = signedInAuthObject(payload, { ...options, token: raw.text });
  }

  const sanitizedAuthObject = makeAuthObjectSerializable(sanitizeAuthObject({ ...authObject, ...initState }));
  return injectSSRStateIntoObject({}, sanitizedAuthObject);
};
