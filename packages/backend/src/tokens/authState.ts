import type { ActClaim, JwtPayload, ServerGetToken } from '@clerk/types';

import { createBackendApiClient } from '../api';
import { Organization, Session, User } from '../api/resources';
import { API_URL, API_VERSION } from '../constants';
import { isDevelopmentFromApiKey, isProductionFromApiKey } from '../util/instance';
import { checkCrossOrigin } from '../util/request';
import { TokenVerificationError, TokenVerificationErrorReason } from './errors';
import { createGetToken } from './getToken';
import { type VerifyTokenOptions, verifyToken } from './verify';

type RequiredVerifyTokenOptions = Required<Pick<VerifyTokenOptions, 'apiKey' | 'apiUrl' | 'apiVersion'>>;
type OptionalVerifyTokenOptions = Partial<
  Pick<VerifyTokenOptions, 'authorizedParties' | 'clockSkewInSeconds' | 'jwksCacheTtlInMs' | 'skipJwksCache' | 'jwtKey'>
>;

export type TokenCarrier = 'header' | 'cookie';

type LoadResourcesOptions = {
  loadSession?: boolean;
  loadUser?: boolean;
  loadOrganization?: boolean;
};

export type AuthStateOptions = RequiredVerifyTokenOptions &
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

export enum AuthStateReason {
  TokenVerificationError = 'token-verification-error',
  JWTKeyMissing = 'jwt-key-missing',
  InlineKeyMissing = 'inline-key-missing',
  InlineKeyInvalid = 'inline-key-invalid',
  HeaderExpired = 'header-expired',
  HeaderEarly = 'header-early',
  HeaderInvalid = 'header-invalid',
  HeaderInvalidIssuer = 'header-invalid-issuer',
  HeaderMissingNonBrowser = 'header-missing-non-browser',
  HeaderMissingCORS = 'header-missing-cors',
  HeaderUnauthorizedParty = 'header-unauthorized-party',
  HeaderVerificationFailed = 'header-verification-failed',
  UATMissing = 'uat-missing',
  CrossOriginReferrer = 'cross-origin-referrer',
  CookieAndUATMissing = 'cookie-and-uat-missing',
  StandardSignedOut = 'standard-signed-out',
  CookieMissing = 'cookie-missing',
  CookieExpired = 'cookie-expired',
  CookieEarly = 'cookie-early',
  CookieInvalid = 'cookie-invalid',
  CookieInvalidIssuer = 'cookie-invalid-issuer',
  CookieOutDated = 'cookie-outdated',
  CookieUnauthorizedParty = 'cookie-unauthorized-party',
  CookieVerificationFailed = 'cookie-verification-failed',
  UnexpectedError = 'unexpected-error',
  PublicKeyFetchError = 'pk-fetch-error',
  Unknown = 'unknown',
}

export type SignedInAuthState = {
  frontendApi: string;
  isSignedIn: true;
  isInterstitial: false;
  reason: null;
  message: null;
  sessionClaims: JwtPayload;
  sessionId: string;
  session?: Session;
  actor?: ActClaim;
  userId: string;
  user?: User;
  orgId?: string;
  orgRole?: string;
  organization?: Organization;
  getToken: ServerGetToken;
};

export type SignedOutAuthState = {
  frontendApi: string;
  isSignedIn: false;
  isInterstitial: false;
  message: string;
  reason: AuthStateReason;
  sessionClaims: null;
  sessionId: null;
  session: null;
  userId: null;
  user: null;
  orgId: null;
  orgRole: null;
  organization: null;
  getToken: ServerGetToken;
};

export type InterstitialAuthState = Omit<SignedOutAuthState, 'isInterstitial'> & {
  isSignedIn: false;
  isInterstitial: true;
  reason: AuthStateReason;
};

export type AuthState = SignedInAuthState | SignedOutAuthState | InterstitialAuthState;

