import { API_URL, API_VERSION, constants } from '../constants';
import { assertValidSecretKey } from '../util/assertValidSecretKey';
import { isDevelopmentFromApiKey } from '../util/instance';
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

export interface RequestAdapter {
  /**
   * The headers method returns the value of the specified header. Keys given to this method are
   * normalized to lowercase, as they exist in `packages/backend/src/constants.ts`.
   * Implementing this method requires the user to manipulate the header keys accordingly.
   *
   * @param key The header name to retrieve
   */
  headers(key: string): string | undefined;

  /**
   * The cookies method returns the value of the specified cookie.
   * Keys given to this method exist in `packages/backend/src/constants.ts`.
   *
   * @param key The cookie name to retrieve
   */
  cookies(key: string): string | undefined;

  /**
   * The searchParams method returns a URLSearchParams object that contains the query parameters
   * of the request.
   */
  searchParams(): URLSearchParams | undefined;
}

export type LoadResourcesOptions = {
  loadSession?: boolean;
  loadUser?: boolean;
  loadOrganization?: boolean;
};

export type RequiredVerifyTokenOptions = Required<
  Pick<VerifyTokenOptions, 'apiKey' | 'secretKey' | 'apiUrl' | 'apiVersion'>
>;

export type OptionalVerifyTokenOptions = Partial<
  Pick<VerifyTokenOptions, 'authorizedParties' | 'clockSkewInSeconds' | 'jwksCacheTtlInMs' | 'skipJwksCache' | 'jwtKey'>
>;

type PublicKeys =
  | {
      publishableKey: string;
      /**
       * @deprecated Use `publishableKey` instead.
       */
      frontendApi: never;
    }
  | {
      publishableKey: never;
      /**
       * @deprecated Use `publishableKey` instead.
       */
      frontendApi: string;
    }
  | {
      publishableKey: string;
      /**
       * @deprecated Use `publishableKey` instead.
       */
      frontendApi: string;
    };

type SecretKeys =
  | {
      secretKey: string;
      /**
       * @deprecated Use `secretKey` instead.
       */
      apiKey: never;
    }
  | {
      secretKey: never;
      /**
       * @deprecated Use `secretKey` instead.
       */
      apiKey: string;
    }
  | {
      secretKey: string;
      /**
       * @deprecated Use `secretKey` instead.
       */
      apiKey: string;
    };

export type InstanceKeys = PublicKeys & SecretKeys;

export type AuthenticateRequestOptions = InstanceKeys &
  OptionalVerifyTokenOptions &
  LoadResourcesOptions & {
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
    requestAdapter?: RequestAdapter;
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
  options = {
    ...options,
    frontendApi: parsePublishableKey(options.publishableKey)?.frontendApi || options.frontendApi,
    apiUrl: options.apiUrl || API_URL,
    apiVersion: options.apiVersion || API_VERSION,
    headerToken:
      stripAuthorizationHeader(options.headerToken) ||
      stripAuthorizationHeader(options.requestAdapter?.headers(constants.Headers.Authorization)) ||
      undefined,
    cookieToken: options.cookieToken || options.requestAdapter?.cookies(constants.Cookies.Session) || undefined,
    clientUat: options.clientUat || options.requestAdapter?.cookies(constants.Cookies.ClientUat) || undefined,
    origin: options.origin || options.requestAdapter?.headers(constants.Headers.Origin) || undefined,
    host: options.host || options.requestAdapter?.headers(constants.Headers.Host) || undefined,
    forwardedHost:
      options.forwardedHost || options.requestAdapter?.headers(constants.Headers.ForwardedHost) || undefined,
    forwardedPort:
      options.forwardedPort || options.requestAdapter?.headers(constants.Headers.ForwardedPort) || undefined,
    forwardedProto:
      options.forwardedProto || options.requestAdapter?.headers(constants.Headers.ForwardedProto) || undefined,
    referrer: options.referrer || options.requestAdapter?.headers(constants.Headers.Referrer) || undefined,
    userAgent: options.userAgent || options.requestAdapter?.headers(constants.Headers.UserAgent) || undefined,
    searchParams: options.searchParams || options.requestAdapter?.searchParams() || undefined,
  };

  assertValidSecretKey(options.secretKey || options.apiKey);

  if (options.isSatellite) {
    assertSignInUrlExists(options.signInUrl, options.secretKey || options.apiKey);
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

const stripAuthorizationHeader = (authValue: string | undefined): string | undefined => {
  return authValue?.replace('Bearer ', '');
};
