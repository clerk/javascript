import { parse as parseCookies } from 'cookie';

import type { AuthStatusOptionsType, RequestState } from './authStatus';
import { AuthErrorReason, handshake, signedIn, signedOut } from './authStatus';
import { verifyToken } from './verify';

export type HandshakeRulesOptions = AuthStatusOptionsType & {
  /* Request object */
  request: Request;
  /* Request origin header value */
  origin?: string;
  /* Request host header value */
  host?: string;
  /* Request forwarded host value */
  forwardedHost?: string;
  /* Request forwarded proto value */
  forwardedProto?: string;
  /* Request referrer */
  referrer?: string;
  /* Request user-agent value */
  userAgent?: string;
  /* Client token cookie value */
  cookieToken?: string;
  /* Client uat cookie value */
  clientUat?: string;
  /* Client token header value */
  headerToken?: string;
  /* Request search params value */
  searchParams?: URLSearchParams;
  /* Temp handshake token to make demo work */
  handshakeToken?: string;
};

type RuleResult = RequestState | undefined;
type HandshakeRule = (opts: HandshakeRulesOptions) => Promise<RuleResult> | RuleResult;

const shouldRedirectToSatelliteUrl = (qp?: URLSearchParams) => !!qp?.get('__clerk_satellite_url');
const hasJustSynced = (qp?: URLSearchParams) => qp?.get('__clerk_synced') === 'true';

const VALID_USER_AGENTS = /^Mozilla\/|(Amazon CloudFront)/;

const isBrowser = (userAgent: string | undefined) => VALID_USER_AGENTS.test(userAgent || '');

// In development or staging environments only, based on the request's
// User Agent, detect non-browser requests (e.g. scripts). Since there
// is no Authorization header, consider the user as signed out and
// prevent interstitial rendering
// In production, script requests will be missing both uat and session cookies, which will be
// automatically treated as signed out. This exception is needed for development, because the any // missing uat throws an interstitial in development.
// const nonBrowserRequestInDevRule: HandshakeRule = options => {
//   const { secretKey, userAgent } = options;
//   if (isDevelopmentFromSecretKey(secretKey || '') && !isBrowser(userAgent)) {
//     return signedOut(options, AuthErrorReason.HeaderMissingNonBrowser);
//   }
//   return undefined;
// };

// const crossOriginRequestWithoutHeader: HandshakeRule = options => {
//   const { origin, host, forwardedHost, forwardedProto } = options;
//   const isCrossOrigin =
//     origin &&
//     checkCrossOrigin({
//       originURL: new URL(origin),
//       host,
//       forwardedHost,
//       forwardedProto,
//     });
//
//   if (isCrossOrigin) {
//     return signedOut(options, AuthErrorReason.HeaderMissingCORS);
//   }
//   return undefined;
// };
//
// const isPrimaryInDevAndRedirectsToSatellite: HandshakeRule = options => {
//   const { secretKey = '', isSatellite, searchParams } = options;
//   const isDev = isDevelopmentFromSecretKey(secretKey);
//
//   if (isDev && !isSatellite && shouldRedirectToSatelliteUrl(searchParams)) {
//     return interstitial(options, AuthErrorReason.PrimaryRespondsToSyncing);
//   }
//   return undefined;
// };
//
// const potentialFirstLoadInDevWhenUATMissing: HandshakeRule = options => {
//   const { secretKey = '', clientUat } = options;
//   const res = isDevelopmentFromSecretKey(secretKey);
//   if (res && !clientUat) {
//     return interstitial(options, AuthErrorReason.CookieUATMissing);
//   }
//   return undefined;
// };
//
// /**
//  * NOTE: Exclude any satellite app that has just synced from throwing an interstitial.
//  * It is expected that a primary app will trigger a redirect back to the satellite app.
//  */
// const potentialRequestAfterSignInOrOutFromClerkHostedUiInDev: HandshakeRule = options => {
//   const { secretKey = '', referrer, host, forwardedHost, forwardedProto } = options;
//   const crossOriginReferrer =
//     referrer && checkCrossOrigin({ originURL: new URL(referrer), host, forwardedHost, forwardedProto });
//
//   if (isDevelopmentFromSecretKey(secretKey) && crossOriginReferrer) {
//     return interstitial(options, AuthErrorReason.CrossOriginReferrer);
//   }
//   return undefined;
// };
//
// const potentialFirstRequestOnProductionEnvironment: HandshakeRule = options => {
//   const { secretKey = '', clientUat, cookieToken } = options;
//
//   if (isProductionFromSecretKey(secretKey) && !clientUat && !cookieToken) {
//     return signedOut(options, AuthErrorReason.CookieAndUATMissing);
//   }
//   return undefined;
// };

