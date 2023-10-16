import { API_URL, API_VERSION, constants } from '../constants';
import { assertValidSecretKey } from '../util/assertValidSecretKey';
import { buildRequest, stripAuthorizationHeader } from '../util/IsomorphicRequest';
import { deprecated, isDevelopmentFromApiKey, parsePublishableKey } from '../util/shared';
import type { RequestState } from './authStatus';
import { AuthErrorReason, interstitial, signedOut, unknownState } from './authStatus';
import type { TokenCarrier } from './errors';
import { TokenVerificationError, TokenVerificationErrorReason } from './errors';
import {
  crossOriginRequestWithoutHeader,
  hasPositiveClientUatButCookieIsMissing,
  hasValidCookieToken,
  hasValidHeaderToken,
  isNormalSignedOutState,
  isPrimaryInDevAndRedirectsToSatellite,
  isSatelliteAndNeedsSyncing,
  nonBrowserRequestInDevRule,
  potentialFirstLoadInDevWhenUATMissing,
  potentialFirstRequestOnProductionEnvironment,
  potentialRequestAfterSignInOrOutFromClerkHostedUiInDev,
  runInterstitialRules,
} from './interstitialRule';
import type { VerifyTokenOptions } from './verify';

export type LoadResourcesOptions = {
  loadSession?: boolean;
  loadUser?: boolean;
  loadOrganization?: boolean;
};

export type RequiredVerifyTokenOptions = Required<
  Pick<VerifyTokenOptions, 'apiKey' | 'secretKey' | 'apiUrl' | 'apiVersion'>
>;

export type OptionalVerifyTokenOptions = Partial<
  Pick<
    VerifyTokenOptions,
    | 'audience'
    | 'authorizedParties'
    | 'clockSkewInSeconds'
    | 'clockSkewInMs'
    | 'jwksCacheTtlInMs'
    | 'skipJwksCache'
    | 'jwtKey'
  >
>;

export type AuthenticateRequestOptions = OptionalVerifyTokenOptions &
  LoadResourcesOptions & {
    publishableKey?: string;
    secretKey?: string;
    /**
     * @deprecated Use `secretKey` instead.
     */
    apiKey?: string;
    apiVersion?: string;
    apiUrl?: string;
    /* Client token cookie value */
    cookieToken?: string;
    /* Client uat cookie value */
    clientUat?: string;
    /* Client token header value */
    headerToken?: string;
    /* Request origin header value */
    origin?: string;
    /* Request host header value */
    host?: string;
    /* Request forwarded host value */
    forwardedHost?: string;
    /* Request forwarded port value */
    forwardedPort?: string;
    /* Request forwarded proto value */
    forwardedProto?: string;
    /* Request referrer */
    referrer?: string;
    /* Request user-agent value */
    userAgent?: string;
    domain?: string;
    isSatellite?: boolean;
    proxyUrl?: string;
    searchParams?: URLSearchParams;
    signInUrl?: string;
    signUpUrl?: string;
    afterSignInUrl?: string;
    afterSignUpUrl?: string;
    request?: Request;
  };

function assertSignInUrlExists(signInUrl: string | undefined, key: string): asserts signInUrl is string {
  if (!signInUrl && isDevelopmentFromApiKey(key)) {
    throw new Error(`Missing signInUrl. Pass a signInUrl for dev instances if an app is satellite`);
  }
}

function assertProxyUrlOrDomain(proxyUrlOrDomain: string | undefined) {
  if (!proxyUrlOrDomain) {
    throw new Error(`Missing domain and proxyUrl. A satellite application needs to specify a domain or a proxyUrl`);
  }
}

function assertSignInUrlFormatAndOrigin(_signInUrl: string, origin: string) {
  let signInUrl: URL;
  try {
    signInUrl = new URL(_signInUrl);
  } catch {
    throw new Error(`The signInUrl needs to have a absolute url format.`);
  }

  if (signInUrl.origin === origin) {
    throw new Error(`The signInUrl needs to be on a different origin than your satellite application.`);
  }
}

