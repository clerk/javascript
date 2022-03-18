import { GetServerSidePropsResult } from 'next';

import { AuthData } from '../types';

/**
 *
 * Next.js
 *
 * @export
 * @param callbackResult The results from the wrapped (user-provided) getServerSideProps callback.
 * @param authData
 */
export function injectSSRStateIntoProps(
  callbackResult: any,
  authData: AuthData,
): GetServerSidePropsResult<any> {
  // Serializing the state on dev env is a temp workaround for the following issue:
  // https://github.com/vercel/next.js/discussions/11209|Next.js
  const __clerk_ssr_state =
    process.env.NODE_ENV !== 'production'
      ? JSON.parse(JSON.stringify({ ...authData }))
      : { ...authData };
  return {
    ...callbackResult,
    props: { ...callbackResult.props, __clerk_ssr_state },
  };
}
