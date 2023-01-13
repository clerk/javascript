import { isDevelopmentFromApiKey, isProductionFromApiKey } from '../util/instance';
import { checkCrossOrigin } from '../util/request';
import { type RequestState, AuthErrorReason, interstitial, signedOut } from './authStatus';

export type InterstitialRule = <T>(opts: T) => RequestState | undefined;

// In development or staging environments only, based on the request's
// User Agent, detect non-browser requests (e.g. scripts). Since there
// is no Authorization header, consider the user as signed out and
// prevent interstitial rendering
// In production, script requests will be missing both uat and session cookies, which will be
// automatically treated as signed out. This exception is needed for development, because the any // missing uat throws an interstitial in development.
export const nonBrowserRequestInDevRule: InterstitialRule = options => {
  const { apiKey, secretKey, userAgent } = options as any;
  const key = secretKey || apiKey;
  if (isDevelopmentFromApiKey(key) && !userAgent?.startsWith('Mozilla/')) {
    return signedOut(options, AuthErrorReason.HeaderMissingNonBrowser);
  }
  return undefined;
};

export const crossOriginRequestWithoutHeader: InterstitialRule = options => {
  const { origin, host, forwardedHost, forwardedPort, forwardedProto } = options as any;
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
    return signedOut(options, AuthErrorReason.HeaderMissingCORS);
  }
  return undefined;
};

export const potentialFirstLoadInDevWhenUATMissing: InterstitialRule = options => {
  const { apiKey, secretKey, clientUat } = options as any;
  const key = secretKey || apiKey;
  const res = isDevelopmentFromApiKey(key);
  if (res && !clientUat) {
    return interstitial(options, AuthErrorReason.CookieUATMissing);
  }
  return undefined;
};

export const potentialRequestAfterSignInOrOurFromClerkHostedUiInDev: InterstitialRule = options => {
  const { apiKey, secretKey, referrer, host, forwardedHost, forwardedPort, forwardedProto } = options as any;
  const crossOriginReferrer =
    referrer && checkCrossOrigin({ originURL: new URL(referrer), host, forwardedHost, forwardedPort, forwardedProto });
  const key = secretKey || apiKey;

  if (isDevelopmentFromApiKey(key) && crossOriginReferrer) {
    return interstitial(options, AuthErrorReason.CrossOriginReferrer);
  }
  return undefined;
};

export const potentialFirstRequestOnProductionEnvironment: InterstitialRule = options => {
  const { apiKey, secretKey, clientUat, cookieToken } = options as any;
  const key = secretKey || apiKey;

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
  const { clientUat } = options as any;
  if (clientUat === '0') {
    return signedOut(options, AuthErrorReason.StandardSignedOut);
  }
  return undefined;
};

// This happens when a signed in user visits a new subdomain for the first time. The uat will be available because it's set on naked domain, but session will be missing. It can also happen if the cookieToken is manually removed during development.
export const hasClientUatButCookieIsMissingInProd: InterstitialRule = options => {
  const { clientUat, cookieToken } = options as any;
  if (clientUat && !cookieToken) {
    return interstitial(options, AuthErrorReason.CookieMissing);
  }
  return undefined;
};
