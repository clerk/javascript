import { API_URL, API_VERSION } from '../constants';
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
    'audience' | 'authorizedParties' | 'clockSkewInSeconds' | 'jwksCacheTtlInMs' | 'skipJwksCache' | 'jwtKey'
  >
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
  options.frontendApi = parsePublishableKey(options.publishableKey)?.frontendApi || options.frontendApi || '';
  options.apiUrl = options.apiUrl || API_URL;
  options.apiVersion = options.apiVersion || API_VERSION;
  options.headerToken = options.headerToken?.replace('Bearer ', '');

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
