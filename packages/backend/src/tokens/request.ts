import { API_URL, API_VERSION, constants } from '../constants';
import { assertValidSecretKey } from '../util/assertValidSecretKey';
import { isDevelopmentFromApiKey } from '../util/instance';
import { buildRequest, stripAuthorizationHeader } from '../util/IsomorphicRequest';
import { parsePublishableKey } from '../util/parsePublishableKey';
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
  satelliteInDevReturningFromPrimary,
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
     * @deprecated Use `publishableKey` instead.
     */
    frontendApi?: string;
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
    /**
     * @experimental
     */
    domain?: string;
    /**
     * @experimental
     */
    isSatellite?: boolean;
    /**
     * @experimental
     */
    proxyUrl?: string;
    /**
     * @experimental
     */
    searchParams?: URLSearchParams;
    /**
     * @experimental
     */
    signInUrl?: string;
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

export async function authenticateRequest(options: AuthenticateRequestOptions): Promise<RequestState> {
  const { cookies, headers, searchParams } = buildRequest(options?.request);

  options = {
    ...options,
    frontendApi: parsePublishableKey(options.publishableKey)?.frontendApi || options.frontendApi,
    apiUrl: options.apiUrl || API_URL,
    apiVersion: options.apiVersion || API_VERSION,
    headerToken: stripAuthorizationHeader(options.headerToken || headers?.(constants.Headers.Authorization)),
    cookieToken: options.cookieToken || cookies?.(constants.Cookies.Session),
    clientUat: options.clientUat || cookies?.(constants.Cookies.ClientUat),
    origin: options.origin || headers?.(constants.Headers.Origin),
    host: options.host || headers?.(constants.Headers.Host),
    forwardedHost: options.forwardedHost || headers?.(constants.Headers.ForwardedHost),
    forwardedPort: options.forwardedPort || headers?.(constants.Headers.ForwardedPort),
    forwardedProto: options.forwardedProto || headers?.(constants.Headers.ForwardedProto),
    referrer: options.referrer || headers?.(constants.Headers.Referrer),
    userAgent: options.userAgent || headers?.(constants.Headers.UserAgent),
    searchParams: options.searchParams || searchParams || undefined,
  };

  assertValidSecretKey(options.secretKey || options.apiKey);

  if (options.isSatellite) {
    assertSignInUrlExists(options.signInUrl, (options.secretKey || options.apiKey) as string);
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
        satelliteInDevReturningFromPrimary,
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
  const { frontendApi, isSignedIn, proxyUrl, isInterstitial, reason, message, publishableKey, isSatellite, domain } =
    params;
  return { frontendApi, isSignedIn, proxyUrl, isInterstitial, reason, message, publishableKey, isSatellite, domain };
};

export type DebugRequestSate = ReturnType<typeof debugRequestState>;
