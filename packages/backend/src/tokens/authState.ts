import type { JwtPayload } from '@clerk/types';

import { isDevelopmentFromApiKey, isProductionFromApiKey } from '../util/instance';
import { checkCrossOrigin } from '../util/request';
import { TokenVerificationError, TokenVerificationErrorReason } from './errors';
import { type VerifyTokenOptions, verifyToken } from './verify';

type RequiredVerifyTokenOptions = Required<Pick<VerifyTokenOptions, 'apiKey' | 'apiUrl'>>;
type OptionalVerifyTokenOptions = Partial<
  Pick<VerifyTokenOptions, 'authorizedParties' | 'clockSkewInSeconds' | 'jwksTtlInMs'>
>;

export type TokenCarrier = 'header' | 'cookie';

export type AuthStateParams = RequiredVerifyTokenOptions &
  OptionalVerifyTokenOptions & {
    /* Client token cookie value */
    cookieToken?: string;
    /* Client uat cookie value */
    clientUat?: string;
    /* Client token header value */
    headerToken?: string;
    /* Request origin header value */
    origin?: string;
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

export enum AuthStatus {
  SignedIn = 'signed-in',
  SignedOut = 'signed-out',
  Interstitial = 'interstitial',
}

export type SignedInAuthState = {
  status: AuthStatus.SignedIn;
  session: any; // TODO:
  sessionClaims: JwtPayload;
};

export type SignedOutAuthState = {
  status: AuthStatus.SignedOut;
  message: string;
  reason: AuthStateReason;
};

export type InterstitialAuthState = {
  status: AuthStatus.Interstitial;
  reason: AuthStateReason;
};

export type AuthState = SignedInAuthState | SignedOutAuthState | InterstitialAuthState;

export async function getAuthState(params: AuthStateParams): Promise<AuthState> {
  if (params.headerToken) {
    return handleRequestWithTokenInHeader(params);
  }
  return handleRequestWithTokenInCookie(params);
}

async function handleRequestWithTokenInHeader({ headerToken, ...rest }: AuthStateParams) {
  try {
    return await buildAuthenticatedState(headerToken!, rest);
  } catch (err) {
    return handleError(err, 'header');
  }
}

async function handleRequestWithTokenInCookie(params: AuthStateParams) {
  const signedOutOrInterstitial = runInterstitialRules(params, [
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
    const { cookieToken, ...rest } = params;
    const authenticatedState = await buildAuthenticatedState(cookieToken!, rest);

    if (!params.clientUat || cookieTokenIsOutdated(authenticatedState.sessionClaims, params.clientUat)) {
      return interstitial(AuthStateReason.CookieOutDated);
    }

    return authenticatedState;
  } catch (err) {
    return handleError(err, 'cookie');
  }
}

async function buildAuthenticatedState(token: string, params: Omit<AuthStateParams, 'headerToken' | 'cookieToken'>) {
  const issuer = (iss: string) => iss.startsWith('https://clerk.');

  const sessionClaims = await verifyToken(token, {
    ...params,
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
      return interstitial(AuthStateReason.TokenVerificationError);
    }
    return signedOut(AuthStateReason.TokenVerificationError, err.getFullMessage());
  }
  return signedOut(AuthStateReason.UnexpectedError, (err as Error).message);
}

function cookieTokenIsOutdated(jwt: JwtPayload, clientUat: string) {
  return jwt.iat < Number.parseInt(clientUat);
}

function signedIn(sessionClaims: JwtPayload): SignedInAuthState {
  // TODO: Do we need this to be an API Session object?
  const session = {
    id: sessionClaims.sid,
    userId: sessionClaims.sub,
    orgId: sessionClaims.org_id,
    orgRole: sessionClaims.org_role,
  };

  return { status: AuthStatus.SignedIn, session, sessionClaims };
}

function signedOut(reason: AuthStateReason, message = ''): SignedOutAuthState {
  return {
    status: AuthStatus.SignedOut,
    reason,
    message,
  };
}

function interstitial(reason: AuthStateReason): InterstitialAuthState {
  return {
    status: AuthStatus.Interstitial,
    reason,
  };
}

type InterstitialRule = (params: AuthStateParams) => AuthState | undefined;
type RunRules = (params: AuthStateParams, rules: InterstitialRule[]) => AuthState | undefined;

const runInterstitialRules: RunRules = (params, rules) => {
  for (const rule of rules) {
    const res = rule(params);
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
    referrer && checkCrossOrigin({ originURL: new URL(referrer), host, forwardedHost, forwardedPort, forwardedProto });

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
// const signedOutOnDifferentSubdomainButCookieNotRemovedYet: AuthStateRule = (params, key) => {
//   if (isProduction(key) && !params.clientUat && !params.cookieToken) {
//     return { status: AuthStatus.Interstitial, errorReason: '' as any };
//   }
// };
const isNormalSignedOutState: InterstitialRule = ({ clientUat }) => {
  if (clientUat === '0') {
    return signedOut(AuthStateReason.StandardSignedOut);
  }
  return undefined;
};

//This happens when a signed in user visits a new subdomain for the first time. The uat will be available because it's set on naked domain, but session will be missing.
const hasClientUatButCookieIsMissingInProd: InterstitialRule = ({ apiKey, clientUat, cookieToken }) => {
  if (isProductionFromApiKey(apiKey) && clientUat && !cookieToken) {
    return interstitial(AuthStateReason.CookieMissing);
  }
  return undefined;
};
