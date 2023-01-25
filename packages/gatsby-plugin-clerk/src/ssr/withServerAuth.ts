import { constants } from '@clerk/backend';
import { clerkClient } from '@clerk/clerk-sdk-node';
// @stef
// TODO:
// 1. create a clerkClient file, similar to nextjs src
// 2. can we add the clerk keys to the plugin config? iof yes, how do w read t hem?
// 3. if no, are there any gatsby-specific envs? eg next_public_ prefix?
import { FRONTEND_API, PUBLISHABLE_KEY } from '@clerk/nextjs/dist/server';
import type { GetServerDataProps, GetServerDataReturn } from 'gatsby';

import { authenticateRequest } from './authenticateRequest';
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
    if (requestState.isInterstitial) {
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
    const legacyAuthData = { ...requestState.toAuth(), claims: requestState.toAuth().sessionClaims };
    const contextWithAuth = injectAuthIntoContext(props, legacyAuthData);
    const callbackResult = (await callback?.(contextWithAuth)) || {};
    return injectSSRStateIntoProps(callbackResult, { __clerk_ssr_state: sanitizeAuthObject(legacyAuthData) });
  };
};