// TBD: Can enable if we do not want the __session cookie to be inspected.
// const signedOutOnDifferentSubdomainButCookieNotRemovedYet: AuthStateRule = (options, key) => {
//   if (isProduction(key) && !options.clientUat && !options.cookieToken) {
//     return { status: AuthStatus.Interstitial, errorReason: '' as any };
//   }
// };
const isNormalSignedOutState: HandshakeRule = options => {
  const { clientUat } = options;
  if (clientUat === '0') {
    return signedOut(options, AuthErrorReason.StandardSignedOut);
  }
  return undefined;
};

// This happens when a signed in user visits a new subdomain for the first time. The uat will be available because it's set on naked domain, but session will be missing. It can also happen if the cookieToken is manually removed during development.
const hasPositiveClientUatButCookieIsMissing: HandshakeRule = options => {
  const { clientUat, cookieToken } = options;

  if (clientUat && Number.parseInt(clientUat) > 0 && !cookieToken) {
    return handshake(options, AuthErrorReason.CookieMissing);
  }
  return undefined;
};

const hasComeBackFromHandshakeEndpoint: HandshakeRule = options => {
  const { request } = options;
  const reqUrl = new URL(request.url);
  const COOKIE_NAME = '__clerk_handshake';
  const cookies = parseCookies(request.headers.get('cookie') || '');
  const clerkHandshakeToken = cookies[COOKIE_NAME] || reqUrl.searchParams.get('__clerk_handshake');
  if (clerkHandshakeToken) {
    return handshake(options, AuthErrorReason.CookieMissing);
  }
  return undefined;
};

const hasValidHeaderToken: HandshakeRule = async options => {
  const { headerToken } = options;
  const sessionClaims = await verifyRequestState(options, headerToken as string);
  return await signedIn(options, sessionClaims);
};

const hasValidCookieToken: HandshakeRule = async options => {
  const { cookieToken, clientUat, handshakeToken } = options;
  // TODO: Remove handshakeToken
  console.log('hasValidCookieToken', { handshakeToken });
  const sessionClaims = await verifyRequestState(options, handshakeToken || (cookieToken as string));
  const state = await signedIn(options, sessionClaims);

  const jwt = state.toAuth().sessionClaims;
  const cookieTokenIsOutdated = jwt.iat < Number.parseInt(clientUat as string);

  if (!clientUat || cookieTokenIsOutdated) {
    return handshake(options, AuthErrorReason.CookieOutDated);
  }

  return state;
};

async function runHandshakeRules<T extends HandshakeRulesOptions>(
  opts: T,
  rules: HandshakeRule[],
): Promise<RequestState> {
  for (const rule of rules) {
    const res = await rule(opts);
    if (res) {
      return res;
    }
  }

  return signedOut(opts, AuthErrorReason.UnexpectedError);
}

async function verifyRequestState(options: HandshakeRulesOptions, token: string) {
  const { isSatellite, proxyUrl } = options;
  let issuer;
  if (isSatellite) {
    issuer = null;
  } else if (proxyUrl) {
    issuer = proxyUrl;
  } else {
    issuer = (iss: string) => iss.startsWith('https://clerk.') || iss.includes('.clerk.accounts');
  }

  return verifyToken(token, { ...options, issuer });
}

/**
 * Avoid throwing this rule for development instances
 * Let the next rule for UatMissing to fire if needed
 */
// const isSatelliteAndNeedsSyncing: HandshakeRule = options => {
//   const { clientUat, isSatellite, searchParams, userAgent } = options;
//
//   const isSignedOut = !clientUat || clientUat === '0';
//
//   if (isSatellite && isSignedOut && !isBrowser(userAgent)) {
//     return signedOut(options, AuthErrorReason.SatelliteCookieNeedsSyncing);
//   }
//
//   if (isSatellite && isSignedOut && !hasJustSynced(searchParams)) {
//     return interstitial(options, AuthErrorReason.SatelliteCookieNeedsSyncing);
//   }
//
//   return undefined;
// };

const rules = {
  hasValidCookieToken,
  hasValidHeaderToken,
  hasPositiveClientUatButCookieIsMissing,
  isNormalSignedOutState,
  hasComeBackFromHandshakeEndpoint,
};

export { runHandshakeRules, rules };
