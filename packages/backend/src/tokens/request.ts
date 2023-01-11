import { parsePublishableKey } from '@clerk/shared';
import type { JwtPayload } from '@clerk/types';

import { createBackendApiClient } from '../api';
import { API_URL, API_VERSION } from '../constants';
import { isDevelopmentFromApiKey, isProductionFromApiKey } from '../util/instance';
import { checkCrossOrigin } from '../util/request';
import { signedInAuthObject, signedOutAuthObject } from './authObjects';
import {
  type AuthReason,
  type InterstitialState,
  type RequestState,
  type SignedInState,
  type SignedOutState,
  AuthErrorReason,
  AuthStatus,
} from './authStatus';
import { type TokenCarrier, TokenVerificationError, TokenVerificationErrorReason } from './errors';
import { type VerifyTokenOptions, verifyToken } from './verify';

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
      return await signedIn(sessionClaims);
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
      const state = await signedIn(sessionClaims);

      if (!clientUat || cookieTokenIsOutdated(state.toAuth().sessionClaims, clientUat)) {
        return interstitial(AuthErrorReason.CookieOutDated);
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
        return interstitial(err.reason, err.getFullMessage());
      }
      return signedOut(err.reason, err.getFullMessage());
    }
    return signedOut(AuthErrorReason.UnexpectedError, (err as Error).message);
  }

  function cookieTokenIsOutdated(jwt: JwtPayload, clientUat: string) {
    return jwt.iat < Number.parseInt(clientUat);
  }

  async function signedIn(sessionClaims: JwtPayload): Promise<SignedInState> {
    const { sid: sessionId, org_id: orgId, sub: userId } = sessionClaims;

    const {
      apiKey,
      secretKey,
      apiUrl,
      apiVersion,
      cookieToken,
      frontendApi,
      publishableKey,
      headerToken,
      loadSession,
      loadUser,
      loadOrganization,
    } = options;

    const { sessions, users, organizations } = createBackendApiClient({
      apiKey,
      secretKey,
      apiUrl,
      apiVersion,
    });

    const [sessionResp, userResp, organizationResp] = await Promise.all([
      loadSession ? sessions.getSession(sessionId) : Promise.resolve(undefined),
      loadUser ? users.getUser(userId) : Promise.resolve(undefined),
      loadOrganization && orgId ? organizations.getOrganization({ organizationId: orgId }) : Promise.resolve(undefined),
    ]);

    const session = sessionResp;
    const user = userResp;
    const organization = organizationResp;
    // const session = sessionResp && !sessionResp.errors ? sessionResp.data : undefined;
    // const user = userResp && !userResp.errors ? userResp.data : undefined;
    // const organization = organizationResp && !organizationResp.errors ? organizationResp.data : undefined;

    const authObject = signedInAuthObject(
      sessionClaims,
      {
        apiKey,
        secretKey,
        apiUrl,
        apiVersion,
        token: cookieToken || headerToken || '',
        session,
        user,
        organization,
      },
      { ...options, status: AuthStatus.SignedIn },
    );

    return {
      status: AuthStatus.SignedIn,
      reason: null,
      message: null,
      frontendApi,
      publishableKey,
      isSignedIn: true,
      isInterstitial: false,
      toAuth: () => authObject,
    };
  }

  function signedOut(reason: AuthReason, message = ''): SignedOutState {
    return {
      status: AuthStatus.SignedOut,
      reason,
      message,
      frontendApi: options.frontendApi,
      publishableKey: options.publishableKey,
      isSignedIn: false,
      isInterstitial: false,
      toAuth: () => signedOutAuthObject({ ...options, status: AuthStatus.SignedOut, reason, message }),
    };
  }

  function interstitial(reason: AuthReason, message = ''): InterstitialState {
    return {
      status: AuthStatus.Interstitial,
      reason,
      message,
      frontendApi: options.frontendApi,
      publishableKey: options.publishableKey,
      isSignedIn: false,
      isInterstitial: true,
      toAuth: () => null,
    };
  }

  type InterstitialRule = (opts: AuthenticateRequestOptions) => RequestState | undefined;
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

  // In development or staging environments only, based on the request's
  // User Agent, detect non-browser requests (e.g. scripts). Since there
  // is no Authorization header, consider the user as signed out and
  // prevent interstitial rendering
  // In production, script requests will be missing both uat and session cookies, which will be
  // automatically treated as signed out. This exception is needed for development, because the any // missing uat throws an interstitial in development.
  const nonBrowserRequestInDevRule: InterstitialRule = ({ apiKey, secretKey, userAgent }) => {
    const key = secretKey || apiKey;
    if (isDevelopmentFromApiKey(key) && !userAgent?.startsWith('Mozilla/')) {
      return signedOut(AuthErrorReason.HeaderMissingNonBrowser);
    }
    return undefined;
  };

  const crossOriginRequestWithoutHeader: InterstitialRule = ({
    origin,
    host,
    forwardedHost,
    forwardedPort,
    forwardedProto,
  }) => {
    const isCrossOrigin =
      origin &&
      checkCrossOrigin({
        originURL: new URL(origin),
        host,
        forwardedHost,
        forwardedPort,
        forwardedProto,
      });

    if (isCrossOrigin) {
      return signedOut(AuthErrorReason.HeaderMissingCORS);
    }
    return undefined;
  };

  const potentialFirstLoadInDevWhenUATMissing: InterstitialRule = ({ apiKey, secretKey, clientUat }) => {
    const key = secretKey || apiKey;

    const res = isDevelopmentFromApiKey(key);
    if (res && !clientUat) {
      return interstitial(AuthErrorReason.CookieUATMissing);
    }
    return undefined;
  };

  const potentialRequestAfterSignInOrOurFromClerkHostedUiInDev: InterstitialRule = ({
    apiKey,
    secretKey,
    referrer,
    host,
    forwardedHost,
    forwardedPort,
    forwardedProto,
  }) => {
    const crossOriginReferrer =
      referrer &&
      checkCrossOrigin({ originURL: new URL(referrer), host, forwardedHost, forwardedPort, forwardedProto });
    const key = secretKey || apiKey;

    if (isDevelopmentFromApiKey(key) && crossOriginReferrer) {
      return interstitial(AuthErrorReason.CrossOriginReferrer);
    }
    return undefined;
  };

  const potentialFirstRequestOnProductionEnvironment: InterstitialRule = ({
    apiKey,
    secretKey,
    clientUat,
    cookieToken,
  }) => {
    const key = secretKey || apiKey;

    if (isProductionFromApiKey(key) && !clientUat && !cookieToken) {
      return signedOut(AuthErrorReason.CookieAndUATMissing);
    }
    return undefined;
  };

  // TBD: Can enable if we do not want the __session cookie to be inspected.
  // const signedOutOnDifferentSubdomainButCookieNotRemovedYet: AuthStateRule = (options, key) => {
  //   if (isProduction(key) && !options.clientUat && !options.cookieToken) {
  //     return { status: AuthStatus.Interstitial, errorReason: '' as any };
  //   }
  // };
  const isNormalSignedOutState: InterstitialRule = ({ clientUat }) => {
    if (clientUat === '0') {
      return signedOut(AuthErrorReason.StandardSignedOut);
    }
    return undefined;
  };

  // This happens when a signed in user visits a new subdomain for the first time. The uat will be available because it's set on naked domain, but session will be missing. It can also happen if the cookieToken is manually removed during development.
  const hasClientUatButCookieIsMissingInProd: InterstitialRule = ({ clientUat, cookieToken }) => {
    if (clientUat && !cookieToken) {
      return interstitial(AuthErrorReason.CookieMissing);
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
