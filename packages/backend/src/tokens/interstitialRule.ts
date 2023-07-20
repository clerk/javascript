import { isDevelopmentFromApiKey, isProductionFromApiKey } from '../util/instance';
import { checkCrossOrigin } from '../util/request';
import type { RequestState } from './authStatus';
import { AuthErrorReason, interstitial, signedIn, signedOut } from './authStatus';
import type { AuthenticateRequestOptions } from './request';
import { verifyToken } from './verify';

type InterstitialRuleResult = RequestState | undefined;
type InterstitialRule = <T extends AuthenticateRequestOptions>(
  opts: T,
) => Promise<InterstitialRuleResult> | InterstitialRuleResult;

const shouldRedirectToSatelliteUrl = (qp?: URLSearchParams) => !!qp?.get('__clerk_satellite_url');
const hasJustSynced = (qp?: URLSearchParams) => qp?.get('__clerk_synced') === 'true';
/**
 * @deprecated This will be removed in the next minor version
 */
const isReturningFromPrimary = (qp?: URLSearchParams) => qp?.get('__clerk_referrer_primary') === 'true';

const VALID_USER_AGENTS = /^Mozilla\/|(Amazon CloudFront)/;

const isBrowser = (userAgent: string | undefined) => VALID_USER_AGENTS.test(userAgent || '');

// In development or staging environments only, based on the request's
// User Agent, detect non-browser requests (e.g. scripts). Since there
// is no Authorization header, consider the user as signed out and
// prevent interstitial rendering
// In production, script requests will be missing both uat and session cookies, which will be
// automatically treated as signed out. This exception is needed for development, because the any // missing uat throws an interstitial in development.
export const nonBrowserRequestInDevRule: InterstitialRule = options => {
  const { apiKey, secretKey, userAgent } = options;
  const key = secretKey || apiKey || '';
  if (isDevelopmentFromApiKey(key) && !isBrowser(userAgent)) {
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
  const { apiKey, secretKey, isSatellite, searchParams } = options;
  const key = secretKey || apiKey || '';
  const isDev = isDevelopmentFromApiKey(key);

  if (isDev && !isSatellite && shouldRedirectToSatelliteUrl(searchParams)) {
    return interstitial(options, AuthErrorReason.PrimaryRespondsToSyncing);
  }
  return undefined;
};

export const potentialFirstLoadInDevWhenUATMissing: InterstitialRule = options => {
  const { apiKey, secretKey, clientUat } = options;
  const key = secretKey || apiKey || '';
  const res = isDevelopmentFromApiKey(key);
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
  const { apiKey, secretKey, referrer, host, forwardedHost, forwardedProto } = options;
  const crossOriginReferrer =
    referrer && checkCrossOrigin({ originURL: new URL(referrer), host, forwardedHost, forwardedProto });
  const key = secretKey || apiKey || '';

  if (isDevelopmentFromApiKey(key) && crossOriginReferrer) {
    return interstitial(options, AuthErrorReason.CrossOriginReferrer);
  }
  return undefined;
};

/**
 * @deprecated This will be removed in the next minor version
 */
export const satelliteInDevReturningFromPrimary: InterstitialRule = options => {
  const { apiKey, secretKey, isSatellite, searchParams } = options;

  const key = secretKey || apiKey || '';

  if (isSatellite && isReturningFromPrimary(searchParams) && isDevelopmentFromApiKey(key)) {
    return interstitial(options, AuthErrorReason.SatelliteReturnsFromPrimary);
  }
  return undefined;
};

export const potentialFirstRequestOnProductionEnvironment: InterstitialRule = options => {
  const { apiKey, secretKey, clientUat, cookieToken } = options;
  const key = secretKey || apiKey || '';

  if (isProductionFromApiKey(key) && !clientUat && !cookieToken) {
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
  const { headerToken } = options as any;
  const sessionClaims = await verifyRequestState(options, headerToken);
  return await signedIn(options, sessionClaims);
};

export const hasValidCookieToken: InterstitialRule = async options => {
  const { cookieToken, clientUat } = options as any;
  const sessionClaims = await verifyRequestState(options, cookieToken);
  const state = await signedIn(options, sessionClaims);

  const jwt = state.toAuth().sessionClaims;
  const cookieTokenIsOutdated = jwt.iat < Number.parseInt(clientUat);

  if (!clientUat || cookieTokenIsOutdated) {
    return interstitial(options, AuthErrorReason.CookieOutDated);
  }

  return state;
};

export async function runInterstitialRules<T extends AuthenticateRequestOptions>(
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

async function verifyRequestState(options: AuthenticateRequestOptions, token: string) {
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
