import { GetServerSidePropsContext } from 'next';

import { WithServerSideAuthCallback, WithServerSideAuthOptions, WithServerSideAuthResult } from './types';
import { getAuthData, injectAuthIntoContext, injectSSRStateIntoProps, sanitizeAuthData } from './utils';

const EMPTY_GSSP_RESPONSE = { props: {} };

export function withServerSideAuth<CallbackReturn, Options extends WithServerSideAuthOptions>(
  callback: WithServerSideAuthCallback<CallbackReturn, Options>,
  opts?: Options,
): WithServerSideAuthResult<CallbackReturn>;
export function withServerSideAuth(opts?: WithServerSideAuthOptions): WithServerSideAuthResult<void>;
export function withServerSideAuth(cbOrOptions: any, options?: any): any {
  const cb = typeof cbOrOptions === 'function' ? cbOrOptions : undefined;
  const opts = options ? options : typeof cbOrOptions !== 'function' ? cbOrOptions : {};

  return async (ctx: GetServerSidePropsContext) => {
    const authData = await getAuthData(ctx, opts);
    if (!authData) {
      return EMPTY_GSSP_RESPONSE;
    }
    const contextWithAuth = injectAuthIntoContext(ctx, authData);
    const callbackResult = (await cb?.(contextWithAuth)) || {};
    return injectSSRStateIntoProps(callbackResult, sanitizeAuthData(authData));
  };
}
