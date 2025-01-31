import type { AuthObject, Organization, Session, User } from '@clerk/backend';
import { makeAuthObjectSerializable, stripPrivateDataFromObject } from '@clerk/backend/internal';

import { getAuthDataFromRequest } from './data/getAuthDataFromRequest';
import type { RequestLike } from './types';

type BuildClerkPropsInitState = { user?: User | null; session?: Session | null; organization?: Organization | null };

type BuildClerkProps = (req: RequestLike, authState?: BuildClerkPropsInitState) => Record<string, unknown>;

/**
 * Clerk uses `buildClerkProps` to inform the client-side helpers of the authentication state of the user. This function is used SSR in the `getServerSideProps` function of your Next.js application.
 *
 * @example
 * ### Basic usage
 *
 * ```tsx {{ filename: 'pages/myServerSidePage.tsx' }}
 * import { getAuth, buildClerkProps } from '@clerk/nextjs/server'
 * import { GetServerSideProps } from 'next'
 *
 * export const getServerSideProps: GetServerSideProps = async (ctx) => {
 *  const { userId } = getAuth(ctx.req)
 *
 *  if (!userId) {
 *    // handle user is not signed in.
 *  }
 *
 *  // Load any data your application needs for the page using the userId
 *  return { props: { ...buildClerkProps(ctx.req) } }
 * }
 * ```
 *
 * @example
 * ### Usage with `clerkClient`
 *
 * The `clerkClient` allows you to access the Clerk API. You can use this to retrieve or update data.
 *
 * ```tsx {{ filename: 'pages/api/example.ts' }}
 * import { getAuth, buildClerkProps, clerkClient } from '@clerk/nextjs/server'
 * import { GetServerSideProps } from 'next'
 *
 * export const getServerSideProps: GetServerSideProps = async (ctx) => {
 *  const { userId } = getAuth(ctx.req)
 *
 *  const user = userId ? await clerkClient().users.getUser(userId) : undefined
 *
 *  return { props: { ...buildClerkProps(ctx.req, { user }) } }
 * }
 * ```
 */
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