export async function getAuthState(options: AuthStateOptions): Promise<AuthState> {
  options.apiUrl = options.apiUrl || API_URL;
  options.apiVersion = options.apiVersion || API_VERSION;

  async function handleRequestWithTokenInHeader() {
    const { headerToken } = options;

    try {
      return await buildAuthenticatedState(headerToken!);
    } catch (err) {
      return handleError(err, 'header');
    }
  }

  async function handleRequestWithTokenInCookie() {
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

    try {
      const { cookieToken, clientUat } = options;
      const authenticatedState = await buildAuthenticatedState(cookieToken!);

      if (!clientUat || cookieTokenIsOutdated(authenticatedState.sessionClaims, clientUat)) {
        return interstitial(AuthStateReason.CookieOutDated);
      }

      return authenticatedState;
    } catch (err) {
      return handleError(err, 'cookie');
    }
  }

  async function buildAuthenticatedState(token: string) {
    const issuer = (iss: string) => iss.startsWith('https://clerk.');

    const sessionClaims = await verifyToken(token, {
      ...options,
      issuer,
    });

    return signedIn(sessionClaims);
  }

  function handleError(err: unknown, tokenCarrier: TokenCarrier) {
    if (err instanceof TokenVerificationError) {
      err.tokenCarrier = tokenCarrier;

      const reasonToReturnInterstitial = [
        TokenVerificationErrorReason.TokenExpired,
        TokenVerificationErrorReason.TokenNotActiveYet,
      ].includes(err.reason);

      if (reasonToReturnInterstitial) {
        return interstitial(AuthStateReason.TokenVerificationError, err.getFullMessage());
      }
      return signedOut(AuthStateReason.TokenVerificationError, err.getFullMessage());
    }
    return signedOut(AuthStateReason.UnexpectedError, (err as Error).message);
  }

  function cookieTokenIsOutdated(jwt: JwtPayload, clientUat: string) {
    return jwt.iat < Number.parseInt(clientUat);
  }

  async function signedIn(sessionClaims: JwtPayload): Promise<SignedInAuthState> {
    const { sid: sessionId, org_id: orgId, org_role: orgRole, sub: userId } = sessionClaims;
    const {
      apiKey,
      apiUrl,
      apiVersion,
      frontendApi,
      cookieToken,
      headerToken,
      loadSession,
      loadUser,
      loadOrganization,
    } = options;

    const { sessions, users, organizations } = createBackendApiClient({
      apiKey,
      apiUrl,
      apiVersion,
    });

    const [sessionResp, userResp, organizationResp] = await Promise.all([
      loadSession ? sessions.getSession(sessionId) : Promise.resolve(undefined),
      loadUser ? users.getUser(userId) : Promise.resolve(undefined),
      loadOrganization && orgId ? organizations.getOrganization({ organizationId: orgId }) : Promise.resolve(undefined),
    ]);

    // TODO: Returns errors that might occur when loading resources while building signed-in state.
    const session = sessionResp && !sessionResp.errors ? sessionResp.data : undefined;
    const user = userResp && !userResp.errors ? userResp.data : undefined;
    const organization = organizationResp && !organizationResp.errors ? organizationResp.data : undefined;
    const actor = sessionClaims.act;

    const getToken = createGetToken({
      sessionId,
      cookieToken,
      headerToken,
      fetcher: (...args) => sessions.getToken(...args),
    });

    return {
      frontendApi,
      isSignedIn: true,
      isInterstitial: false,
      message: null,
      reason: null,
      actor,
      sessionClaims,
      sessionId,
      session,
      userId,
      user,
      orgId,
      orgRole,
      organization,
      getToken,
    };
  }

  function signedOut(reason: AuthStateReason, message = ''): SignedOutAuthState {
    return {
      isSignedIn: false,
      isInterstitial: false,
      reason,
      message,
      ..._signedOutState(),
    };
  }

  function interstitial(reason: AuthStateReason, message = ''): InterstitialAuthState {
    return {
      isSignedIn: false,
      isInterstitial: true,
      reason,
      message,
      ..._signedOutState(),
    };
  }

  function _signedOutState() {
    return {
      frontendApi: options.frontendApi,
      sessionClaims: null,
      sessionId: null,
      session: null,
      userId: null,
      user: null,
      actor: null,
      orgId: null,
      orgRole: null,
      organization: null,
      getToken: () => Promise.resolve(null),
    };
  }

  type InterstitialRule = (opts: AuthStateOptions) => AuthState | undefined;
  type RunRules = (opts: AuthStateOptions, rules: InterstitialRule[]) => AuthState | undefined;

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
  const nonBrowserRequestInDevRule: InterstitialRule = ({ apiKey, userAgent }) => {
    if (isDevelopmentFromApiKey(apiKey) && !userAgent?.startsWith('Mozilla/')) {
      return signedOut(AuthStateReason.HeaderMissingNonBrowser);
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
      return signedOut(AuthStateReason.HeaderMissingCORS);
    }
    return undefined;
  };

  const potentialFirstLoadInDevWhenUATMissing: InterstitialRule = ({ apiKey, clientUat }) => {
    const res = isDevelopmentFromApiKey(apiKey);
    if (res && !clientUat) {
      return interstitial(AuthStateReason.UATMissing);
    }
    return undefined;
  };

  const potentialRequestAfterSignInOrOurFromClerkHostedUiInDev: InterstitialRule = ({
    apiKey,
    referrer,
    host,
    forwardedHost,
    forwardedPort,
    forwardedProto,
  }) => {
    const crossOriginReferrer =
      referrer &&
      checkCrossOrigin({ originURL: new URL(referrer), host, forwardedHost, forwardedPort, forwardedProto });

    if (isDevelopmentFromApiKey(apiKey) && crossOriginReferrer) {
      return interstitial(AuthStateReason.CrossOriginReferrer);
    }
    return undefined;
  };

  const potentialFirstRequestOnProductionEnvironment: InterstitialRule = ({ apiKey, clientUat, cookieToken }) => {
    if (isProductionFromApiKey(apiKey) && !clientUat && !cookieToken) {
      return signedOut(AuthStateReason.CookieAndUATMissing);
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
      return signedOut(AuthStateReason.StandardSignedOut);
    }
    return undefined;
  };

  //This happens when a signed in user visits a new subdomain for the first time. The uat will be available because it's set on naked domain, but session will be missing. It can also happen if the cookieToken is manually removed during development.
  const hasClientUatButCookieIsMissingInProd: InterstitialRule = ({ clientUat, cookieToken }) => {
    if (clientUat && !cookieToken) {
      return interstitial(AuthStateReason.CookieMissing);
    }
    return undefined;
  };

  if (options.headerToken) {
    return handleRequestWithTokenInHeader();
  }
  return handleRequestWithTokenInCookie();
}
