import type { RequestState } from '@clerk/backend';
import { buildRequestUrl, constants, createIsomorphicRequest } from '@clerk/backend';
import type { ServerResponse } from 'http';

import { handleValueOrFn, isHttpOrHttps, isProxyUrlRelative, isValidProxyUrl } from './shared';
import type { AuthenticateRequestParams, ClerkClient } from './types';
import { loadApiEnv, loadClientEnv } from './utils';

export async function loadInterstitial({
  clerkClient,
  requestState,
}: {
  clerkClient: ClerkClient;
  requestState: RequestState;
}) {
  const { clerkJSVersion, clerkJSUrl } = loadClientEnv();
  /**
   * When publishable key or frontendApi is present utilize the localInterstitial method
   * and avoid the extra network call
   */
  if (requestState.publishableKey || requestState.frontendApi) {
    return clerkClient.localInterstitial({
      // Use frontendApi only when legacy frontendApi is used to avoid showing deprecation warning
      // since the requestState always contains the frontendApi constructed by publishableKey.
      frontendApi: requestState.publishableKey ? '' : requestState.frontendApi,
      publishableKey: requestState.publishableKey,
      proxyUrl: requestState.proxyUrl,
      signInUrl: requestState.signInUrl,
      isSatellite: requestState.isSatellite,
      domain: requestState.domain,
      clerkJSVersion,
      clerkJSUrl,
    });
  }
  return await clerkClient.remotePrivateInterstitial();
}

export const authenticateRequest = (opts: AuthenticateRequestParams) => {
  const { clerkClient, apiKey, secretKey, frontendApi, publishableKey, req, options } = opts;
  const { jwtKey, authorizedParties, audience } = options || {};

  const env = { ...loadApiEnv(), ...loadClientEnv() };

  const isomorphicRequest = createIsomorphicRequest((Request, Headers) => {
    const headers = Object.keys(req.headers).reduce((acc, key) => Object.assign(acc, { [key]: req?.headers[key] }), {});

    // @ts-ignore Optimistic attempt to get the protocol in case
    // req extends IncomingMessage in a useful way. No guarantee
    // it'll work.
    const protocol = req.connection?.encrypted ? 'https' : 'http';
    const dummyOriginReqUrl = new URL(req.url || '', `${protocol}://clerk-dummy`);
    return new Request(dummyOriginReqUrl, {
      method: req.method,
      headers: new Headers(headers),
    });
  });

  const requestUrl = buildRequestUrl(isomorphicRequest);
  const isSatellite = handleValueOrFn(options?.isSatellite, requestUrl, env.isSatellite);
  const domain = handleValueOrFn(options?.domain, requestUrl) || env.domain;
  const signInUrl = options?.signInUrl || env.signInUrl;
  const proxyUrl = absoluteProxyUrl(
    handleValueOrFn(options?.proxyUrl, requestUrl, env.proxyUrl),
    requestUrl.toString(),
  );

  if (isSatellite && !proxyUrl && !domain) {
    throw new Error(satelliteAndMissingProxyUrlAndDomain);
  }

  if (isSatellite && !isHttpOrHttps(signInUrl) && isDevelopmentFromApiKey(secretKey || apiKey || '')) {
    throw new Error(satelliteAndMissingSignInUrl);
  }

  return clerkClient.authenticateRequest({
    audience,
    apiKey,
    secretKey,
    frontendApi,
    publishableKey,
    jwtKey,
    authorizedParties,
    proxyUrl,
    isSatellite,
    domain,
    signInUrl,
    request: isomorphicRequest,
  });
};
export const handleUnknownCase = (res: ServerResponse, requestState: RequestState) => {
  if (requestState.isUnknown) {
    res.writeHead(401, { 'Content-Type': 'text/html' });
    res.end();
  }
};

export const handleInterstitialCase = (res: ServerResponse, requestState: RequestState, interstitial: string) => {
  if (requestState.isInterstitial) {
    res.writeHead(401, { 'Content-Type': 'text/html' });
    res.end(interstitial);
  }
};

export const decorateResponseWithObservabilityHeaders = (res: ServerResponse, requestState: RequestState) => {
  requestState.message && res.setHeader(constants.Headers.AuthMessage, encodeURIComponent(requestState.message));
  requestState.reason && res.setHeader(constants.Headers.AuthReason, encodeURIComponent(requestState.reason));
  requestState.status && res.setHeader(constants.Headers.AuthStatus, encodeURIComponent(requestState.status));
};

const isDevelopmentFromApiKey = (apiKey: string): boolean =>
  apiKey.startsWith('test_') || apiKey.startsWith('sk_test_');

const absoluteProxyUrl = (relativeOrAbsoluteUrl: string, baseUrl: string): string => {
  if (!relativeOrAbsoluteUrl || !isValidProxyUrl(relativeOrAbsoluteUrl) || !isProxyUrlRelative(relativeOrAbsoluteUrl)) {
    return relativeOrAbsoluteUrl;
  }
  return new URL(relativeOrAbsoluteUrl, baseUrl).toString();
};

const satelliteAndMissingProxyUrlAndDomain =
  'Missing domain and proxyUrl. A satellite application needs to specify a domain or a proxyUrl';
const satelliteAndMissingSignInUrl = `
Invalid signInUrl. A satellite application requires a signInUrl for development instances.
Check if signInUrl is missing from your configuration or if it is not an absolute URL.`;
