import type { RequestState } from '@clerk/backend';
import { constants, debugRequestState } from '@clerk/backend';
import { deprecated } from '@clerk/shared/deprecated';
import type { ServerResponse } from 'http';
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import {
  API_URL,
  CLERK_JS_URL,
  CLERK_JS_VERSION,
  clerkClient,
  FRONTEND_API,
  JS_VERSION,
  makeAuthObjectSerializable,
  PUBLISHABLE_KEY,
  sanitizeAuthObject,
} from '../server/clerkClient';
import type { WithServerSideAuthCallback, WithServerSideAuthOptions, WithServerSideAuthResult } from './types';
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

const decorateResponseWithObservabilityHeaders = (res: ServerResponse, requestState: RequestState) => {
  requestState.message && res.setHeader(constants.Headers.AuthMessage, encodeURIComponent(requestState.message));
  requestState.reason && res.setHeader(constants.Headers.AuthReason, encodeURIComponent(requestState.reason));
  requestState.status && res.setHeader(constants.Headers.AuthStatus, encodeURIComponent(requestState.status));
};

/**
 * @deprecated The /ssr path is deprecated and will be removed in the next major release.
 * Use the exports from /server instead
 */
export const withServerSideAuth: WithServerSideAuth = (cbOrOptions: any, options?: any): any => {
  const cb = typeof cbOrOptions === 'function' ? cbOrOptions : undefined;
  const opts = (options ? options : typeof cbOrOptions !== 'function' ? cbOrOptions : {}) || {};
  deprecated(
    'withServerSideAuth',
    'Use `authMiddleware` instead.\nFor more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware',
  );

  // Support both loadOrganization and the older loadOrg option without breaking changes
  // TODO: Remove pre v5
  opts.loadOrganization = opts.loadOrganization || opts.loadOrg || undefined;

  return async (ctx: GetServerSidePropsContext) => {
    const requestState = await authenticateRequest(ctx, opts);

    if (requestState.isUnknown) {
      decorateResponseWithObservabilityHeaders(ctx.res, requestState);
      ctx.res.writeHead(401, { 'Content-Type': 'text/html' });
      ctx.res.end();
      return EMPTY_GSSP_RESPONSE;
    }
    if (requestState.isInterstitial) {
      decorateResponseWithObservabilityHeaders(ctx.res, requestState);
      ctx.res.writeHead(401, { 'Content-Type': 'text/html' });
      const interstitial = await clerkClient.remotePublicInterstitial({
        apiUrl: API_URL,
        publishableKey: PUBLISHABLE_KEY,
        frontendApi: FRONTEND_API,
        pkgVersion: JS_VERSION,
        clerkJSUrl: CLERK_JS_URL,
        clerkJSVersion: CLERK_JS_VERSION,
        proxyUrl: requestState.proxyUrl as any,
        isSatellite: requestState.isSatellite,
        domain: requestState.domain as any,
        debugData: debugRequestState(requestState),
      });
      ctx.res.end(interstitial);
      return EMPTY_GSSP_RESPONSE;
    }

    const legacyAuthData = { ...requestState.toAuth(), claims: requestState.toAuth().sessionClaims };
    const contextWithAuth = injectAuthIntoRequest(ctx, legacyAuthData);
    const callbackResult = (await cb?.(contextWithAuth)) || {};
    return injectSSRStateIntoProps(callbackResult, makeAuthObjectSerializable(sanitizeAuthObject(legacyAuthData)));
  };
};