export async function authenticateRequest(options: AuthenticateRequestOptions): Promise<RequestState> {
  const { cookies, headers, searchParams } = buildRequest(options?.request);
  if (options.apiKey) {
    deprecated('apiKey', 'Use `secretKey` instead.');
  }

  options = {
    ...options,
    ...loadOptionsFromHeaders(options, headers),
    apiUrl: options.apiUrl || API_URL,
    apiVersion: options.apiVersion || API_VERSION,
    cookieToken: options.cookieToken || cookies?.(constants.Cookies.Session),
    clientUat: options.clientUat || cookies?.(constants.Cookies.ClientUat),
    searchParams: options.searchParams || searchParams || undefined,
  };

  assertValidSecretKey(options.secretKey || options.apiKey);

  if (options.isSatellite) {
    assertSignInUrlExists(options.signInUrl, (options.secretKey || options.apiKey) as string);
    if (options.signInUrl && options.origin /* could this actually be undefined? */) {
      assertSignInUrlFormatAndOrigin(options.signInUrl, options.origin);
    }
    assertProxyUrlOrDomain(options.proxyUrl || options.domain);
  }

  async function authenticateRequestWithTokenInHeader() {
    try {
      const state = await runInterstitialRules(options, [hasValidHeaderToken]);
      return state;
    } catch (err) {
      return handleError(err, 'header');
    }
  }

  async function authenticateRequestWithTokenInCookie() {
    try {
      const state = await runInterstitialRules(options, [
        crossOriginRequestWithoutHeader,
        nonBrowserRequestInDevRule,
        isSatelliteAndNeedsSyncing,
        isPrimaryInDevAndRedirectsToSatellite,
        potentialFirstRequestOnProductionEnvironment,
        potentialFirstLoadInDevWhenUATMissing,
        potentialRequestAfterSignInOrOutFromClerkHostedUiInDev,
        hasPositiveClientUatButCookieIsMissing,
        isNormalSignedOutState,
        hasValidCookieToken,
      ]);

      return state;
    } catch (err) {
      return handleError(err, 'cookie');
    }
  }

  function handleError(err: unknown, tokenCarrier: TokenCarrier) {
    if (err instanceof TokenVerificationError) {
      err.tokenCarrier = tokenCarrier;

      const reasonToReturnInterstitial = [
        TokenVerificationErrorReason.TokenExpired,
        TokenVerificationErrorReason.TokenNotActiveYet,
      ].includes(err.reason);

      if (reasonToReturnInterstitial) {
        if (tokenCarrier === 'header') {
          return unknownState<AuthenticateRequestOptions>(options, err.reason, err.getFullMessage());
        }
        return interstitial<AuthenticateRequestOptions>(options, err.reason, err.getFullMessage());
      }
      return signedOut<AuthenticateRequestOptions>(options, err.reason, err.getFullMessage());
    }
    return signedOut<AuthenticateRequestOptions>(options, AuthErrorReason.UnexpectedError, (err as Error).message);
  }

  if (options.headerToken) {
    return authenticateRequestWithTokenInHeader();
  }
  return authenticateRequestWithTokenInCookie();
}

export const debugRequestState = (params: RequestState) => {
  const { isSignedIn, proxyUrl, isInterstitial, reason, message, publishableKey, isSatellite, domain } = params;
  return { isSignedIn, proxyUrl, isInterstitial, reason, message, publishableKey, isSatellite, domain };
};

export type DebugRequestSate = ReturnType<typeof debugRequestState>;

/**
 * Load authenticate request options from the options provided or fallback to headers.
 */
export const loadOptionsFromHeaders = (
  options: AuthenticateRequestOptions,
  headers: ReturnType<typeof buildRequest>['headers'],
) => {
  if (!headers) {
    return {};
  }

  return {
    headerToken: stripAuthorizationHeader(options.headerToken || headers(constants.Headers.Authorization)),
    origin: options.origin || headers(constants.Headers.Origin),
    host: options.host || headers(constants.Headers.Host),
    forwardedHost: options.forwardedHost || headers(constants.Headers.ForwardedHost),
    forwardedPort: options.forwardedPort || headers(constants.Headers.ForwardedPort),
    forwardedProto:
      options.forwardedProto ||
      headers(constants.Headers.CloudFrontForwardedProto) ||
      headers(constants.Headers.ForwardedProto),
    referrer: options.referrer || headers(constants.Headers.Referrer),
    userAgent: options.userAgent || headers(constants.Headers.UserAgent),
  };
};
