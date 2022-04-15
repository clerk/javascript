import { GetServerDataProps, GetServerDataReturn } from 'gatsby';

import { getAuthData } from './getAuthData';
import { WithServerAuthCallback, WithServerAuthOptions, WithServerAuthResult } from './types';
import { injectAuthIntoContext, injectSSRStateIntoProps, sanitizeAuthData } from './utils';

interface WithServerAuth {
  <CallbackReturn extends GetServerDataReturn, Options extends WithServerAuthOptions>(
    callback: WithServerAuthCallback<CallbackReturn, Options>,
    opts?: Options,
  ): WithServerAuthResult<CallbackReturn>;
  (opts?: WithServerAuthOptions): GetServerDataReturn<void>;
}

export const withServerAuth: WithServerAuth = (cbOrOptions: any, options?: any): any => {
  const callback = typeof cbOrOptions === 'function' ? cbOrOptions : undefined;
  const opts = options ? options : typeof cbOrOptions !== 'function' ? cbOrOptions : {};
  return async (props: GetServerDataProps) => {
    const { authData, showInterstitial } = await getAuthData(props, opts);
    if (showInterstitial) {
      return injectSSRStateIntoProps({}, { __clerk_ssr_interstitial: true });
    }
    const contextWithAuth = injectAuthIntoContext(props, authData);
    const callbackResult = (await callback?.(contextWithAuth)) || {};
    return injectSSRStateIntoProps(callbackResult, { __clerk_ssr_state: sanitizeAuthData(authData) });
  };
};
