import type { GetServerDataProps, GetServerDataReturn } from 'gatsby';

import { authenticateRequest } from './authenticateRequest';
import { clerkClient, constants, FRONTEND_API, PUBLISHABLE_KEY } from './clerkClient';
import type { WithServerAuthCallback, WithServerAuthOptions, WithServerAuthResult } from './types';
import { injectAuthIntoContext, injectSSRStateIntoProps, sanitizeAuthObject } from './utils';

interface WithServerAuth {
  <CallbackReturn extends GetServerDataReturn, Options extends WithServerAuthOptions>(
    callback: WithServerAuthCallback<CallbackReturn, Options>,
    opts?: Options,
  ): WithServerAuthResult<CallbackReturn>;
  (opts?: WithServerAuthOptions): GetServerDataReturn<void>;
}

export const withServerAuth: WithServerAuth = (cbOrOptions: any, options?: any): any => {
  const callback = typeof cbOrOptions === 'function' ? cbOrOptions : undefined;
  const opts = (options ? options : typeof cbOrOptions !== 'function' ? cbOrOptions : {}) || {};

  return async (props: GetServerDataProps) => {
    const requestState = await authenticateRequest(props, opts);
    if (requestState.isInterstitial || requestState.isUnknown) {
      const headers = {
        [constants.Headers.AuthMessage]: requestState.message,
        [constants.Headers.AuthStatus]: requestState.status,
      };
      const interstitialHtml = clerkClient.localInterstitial({
        frontendApi: FRONTEND_API,
        publishableKey: PUBLISHABLE_KEY,
      });
      return injectSSRStateIntoProps({ headers }, { __clerk_ssr_interstitial_html: interstitialHtml });
    }
    const legacyAuthData = { ...requestState.toAuth(), claims: requestState?.toAuth()?.sessionClaims };
    const contextWithAuth = injectAuthIntoContext(props, legacyAuthData);
    const callbackResult = (await callback?.(contextWithAuth)) || {};
    return injectSSRStateIntoProps(callbackResult, { __clerk_ssr_state: sanitizeAuthObject(legacyAuthData) });
  };
};
