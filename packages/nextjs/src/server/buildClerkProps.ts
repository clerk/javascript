import type { AuthObject, Organization, Session, User } from '@clerk/backend';
import { makeAuthObjectSerializable, stripPrivateDataFromObject } from '@clerk/backend/internal';

import { getAuthDataFromRequest } from './data/getAuthDataFromRequest';
import type { RequestLike } from './types';

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

export const buildClerkProps: BuildClerkProps = (req, initialState = {}) => {
  const sanitizedAuthObject = getDynamicAuthData(req, initialState);

  // Serializing the state on dev env is a temp workaround for the following issue:
  // https://github.com/vercel/next.js/discussions/11209|Next.js
  const __clerk_ssr_state =
    process.env.NODE_ENV !== 'production' ? JSON.parse(JSON.stringify(sanitizedAuthObject)) : sanitizedAuthObject;
  return { __clerk_ssr_state };
};

export function getDynamicAuthData(req: RequestLike, initialState = {}) {
  const authObject = getAuthDataFromRequest(req);

  return makeAuthObjectSerializable(stripPrivateDataFromObject({ ...authObject, ...initialState })) as AuthObject;
}
