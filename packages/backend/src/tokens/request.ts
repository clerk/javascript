import { API_URL, API_VERSION } from '../constants';
import { assertValidSecretKey } from '../util/assertValidSecretKey';
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
  isPrimaryInDevAndSyncing,
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
    'authorizedParties' | 'clockSkewInSeconds' | 'jwksCacheTtlInMs' | 'skipJwksCache' | 'jwtKey' | 'proxyUrl'
  >
>;

export type AuthenticateRequestOptions = RequiredVerifyTokenOptions &
  OptionalVerifyTokenOptions &
  LoadResourcesOptions & {
    /* Client token cookie value */
    cookieToken?: string;
    /* Client uat cookie value */
    clientUat?: string;
    /* Client token header value */
    headerToken?: string;
    /* Request origin header value */
    origin?: string;
    /* Clerk frontend Api value */
    frontendApi: string;
    /* Clerk Publishable Key value */
    publishableKey: string;
    /* Request host header value */
    host: string;
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
    searchParams?: URLSearchParams;
  };

export async function authenticateRequest(options: AuthenticateRequestOptions): Promise<RequestState> {
  options.frontendApi = parsePublishableKey(options.publishableKey)?.frontendApi || options.frontendApi || '';
  options.apiUrl = options.apiUrl || API_URL;
  options.apiVersion = options.apiVersion || API_VERSION;

  assertValidSecretKey(options.secretKey || options.apiKey);

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
        isPrimaryInDevAndSyncing,
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
