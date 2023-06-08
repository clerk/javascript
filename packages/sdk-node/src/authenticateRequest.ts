import type { RequestState } from '@clerk/backend';
import { constants } from '@clerk/backend';
import cookie from 'cookie';
import type { IncomingMessage, ServerResponse } from 'http';

import { handleValueOrFn, isHttpOrHttps, isProxyUrlRelative, isValidProxyUrl } from './shared';
import type { AuthenticateRequestParams, ClerkClient } from './types';

const parseCookies = (req: IncomingMessage) => {
  return cookie.parse(req.headers['cookie'] || '');
};

export async function loadInterstitial({
  clerkClient,
  requestState,
}: {
  clerkClient: ClerkClient;
  requestState: RequestState;
}) {
  /**
   * When publishable key or frontendApi is present utilize the localInterstitial method
   * and avoid the extra network call
   */
  if (requestState.publishableKey || requestState.frontendApi) {
    return clerkClient.localInterstitial({
      frontendApi: requestState.frontendApi,
      publishableKey: requestState.publishableKey,
      proxyUrl: requestState.proxyUrl,
      signInUrl: requestState.signInUrl,
      isSatellite: requestState.isSatellite,
      domain: requestState.domain,
    });
  }
  return await clerkClient.remotePrivateInterstitial();
}

export const authenticateRequest = (opts: AuthenticateRequestParams) => {
  const { clerkClient, apiKey, secretKey, frontendApi, publishableKey, req, options } = opts;
  const cookies = parseCookies(req);
  const { jwtKey, authorizedParties } = options || {};

  const requestUrl = getRequestUrl(req);
  const isSatellite =
    handleValueOrFn(options?.isSatellite, requestUrl) || process.env.CLERK_IS_SATELLITE === 'true' || false;
  const domain = handleValueOrFn(options?.domain, requestUrl) || process.env.CLERK_DOMAIN || '';
  const signInUrl = options?.signInUrl || process.env.CLERK_SIGN_IN_URL || '';
  const proxyUrl = absoluteProxyUrl(
    handleValueOrFn(options?.proxyUrl, requestUrl, process.env.CLERK_PROXY_URL) as string,
    requestUrl.toString(),
  );

  if (isSatellite && !proxyUrl && !domain) {
    throw new Error(satelliteAndMissingProxyUrlAndDomain);
  }

  if (isSatellite && !isHttpOrHttps(signInUrl) && isDevelopmentFromApiKey(secretKey || apiKey)) {
    throw new Error(satelliteAndMissingSignInUrl);
  }

  return clerkClient.authenticateRequest({
    apiKey,
    secretKey,
    frontendApi,
    publishableKey,
    jwtKey,
    authorizedParties,
    cookieToken: cookies[constants.Cookies.Session] || '',
    headerToken: req.headers[constants.Headers.Authorization]?.replace('Bearer ', '') || '',
    clientUat: cookies[constants.Cookies.ClientUat] || '',
    host: req.headers.host as string,
    forwardedPort: req.headers[constants.Headers.ForwardedPort] as string,
    forwardedHost: req.headers[constants.Headers.ForwardedHost] as string,
    referrer: req.headers.referer,
    userAgent: req.headers[constants.Headers.UserAgent] as string,
    proxyUrl,
    isSatellite,
    domain,
    signInUrl,
    searchParams: requestUrl.searchParams,
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

const getRequestUrl = (req: IncomingMessage): URL => {
  return new URL(req.url as string, `${getRequestProto(req)}://${req.headers.host}`);
};

const getRequestProto = (req: IncomingMessage): string => {
  // @ts-ignore Optimistic attempt to get the protocol in case
  // req extends IncomingMessage in a useful way. No guarantee
  // it'll work.
  const mightWork = req.connection?.encrypted ? 'https' : 'http';
  // The x-forwarded-proto header takes precedence.
  const proto = (req.headers[constants.Headers.ForwardedProto] as string) || mightWork;
  if (!proto) {
    throw new Error(missingProto);
  }
  // Sometimes the x-forwarded-proto header does not come as a
  // single value.
  return proto.split(',')[0].trim();
};

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
const missingProto =
  "Cannot determine the request protocol. Please ensure you've set the X-Forwarded-Proto header with the request protocol (http or https).";
