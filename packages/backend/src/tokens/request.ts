import { isPublishableKey, parsePublishableKey } from '@clerk/shared/keys';
import type { JwtPayload } from '@clerk/types';

import { constants } from '../constants';
import { assertValidSecretKey } from '../util/assertValidSecretKey';
import { buildRequest, stripAuthorizationHeader } from '../util/IsomorphicRequest';
import { isDevelopmentFromSecretKey } from '../util/shared';
import type { AuthStatusOptionsType, RequestState } from './authStatus';
import { AuthErrorReason, handshake, signedIn, signedOut } from './authStatus';
import type { TokenCarrier } from './errors';
import { TokenVerificationError, TokenVerificationErrorReason } from './errors';
import { verifyHandshakeToken } from './handshake';
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
  publishableKey?: string;
  domain?: string;
  proxyUrl?: string;
}) {
  if (!publishableKey || !isPublishableKey(publishableKey)) {
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

    const handshakePayload = await verifyHandshakeToken(handshakeToken, authenticateContext);
    const cookiesToSet = handshakePayload.handshake;

    let sessionToken = '';
    cookiesToSet.forEach((x: string) => {
      headers.append('Set-Cookie', x);
      if (x.startsWith('__session=')) {
        sessionToken = x.split(';')[0].substring(10);
      }
    });

    if (instanceType === 'development') {
      const newUrl = new URL(authenticateContext.derivedRequestUrl);
      newUrl.searchParams.delete('__clerk_handshake');
      newUrl.searchParams.delete('__clerk_help');
      headers.append('Location', newUrl.toString());
    }

    if (sessionToken === '') {
      return signedOut(authenticateContext, AuthErrorReason.SessionTokenMissing, '', headers);
    }

    let verifyResult: JwtPayload;

    try {
      verifyResult = await verifyToken(sessionToken, authenticateContext);
    } catch (err) {
      if (err instanceof TokenVerificationError) {
        err.tokenCarrier = 'cookie';
        if (
          instanceType === 'development' &&
          (err.reason === TokenVerificationErrorReason.TokenExpired ||
            err.reason === TokenVerificationErrorReason.TokenNotActiveYet)
        ) {
          // This probably means we're dealing with clock skew
          console.error(
            `Clerk: Clock skew detected. This usually means that your system clock is inaccurate. Clerk will attempt to account for the clock skew in development.

To resolve this issue, make sure your system's clock is set to the correct time (e.g. turn off and on automatic time synchronization).

---

${err.getFullMessage()}`,
          );

          // Retry with a generous clock skew allowance (1 day)
          verifyResult = await verifyToken(sessionToken, { ...authenticateContext, clockSkewInMs: 86_400_000 });
        }
      } else {
        throw err;
      }
    }

    return signedIn(authenticateContext, verifyResult!, headers);
  }

  const pk = parsePublishableKeyWithOptions({
    publishableKey: options.publishableKey,
    proxyUrl: options.proxyUrl,
    domain: options.domain,
  });

  const instanceType = pk.instanceType;

  async function authenticateRequestWithTokenInHeader() {
    try {
      const verifyResult = await verifyToken(authenticateContext.sessionTokenInHeader!, authenticateContext);
      return await signedIn(options, verifyResult);
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

    if (
      instanceType === 'production' &&
      authenticateContext.isSatellite &&
      authenticateContext.secFetchDest === 'document' &&
      !authenticateContext.derivedRequestUrl.searchParams.has('__clerk_synced')
    ) {
      const headers = buildRedirectToHandshake();
      return handshake(authenticateContext, AuthErrorReason.SatelliteCookieNeedsSyncing, '', headers);
    }

    if (
      instanceType === 'development' &&
      authenticateContext.isSatellite &&
      authenticateContext.secFetchDest === 'document' &&
      !authenticateContext.derivedRequestUrl.searchParams.has('__clerk_synced')
    ) {
      // initiate MD sync

      // signInUrl exists, checked at the top of `authenticateRequest`
      const redirectURL = new URL(authenticateContext.signInUrl!);
      redirectURL.searchParams.append('__clerk_redirect_url', authenticateContext.derivedRequestUrl.toString());

      const headers = new Headers({ location: redirectURL.toString() });
      return handshake(authenticateContext, AuthErrorReason.SatelliteCookieNeedsSyncing, '', headers);
    }

    const redirectUrl = new URL(authenticateContext.derivedRequestUrl).searchParams.get('__clerk_redirect_url');
    if (instanceType === 'development' && !authenticateContext.isSatellite && redirectUrl) {
      // Dev MD sync from primary, redirect back to satellite w/ __clerk_db_jwt
      const redirectBackToSatelliteUrl = new URL(redirectUrl);

      if (devBrowserToken) {
        redirectBackToSatelliteUrl.searchParams.append('__clerk_db_jwt', devBrowserToken);
      }
      redirectBackToSatelliteUrl.searchParams.append('__clerk_synced', 'true');

      const headers = new Headers({ location: redirectBackToSatelliteUrl.toString() });
      return handshake(authenticateContext, AuthErrorReason.PrimaryRespondsToSyncing, '', headers);
    }

    if (instanceType === 'development' && !hasActiveClient && !hasSessionToken) {
      return signedOut(authenticateContext, AuthErrorReason.CookieAndUATMissing);
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
      return handleError(err, 'cookie');
    }

    return signedOut(authenticateContext, AuthErrorReason.UnexpectedError);
  }

  function handleError(err: unknown, tokenCarrier: TokenCarrier) {
    if (err instanceof TokenVerificationError) {
      err.tokenCarrier = tokenCarrier;

      const reasonToHandshake = [
        TokenVerificationErrorReason.TokenExpired,
        TokenVerificationErrorReason.TokenNotActiveYet,
      ].includes(err.reason);

      if (reasonToHandshake) {
        const headers = buildRedirectToHandshake();
        return handshake(authenticateContext, AuthErrorReason.SessionTokenOutdated, err.getFullMessage(), headers);
      }
      return signedOut(authenticateContext, err.reason, err.getFullMessage());
    }

    return signedOut(authenticateContext, AuthErrorReason.UnexpectedError);
  }

  if (authenticateContext.sessionTokenInHeader) {
    return authenticateRequestWithTokenInHeader();
  }
  return authenticateRequestWithTokenInCookie();
}

export const debugRequestState = (params: RequestState) => {
  const { isSignedIn, proxyUrl, reason, message, publishableKey, isSatellite, domain } = params;
  return { isSignedIn, proxyUrl, reason, message, publishableKey, isSatellite, domain };
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
    secFetchDest: headers(constants.Headers.SecFetchDest),
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
