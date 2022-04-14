import { AuthErrorReason, AuthStateParams, AuthStatus } from '../types';
import { isDevelopmentOrStaging, isProduction } from './clerkApiKey';
import { checkCrossOrigin } from './request';

type RuleResult = { status: AuthStatus; errorReason: AuthErrorReason };
type InterstitialRule = (params: AuthStateParams, key: string) => RuleResult | undefined;
type RunRules = (params: AuthStateParams, key: string, rules: InterstitialRule[]) => RuleResult | undefined;

export const runInterstitialRules: RunRules = (params, key, rules) => {
  for (const rule of rules) {
    const res = rule(params, key);
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
export const nonBrowserRequestInDevRule: InterstitialRule = (params, key) => {
  if (isDevelopmentOrStaging(key) && !params.userAgent?.startsWith('Mozilla/')) {
    return { status: AuthStatus.SignedOut, errorReason: AuthErrorReason.HeaderMissingNonBrowser };
  }
  return undefined;
};

// Is this correct? In cross-origin requests the use of Authorization header is mandatory
export const crossOriginRequestWithoutCors: InterstitialRule = params => {
  const { origin, host, forwardedHost, forwardedPort, forwardedProto } = params;
  const isCrossOrigin =
    origin && checkCrossOrigin({ originURL: new URL(origin), host, forwardedHost, forwardedPort, forwardedProto });
  if (isCrossOrigin) {
    return { status: AuthStatus.SignedOut, errorReason: AuthErrorReason.HeaderMissingCORS };
  }
  return undefined;
};

export const potentialFirstLoadInDevWhenUATMissing: InterstitialRule = (params, key) => {
  const res = isDevelopmentOrStaging(key);
  if (res && !params.clientUat) {
    return { status: AuthStatus.Interstitial, errorReason: AuthErrorReason.UATMissing };
  }
  return undefined;
};

export const potentialRequestAfterSignInOrOurFromClerkHostedUiInDev: InterstitialRule = (params, key) => {
  const { referrer, host, forwardedHost, forwardedPort, forwardedProto } = params;
  const crossOriginReferrer =
    referrer && checkCrossOrigin({ originURL: new URL(referrer), host, forwardedHost, forwardedPort, forwardedProto });
  if (isDevelopmentOrStaging(key) && crossOriginReferrer) {
    return { status: AuthStatus.Interstitial, errorReason: AuthErrorReason.CrossOriginReferrer };
  }
  return undefined;
};

export const potentialFirstRequestOnProductionEnvironment: InterstitialRule = (params, key) => {
  if (isProduction(key) && !params.clientUat && !params.cookieToken) {
    return { status: AuthStatus.SignedOut, errorReason: AuthErrorReason.CookieAndUATMissing };
  }
  return undefined;
};

// TBD: Can enable if we do not want the __session cookie to be inspected.
// const signedOutOnDifferentSubdomainButCookieNotRemovedYet: AuthStateRule = (params, key) => {
//   if (isProduction(key) && !params.clientUat && !params.cookieToken) {
//     return { status: AuthStatus.Interstitial, errorReason: '' as any };
//   }
// };

export const isNormalSignedOutState: InterstitialRule = params => {
  if (params.clientUat === '0') {
    return { status: AuthStatus.SignedOut, errorReason: AuthErrorReason.StandardOut };
  }
  return undefined;
};

export const hasClientUatButCookieIsMissingInProd: InterstitialRule = (params, key) => {
  if (isProduction(key) && params.clientUat && !params.cookieToken) {
    return { status: AuthStatus.Interstitial, errorReason: AuthErrorReason.CookieMissing };
  }
  return undefined;
};
