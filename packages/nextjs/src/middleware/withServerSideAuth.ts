import { constants } from '@clerk/backend';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import { API_URL, clerkClient, FRONTEND_API, PROXY_URL, PUBLISHABLE_KEY, sanitizeAuthObject } from '../server/clerk';
import { WithServerSideAuthCallback, WithServerSideAuthOptions, WithServerSideAuthResult } from './types';
import { authenticateRequest, injectAuthIntoRequest, injectSSRStateIntoProps } from './utils';

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

/**
 * @deprecated The /ssr path is deprecated and will be removed in the next major release.
 * Use the exports from /server instead
 */
export const withServerSideAuth: WithServerSideAuth = (cbOrOptions: any, options?: any): any => {
  const cb = typeof cbOrOptions === 'function' ? cbOrOptions : undefined;
  const opts = (options ? options : typeof cbOrOptions !== 'function' ? cbOrOptions : {}) || {};

  return async (ctx: GetServerSidePropsContext) => {
    const requestState = await authenticateRequest(ctx, opts);

    if (requestState.isInterstitial || requestState.isUnknown) {
      ctx.res.setHeader(constants.Headers.AuthMessage, requestState.message);
      ctx.res.setHeader(constants.Headers.AuthReason, requestState.reason);
      ctx.res.writeHead(401, { 'Content-Type': 'text/html' });
      const interstitial = await clerkClient.remotePublicInterstitial({
        apiUrl: API_URL,
        publishableKey: PUBLISHABLE_KEY,
        frontendApi: FRONTEND_API,
        proxyUrl: PROXY_URL,
      });
      ctx.res.end(interstitial);
      return EMPTY_GSSP_RESPONSE;
    }

    const legacyAuthData = { ...requestState.toAuth(), claims: requestState.toAuth().sessionClaims };
    const contextWithAuth = injectAuthIntoRequest(ctx, legacyAuthData);
    const callbackResult = (await cb?.(contextWithAuth)) || {};
    return injectSSRStateIntoProps(callbackResult, sanitizeAuthObject(legacyAuthData));
  };
};
