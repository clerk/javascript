import { GetServerDataProps, GetServerDataReturn } from 'gatsby';

import { getAuthData } from './getAuthData';
import { WithServerAuthCallback, WithServerAuthOptions } from './types';
import { injectAuthIntoContext, injectSSRStateIntoProps, sanitizeAuthData } from './utils';

interface WithServerAuth {
  <CallbackReturn extends GetServerDataReturn, Options extends WithServerAuthOptions>(
    callback: WithServerAuthCallback<CallbackReturn, Options>,
    opts?: Options,
  ): GetServerDataReturn<CallbackReturn>;
  (opts?: WithServerAuthOptions): GetServerDataReturn<void>;
}

export const withServerAuth: WithServerAuth = (cbOrOptions: any, options?: any): any => {
  const callback = typeof cbOrOptions === 'function' ? cbOrOptions : undefined;
  const opts = options ? options : typeof cbOrOptions !== 'function' ? cbOrOptions : {};

  return async (context: GetServerDataProps) => {
    const { authData, showInterstitial } = await getAuthData(context, opts);
    if (showInterstitial) {
      return injectSSRStateIntoProps({}, { __clerk_ssr_interstitial: true });
    }
    const contextWithAuth = injectAuthIntoContext(context, authData);
    const callbackResult = (await callback?.(contextWithAuth)) || {};
    return injectSSRStateIntoProps(callbackResult, { __clerk_ssr_state: sanitizeAuthData(authData) });
  };
};
