import { parsePublishableKey } from '@clerk/shared';
import type { JwtPayload } from '@clerk/types';

import { API_URL, API_VERSION } from '../constants';
import { type RequestState, AuthErrorReason, signedIn, signedOut, interstitial } from './authStatus';
import { type TokenCarrier, TokenVerificationError, TokenVerificationErrorReason } from './errors';
import { type VerifyTokenOptions, verifyToken } from './verify';

import {
  type InterstitialRule,
  nonBrowserRequestInDevRule,
  crossOriginRequestWithoutHeader,
  potentialFirstLoadInDevWhenUATMissing,
  potentialRequestAfterSignInOrOurFromClerkHostedUiInDev,
  potentialFirstRequestOnProductionEnvironment,
  isNormalSignedOutState,
  hasClientUatButCookieIsMissingInProd,
} from './interstitialRule';

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
  };

export async function authenticateRequest(options: AuthenticateRequestOptions): Promise<RequestState> {
  options.frontendApi = options.frontendApi || parsePublishableKey(options.publishableKey)?.frontendApi || '';
  options.apiUrl = options.apiUrl || API_URL;
  options.apiVersion = options.apiVersion || API_VERSION;

  async function authenticateRequestWithTokenInHeader() {
    const { headerToken } = options;

    try {
      const sessionClaims = await verifyRequestState(headerToken!);
      return await signedIn<AuthenticateRequestOptions>(options, sessionClaims);
    } catch (err) {
      return handleError(err, 'header');
    }
  }

  async function authenticateRequestWithTokenInCookie() {
    try {
      const signedOutOrInterstitial = runInterstitialRules(options, [
        nonBrowserRequestInDevRule,
        crossOriginRequestWithoutHeader,
        potentialFirstLoadInDevWhenUATMissing,
        potentialRequestAfterSignInOrOurFromClerkHostedUiInDev,
        potentialFirstRequestOnProductionEnvironment,
        isNormalSignedOutState,
        hasClientUatButCookieIsMissingInProd,
      ]);

      if (signedOutOrInterstitial) {
        return signedOutOrInterstitial;
      }

      const { cookieToken, clientUat } = options;
      const sessionClaims = await verifyRequestState(cookieToken!);
      const state = await signedIn<AuthenticateRequestOptions>(options, sessionClaims);

      if (!clientUat || cookieTokenIsOutdated(state.toAuth().sessionClaims, clientUat)) {
        return interstitial<AuthenticateRequestOptions>(options, AuthErrorReason.CookieOutDated);
      }

      return state;
    } catch (err) {
      return handleError(err, 'cookie');
    }
  }

  function verifyRequestState(token: string) {
    const issuer = (iss: string) => iss.startsWith('https://clerk.') || iss.includes('.clerk.accounts');

    return verifyToken(token, {
      ...options,
      issuer,
    });
  }

  function handleError(err: unknown, tokenCarrier: TokenCarrier) {
    if (err instanceof TokenVerificationError) {
      err.tokenCarrier = tokenCarrier;

      const reasonToReturnInterstitial = [
        TokenVerificationErrorReason.TokenExpired,
        TokenVerificationErrorReason.TokenNotActiveYet,
      ].includes(err.reason);

      if (reasonToReturnInterstitial) {
        return interstitial<AuthenticateRequestOptions>(options, err.reason, err.getFullMessage());
      }
      return signedOut<AuthenticateRequestOptions>(options, err.reason, err.getFullMessage());
    }
    return signedOut<AuthenticateRequestOptions>(options, AuthErrorReason.UnexpectedError, (err as Error).message);
  }

  function cookieTokenIsOutdated(jwt: JwtPayload, clientUat: string) {
    return jwt.iat < Number.parseInt(clientUat);
  }

  type RunRules = (opts: AuthenticateRequestOptions, rules: InterstitialRule[]) => RequestState | undefined;

  const runInterstitialRules: RunRules = (opts, rules) => {
    for (const rule of rules) {
      const res = rule(opts);
      if (res) {
        return res;
      }
    }
    return undefined;
  };

  if (options.headerToken) {
    return authenticateRequestWithTokenInHeader();
  }
  return authenticateRequestWithTokenInCookie();
}

export const debugRequestState = (params: RequestState) => {
  const { frontendApi, isSignedIn, isInterstitial, reason, message, publishableKey } = params;
  return { frontendApi, isSignedIn, isInterstitial, reason, message, publishableKey };
};
