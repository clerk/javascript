import { isDevelopmentFromApiKey, isProductionFromApiKey } from '../util/instance';
import { checkCrossOrigin } from '../util/request';
import type { RequestState } from './authStatus';
import { AuthErrorReason, interstitial, signedIn, signedOut } from './authStatus';
import type { AuthenticateRequestOptionsWithExperimental } from './request';
import { verifyToken } from './verify';

export type InterstitialRule = <T>(opts: T) => Promise<RequestState | undefined>;

// In development or staging environments only, based on the request's
// User Agent, detect non-browser requests (e.g. scripts). Since there
// is no Authorization header, consider the user as signed out and
// prevent interstitial rendering
// In production, script requests will be missing both uat and session cookies, which will be
// automatically treated as signed out. This exception is needed for development, because the any // missing uat throws an interstitial in development.
export const nonBrowserRequestInDevRule: InterstitialRule = async options => {
  const { apiKey, secretKey, userAgent } = options as any;
  const key = secretKey || apiKey;
  if (isDevelopmentFromApiKey(key) && !userAgent?.startsWith('Mozilla/')) {
    return signedOut(options, AuthErrorReason.HeaderMissingNonBrowser);
  }
  return undefined;
};

export const crossOriginRequestWithoutHeader: InterstitialRule = async options => {
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

export const potentialFirstLoadInDevWhenUATMissing: InterstitialRule = async options => {
  const { apiKey, secretKey, clientUat } = options as any;
  const key = secretKey || apiKey;
  const res = isDevelopmentFromApiKey(key);
  if (res && !clientUat) {
    return interstitial(options, AuthErrorReason.CookieUATMissing);
  }
  return undefined;
};

export const potentialRequestAfterSignInOrOurFromClerkHostedUiInDev: InterstitialRule = async options => {
  const { apiKey, secretKey, referrer, host, forwardedHost, forwardedPort, forwardedProto } = options as any;
  const crossOriginReferrer =
    referrer && checkCrossOrigin({ originURL: new URL(referrer), host, forwardedHost, forwardedPort, forwardedProto });
  const key = secretKey || apiKey;

  if (isDevelopmentFromApiKey(key) && crossOriginReferrer) {
    return interstitial(options, AuthErrorReason.CrossOriginReferrer);
  }
  return undefined;
};

export const potentialFirstRequestOnProductionEnvironment: InterstitialRule = async options => {
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
export const isNormalSignedOutState: InterstitialRule = async options => {
  const { clientUat } = options as any;
  if (clientUat === '0') {
    return signedOut(options, AuthErrorReason.StandardSignedOut);
  }
  return undefined;
};

// This happens when a signed in user visits a new subdomain for the first time. The uat will be available because it's set on naked domain, but session will be missing. It can also happen if the cookieToken is manually removed during development.
export const hasPositiveClientUatButCookieIsMissing: InterstitialRule = async options => {
  const { clientUat, cookieToken } = options as any;

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

export async function runInterstitialRules<T>(opts: T, rules: InterstitialRule[]): Promise<RequestState> {
  for (const rule of rules) {
    const res = await rule(opts);
    if (res) {
      return res;
    }
  }

  return signedOut<T>(opts, AuthErrorReason.UnexpectedError);
}

async function verifyRequestState(options: any, token: string) {
  // TODO: we have an issue with issuer if proxied primary & regular satellite
  const issuer = (iss: string) =>
    iss.startsWith('https://clerk.') || iss.includes('.clerk.accounts') || iss === 'https://primary.dev/api/__clerk';

  return verifyToken(token, {
    ...options,
    issuer: options?.proxyUrl || issuer,
  });
}

export const isSatelliteAndMissingUat: InterstitialRule = async options => {
  const { clientUat, isSatellite, isSynced = false } = options as AuthenticateRequestOptionsWithExperimental;

  if (isSatellite && (!clientUat || clientUat === '0') && !isSynced) {
    return interstitial(options, AuthErrorReason.CookieUATMissing);
  }

  return undefined;
};
