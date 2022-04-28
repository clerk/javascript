import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import { WithServerSideAuthCallback, WithServerSideAuthOptions, WithServerSideAuthResult } from './types';
import { getAuthData, injectAuthIntoRequest, injectSSRStateIntoProps, sanitizeAuthData } from './utils';

const EMPTY_GSSP_RESPONSE = { props: {} };

interface WithServerSideAuth {
  <
    CallbackReturn extends GetServerSidePropsResult<any> | Promise<GetServerSidePropsResult<any>>,
    Options extends WithServerSideAuthOptions,
  >(
    callback: WithServerSideAuthCallback<CallbackReturn, Options>,
    opts?: Options,
  ): WithServerSideAuthResult<CallbackReturn>;
  (opts?: WithServerSideAuthOptions): WithServerSideAuthResult<void>;
}

export const withServerSideAuth: WithServerSideAuth = (cbOrOptions: any, options?: any): any => {
  const cb = typeof cbOrOptions === 'function' ? cbOrOptions : undefined;
  const opts = (options ? options : typeof cbOrOptions !== 'function' ? cbOrOptions : {}) || {};

  return async (ctx: GetServerSidePropsContext) => {
    const authData = await getAuthData(ctx, opts);
    if (!authData) {
      return EMPTY_GSSP_RESPONSE;
    }
    const contextWithAuth = injectAuthIntoRequest(ctx, authData);
    const callbackResult = (await cb?.(contextWithAuth)) || {};
    return injectSSRStateIntoProps(callbackResult, sanitizeAuthData(authData));
  };
};
