import { isPublishableKey, parsePublishableKey } from '@clerk/shared/keys';

import { constants } from '../constants';
import { assertValidSecretKey } from '../util/assertValidSecretKey';
import { buildRequest, stripAuthorizationHeader } from '../util/IsomorphicRequest';
import { isDevelopmentFromSecretKey } from '../util/shared';
import type { AuthStatusOptionsType, RequestState } from './authStatus';
import { AuthErrorReason, handshake, interstitial, signedIn, signedOut, unknownState } from './authStatus';
import type { TokenCarrier } from './errors';
import { TokenVerificationError, TokenVerificationErrorReason } from './errors';
// TODO: Rename this crap, it's not interstitial anymore.
import { hasValidHeaderToken, runInterstitialRules } from './interstitialRule';
import { decodeJwt } from './jwt';
import { verifyToken, type VerifyTokenOptions } from './verify';
export type OptionalVerifyTokenOptions = Partial<
  Pick<
    VerifyTokenOptions,
    'audience' | 'authorizedParties' | 'clockSkewInMs' | 'jwksCacheTtlInMs' | 'skipJwksCache' | 'jwtKey'
  >
>;

export type AuthenticateRequestOptions = AuthStatusOptionsType & OptionalVerifyTokenOptions & { request: Request };

function assertSignInUrlExists(signInUrl: string | undefined, key: string): asserts signInUrl is string {
  if (!signInUrl && isDevelopmentFromSecretKey(key)) {
    throw new Error(`Missing signInUrl. Pass a signInUrl for dev instances if an app is satellite`);
  }
}

function assertProxyUrlOrDomain(proxyUrlOrDomain: string | undefined) {
  if (!proxyUrlOrDomain) {
    throw new Error(`Missing domain and proxyUrl. A satellite application needs to specify a domain or a proxyUrl`);
  }
}

function assertSignInUrlFormatAndOrigin(_signInUrl: string, origin: string) {
  let signInUrl: URL;
  try {
    signInUrl = new URL(_signInUrl);
  } catch {
    throw new Error(`The signInUrl needs to have a absolute url format.`);
  }

  if (signInUrl.origin === origin) {
    throw new Error(`The signInUrl needs to be on a different origin than your satellite application.`);
  }
}

/**
 * Parse the provided publishable key, but adjust the returned frontendApi based on the provided domain and proxyUrl.
 */
export function parsePublishableKeyWithOptions({
  publishableKey,
  domain,
  proxyUrl,
}: {
  publishableKey: string;
  domain?: string;
  proxyUrl?: string;
}) {
  if (!isPublishableKey(publishableKey)) {
    throw new Error('Publishable key not valid.');
  }

  const { frontendApi: frontendApiFromPK, instanceType } = parsePublishableKey(publishableKey)!;

  let frontendApi = frontendApiFromPK;
  if (proxyUrl) {
    frontendApi = proxyUrl;
  } else if (instanceType !== 'development' && domain) {
    frontendApi = `https://clerk.${domain}`;
  } else {
    frontendApi = `https://${frontendApi}`;
  }

  return {
    frontendApi,
    instanceType,
  };
}

