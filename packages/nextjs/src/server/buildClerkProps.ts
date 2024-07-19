import type { Organization, Session, User } from '@clerk/backend';
import {
  AuthStatus,
  constants,
  makeAuthObjectSerializable,
  signedInAuthObject,
  signedOutAuthObject,
  stripPrivateDataFromObject,
} from '@clerk/backend/internal';
import { decodeJwt } from '@clerk/backend/jwt';

import { API_URL, API_VERSION, SECRET_KEY } from './constants';
import type { RequestLike } from './types';
import { decryptClerkRequestData, getAuthKeyFromRequest, getHeader, injectSSRStateIntoObject } from './utils';

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
  const authStatus = getAuthKeyFromRequest(req, 'AuthStatus');
  const authToken = getAuthKeyFromRequest(req, 'AuthToken');
  const authMessage = getAuthKeyFromRequest(req, 'AuthMessage');
  const authReason = getAuthKeyFromRequest(req, 'AuthReason');

  const encryptedRequestData = getHeader(req, constants.Headers.ClerkRequestData);
  const decryptedRequestData = decryptClerkRequestData(encryptedRequestData);

  const options = {
    secretKey: decryptedRequestData.secretKey || SECRET_KEY,
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
    const jwt = decodeJwt(authToken as string);

    // @ts-expect-error - TODO: Align types
    authObject = signedInAuthObject(options, jwt.raw.text, jwt.payload);
  }

  const sanitizedAuthObject = makeAuthObjectSerializable(stripPrivateDataFromObject({ ...authObject, ...initState }));
  return injectSSRStateIntoObject({}, sanitizedAuthObject);
};
