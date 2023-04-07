import type { GetServerSidePropsResult } from 'next';

import type { AuthData } from '../types';

/**
 * @param callbackResult The results from the wrapped (user-provided) getServerSideProps callback.
 * @param authData
 */
export function injectSSRStateIntoProps(callbackResult: any, authData: AuthData): GetServerSidePropsResult<any> {
  return {
    ...callbackResult,
    props: injectSSRStateIntoObject(callbackResult.props, authData),
  };
}

export const injectSSRStateIntoObject = (obj: any, authData: AuthData) => {
  // Serializing the state on dev env is a temp workaround for the following issue:
  // https://github.com/vercel/next.js/discussions/11209
  const __clerk_ssr_state =
    process.env.NODE_ENV !== 'production' ? JSON.parse(JSON.stringify({ ...authData })) : { ...authData };
  return { ...obj, __clerk_ssr_state };
};
