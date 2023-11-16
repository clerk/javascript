import { checkCrossOrigin } from '../util/request';
import { isDevelopmentFromApiKey, isProductionFromApiKey } from '../util/shared';
import type { AuthStatusOptionsType, RequestState } from './authStatus';
import { AuthErrorReason, interstitial, signedIn, signedOut } from './authStatus';
import { verifyToken } from './verify';

export type InterstitialRuleOptions = AuthStatusOptionsType & {
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
};

type InterstitialRuleResult = RequestState | undefined;
type InterstitialRule = (opts: InterstitialRuleOptions) => Promise<InterstitialRuleResult> | InterstitialRuleResult;

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
export const nonBrowserRequestInDevRule: InterstitialRule = options => {
  const { secretKey, userAgent } = options;
  if (isDevelopmentFromApiKey(secretKey || '') && !isBrowser(userAgent)) {
    return signedOut(options, AuthErrorReason.HeaderMissingNonBrowser);
  }
  return undefined;
};

export const crossOriginRequestWithoutHeader: InterstitialRule = options => {
  const { origin, host, forwardedHost, forwardedProto } = options;
  const isCrossOrigin =
    origin &&
    checkCrossOrigin({
      originURL: new URL(origin),
      host,
      forwardedHost,
      forwardedProto,
    });

  if (isCrossOrigin) {
    return signedOut(options, AuthErrorReason.HeaderMissingCORS);
  }
  return undefined;
};

export const isPrimaryInDevAndRedirectsToSatellite: InterstitialRule = options => {
  const { secretKey = '', isSatellite, searchParams } = options;
  const isDev = isDevelopmentFromApiKey(secretKey);

  if (isDev && !isSatellite && shouldRedirectToSatelliteUrl(searchParams)) {
    return interstitial(options, AuthErrorReason.PrimaryRespondsToSyncing);
  }
  return undefined;
};

export const potentialFirstLoadInDevWhenUATMissing: InterstitialRule = options => {
  const { secretKey = '', clientUat } = options;
  const res = isDevelopmentFromApiKey(secretKey);
  if (res && !clientUat) {
    return interstitial(options, AuthErrorReason.CookieUATMissing);
  }
  return undefined;
};

/**
 * NOTE: Exclude any satellite app that has just synced from throwing an interstitial.
 * It is expected that a primary app will trigger a redirect back to the satellite app.
 */
export const potentialRequestAfterSignInOrOutFromClerkHostedUiInDev: InterstitialRule = options => {
  const { secretKey = '', referrer, host, forwardedHost, forwardedProto } = options;
  const crossOriginReferrer =
    referrer && checkCrossOrigin({ originURL: new URL(referrer), host, forwardedHost, forwardedProto });

  if (isDevelopmentFromApiKey(secretKey) && crossOriginReferrer) {
    return interstitial(options, AuthErrorReason.CrossOriginReferrer);
  }
  return undefined;
};

export const potentialFirstRequestOnProductionEnvironment: InterstitialRule = options => {
  const { secretKey = '', clientUat, cookieToken } = options;

  if (isProductionFromApiKey(secretKey) && !clientUat && !cookieToken) {
    return signedOut(options, AuthErrorReason.CookieAndUATMissing);
  }
  return undefined;
};

// TBD: Can enable if we do not want the __session cookie to be inspected.
// const signedOutOnDifferentSubdomainButCookieNotRemovedYet: AuthStateRule = (options, key) => {
//   if (isProduction(key) && !options.clientUat && !options.cookieToken) {
//     return { status: AuthStatus.Interstitial, errorReason: '' as any };
//   }
// };
export const isNormalSignedOutState: InterstitialRule = options => {
  const { clientUat } = options;
  if (clientUat === '0') {
    return signedOut(options, AuthErrorReason.StandardSignedOut);
  }
  return undefined;
};

// This happens when a signed in user visits a new subdomain for the first time. The uat will be available because it's set on naked domain, but session will be missing. It can also happen if the cookieToken is manually removed during development.
export const hasPositiveClientUatButCookieIsMissing: InterstitialRule = options => {
  const { clientUat, cookieToken } = options;

  if (clientUat && Number.parseInt(clientUat) > 0 && !cookieToken) {
    return interstitial(options, AuthErrorReason.CookieMissing);
  }
  return undefined;
};

export const hasValidHeaderToken: InterstitialRule = async options => {
  const { headerToken } = options;
  const sessionClaims = await verifyRequestState(options, headerToken as string);
  return await signedIn(options, sessionClaims);
};

export const hasValidCookieToken: InterstitialRule = async options => {
  const { cookieToken, clientUat } = options;
  const sessionClaims = await verifyRequestState(options, cookieToken as string);
  const state = await signedIn(options, sessionClaims);

  const jwt = state.toAuth().sessionClaims;
  const cookieTokenIsOutdated = jwt.iat < Number.parseInt(clientUat as string);

  if (!clientUat || cookieTokenIsOutdated) {
    return interstitial(options, AuthErrorReason.CookieOutDated);
  }

  return state;
};

export async function runInterstitialRules<T extends InterstitialRuleOptions>(
  opts: T,
  rules: InterstitialRule[],
): Promise<RequestState> {
  for (const rule of rules) {
    const res = await rule(opts);
    if (res) {
      return res;
    }
  }

  return signedOut(opts, AuthErrorReason.UnexpectedError);
}

async function verifyRequestState(options: InterstitialRuleOptions, token: string) {
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
export const isSatelliteAndNeedsSyncing: InterstitialRule = options => {
  const { clientUat, isSatellite, searchParams, userAgent } = options;

  const isSignedOut = !clientUat || clientUat === '0';

  if (isSatellite && isSignedOut && !isBrowser(userAgent)) {
    return signedOut(options, AuthErrorReason.SatelliteCookieNeedsSyncing);
  }

  if (isSatellite && isSignedOut && !hasJustSynced(searchParams)) {
    return interstitial(options, AuthErrorReason.SatelliteCookieNeedsSyncing);
  }

  return undefined;
};