export async function authenticateRequest(options: AuthenticateRequestOptions): Promise<RequestState> {
  const { cookies, headers, searchParams, derivedRequestUrl } = buildRequest(options.request);

  const authenticateContext = {
    ...options,
    ...loadOptionsFromHeaders(headers),
    ...loadOptionsFromCookies(cookies),
    searchParams,
    derivedRequestUrl,
  };

  const devBrowserToken = searchParams?.get('__clerk_db_jwt') || cookies('__clerk_db_jwt') || '';
  const handshakeToken = searchParams?.get('__clerk_handshake') || cookies('__clerk_handshake') || '';

  assertValidSecretKey(authenticateContext.secretKey);

  if (authenticateContext.isSatellite) {
    assertSignInUrlExists(authenticateContext.signInUrl, authenticateContext.secretKey);
    if (authenticateContext.signInUrl && authenticateContext.origin) {
      assertSignInUrlFormatAndOrigin(authenticateContext.signInUrl, authenticateContext.origin);
    }
    assertProxyUrlOrDomain(authenticateContext.proxyUrl || authenticateContext.domain);
  }

  function buildRedirectToHandshake() {
    const redirectUrl = new URL(derivedRequestUrl);
    redirectUrl.searchParams.delete('__clerk_db_jwt');
    const frontendApiNoProtocol = pk.frontendApi.replace(/http(s)?:\/\//, '');

    const url = new URL(`https://${frontendApiNoProtocol}/v1/client/handshake`);
    url.searchParams.append('redirect_url', redirectUrl?.href || '');

    if (pk?.instanceType === 'development' && devBrowserToken) {
      url.searchParams.append('__clerk_db_jwt', devBrowserToken);
    }

    return new Headers({ location: url.href });
  }

  async function resolveHandshake() {
    const headers = new Headers({
      'Access-Control-Allow-Origin': 'null',
      'Access-Control-Allow-Credentials': 'true',
    });

    const cookiesToSet = JSON.parse(atob(handshakeToken)) as string[];

    let sessionToken = '';
    cookiesToSet.forEach((x: string) => {
      headers.append('Set-Cookie', x);
      if (x.startsWith('__session=')) {
        sessionToken = x.split(';')[0].substring(10);
      }
    });

    // Right after a handshake is a good time to detect the skew
    // const detectedSkew
    if (instanceType === 'development') {
      const newUrl = new URL(authenticateContext.derivedRequestUrl);
      newUrl.searchParams.delete('__clerk_handshake');
      newUrl.searchParams.delete('__clerk_help');
      headers.append('Location', newUrl.toString());
    }

    if (sessionToken === '') {
      return signedOut(authenticateContext, AuthErrorReason.SessionTokenMissing, '', headers);
    }

    // Uncaught
    const verifyResult = await verifyToken(sessionToken, authenticateContext);

    return signedIn(authenticateContext, verifyResult, headers);
  }

  const pk = parsePublishableKeyWithOptions({
    publishableKey: options.publishableKey,
    proxyUrl: options.proxyUrl,
    domain: options.domain,
  });

  const instanceType = pk.instanceType;

  async function authenticateRequestWithTokenInHeader() {
    try {
      const state = await runInterstitialRules(authenticateContext, [hasValidHeaderToken]);
      return state;
    } catch (err) {
      return handleError(err, 'header');
    }
  }

  async function authenticateRequestWithTokenInCookie() {
    const clientUat = parseInt(authenticateContext.clientUat || '', 10) || 0;
    const hasActiveClient = clientUat > 0;
    // TODO rename this to sessionToken
    const sessionToken = authenticateContext.sessionTokenInCookie;
    const hasSessionToken = !!sessionToken;

    /**
     * If we have a handshakeToken, resolve the handshake and attempt to return a definitive signed in or signed out state.
     */
    if (handshakeToken) {
      return resolveHandshake();
    }

    /**
     * Otherwise, check for "known unknown" auth states that we can resolve with a handshake.
     */
    if (instanceType === 'development' && authenticateContext.derivedRequestUrl.searchParams.has('__clerk_db_jwt')) {
      const headers = buildRedirectToHandshake();
      return handshake(authenticateContext, AuthErrorReason.DevBrowserSync, '', headers);
    }

    if (authenticateContext.isSatellite && !authenticateContext.derivedRequestUrl.searchParams.has('__clerk_synced')) {
      const headers = buildRedirectToHandshake();
      return handshake(authenticateContext, AuthErrorReason.SatelliteCookieNeedsSyncing, '', headers);
    }

    if (!hasActiveClient && !hasSessionToken) {
      return signedOut(authenticateContext, AuthErrorReason.CookieAndUATMissing);
    }

    // This can eagerly run handshake since client_uat is SameSite=Strict in dev
    if (!hasActiveClient && hasSessionToken) {
      const headers = buildRedirectToHandshake();
      return handshake(authenticateContext, AuthErrorReason.SessionTokenWithoutClientUAT, '', headers);
    }

    if (hasActiveClient && !hasSessionToken) {
      const headers = buildRedirectToHandshake();
      return handshake(authenticateContext, AuthErrorReason.ClientUATWithoutSessionToken, '', headers);
    }

    const decodeResult = decodeJwt(sessionToken!);

    if (decodeResult.payload.iat < clientUat) {
      const headers = buildRedirectToHandshake();
      return handshake(authenticateContext, AuthErrorReason.SessionTokenOutdated, '', headers);
    }

    try {
      const verifyResult = await verifyToken(sessionToken!, authenticateContext);
      if (verifyResult) {
        return signedIn(authenticateContext, verifyResult);
      }
    } catch (err) {
      if (err instanceof TokenVerificationError) {
        err.tokenCarrier === 'cookie';

        const reasonToHandshake = [
          TokenVerificationErrorReason.TokenExpired,
          TokenVerificationErrorReason.TokenNotActiveYet,
        ].includes(err.reason);

        if (reasonToHandshake) {
          const headers = buildRedirectToHandshake();
          return handshake(authenticateContext, AuthErrorReason.SessionTokenOutdated, '', headers);
        }
        return signedOut(authenticateContext, err.reason, err.getFullMessage());
      }

      return signedOut(authenticateContext, AuthErrorReason.UnexpectedError);
    }

    return signedOut(authenticateContext, AuthErrorReason.UnexpectedError);
  }

  function handleError(err: unknown, tokenCarrier: TokenCarrier) {
    if (err instanceof TokenVerificationError) {
      err.tokenCarrier = tokenCarrier;

      const reasonToReturnInterstitial = [
        TokenVerificationErrorReason.TokenExpired,
        TokenVerificationErrorReason.TokenNotActiveYet,
      ].includes(err.reason);

      if (reasonToReturnInterstitial) {
        if (tokenCarrier === 'header') {
          return unknownState(authenticateContext, err.reason, err.getFullMessage());
        }
        return interstitial(authenticateContext, err.reason, err.getFullMessage());
      }
      return signedOut(authenticateContext, err.reason, err.getFullMessage());
    }
    return signedOut(authenticateContext, AuthErrorReason.UnexpectedError, (err as Error).message);
  }

  if (authenticateContext.sessionTokenInHeader) {
    return authenticateRequestWithTokenInHeader();
  }
  return authenticateRequestWithTokenInCookie();
}

export const debugRequestState = (params: RequestState) => {
  const { isSignedIn, proxyUrl, isInterstitial, reason, message, publishableKey, isSatellite, domain } = params;
  return { isSignedIn, proxyUrl, isInterstitial, reason, message, publishableKey, isSatellite, domain };
};

export type DebugRequestSate = ReturnType<typeof debugRequestState>;

/**
 * Load authenticate request options related to headers.
 */
export const loadOptionsFromHeaders = (headers: ReturnType<typeof buildRequest>['headers']) => {
  if (!headers) {
    return {};
  }

  return {
    sessionTokenInHeader: stripAuthorizationHeader(headers(constants.Headers.Authorization)),
    origin: headers(constants.Headers.Origin),
    host: headers(constants.Headers.Host),
    forwardedHost: headers(constants.Headers.ForwardedHost),
    forwardedProto: headers(constants.Headers.CloudFrontForwardedProto) || headers(constants.Headers.ForwardedProto),
    referrer: headers(constants.Headers.Referrer),
    userAgent: headers(constants.Headers.UserAgent),
  };
};

/**
 * Load authenticate request options related to cookies.
 */
export const loadOptionsFromCookies = (cookies: ReturnType<typeof buildRequest>['cookies']) => {
  if (!cookies) {
    return {};
  }

  return {
    sessionTokenInCookie: cookies?.(constants.Cookies.Session),
    clientUat: cookies?.(constants.Cookies.ClientUat),
  };
};
