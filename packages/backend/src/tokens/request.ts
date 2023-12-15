import { parsePublishableKey } from '@clerk/shared/keys';

import { constants } from '../constants';
import type { TokenCarrier } from '../errors';
import { TokenVerificationError, TokenVerificationErrorReason } from '../errors';
import { decodeJwt } from '../jwt';
import { assertValidSecretKey } from '../util/assertValidSecretKey';
import { buildRequest, stripAuthorizationHeader } from '../util/IsomorphicRequest';
import { isDevelopmentFromSecretKey } from '../util/shared';
import type { AuthStatusOptionsType, RequestState } from './authStatus';
import { AuthErrorReason, handshake, signedIn, signedOut } from './authStatus';
import { verifyHandshakeToken } from './handshake';
import { verifyToken, type VerifyTokenOptions } from './verify';

/**
 * @internal
 */
export type OptionalVerifyTokenOptions = Partial<
  Pick<
    VerifyTokenOptions,
    'audience' | 'authorizedParties' | 'clockSkewInMs' | 'jwksCacheTtlInMs' | 'skipJwksCache' | 'jwtKey'
  >
>;

/**
 * @internal
 */
export type AuthenticateRequestOptions = AuthStatusOptionsType & OptionalVerifyTokenOptions;

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
 * Currently, a request is only eligible for a handshake if we can say it's *probably* a request for a document, not a fetch or some other exotic request.
 * This heuristic should give us a reliable enough signal for browsers that support `Sec-Fetch-Dest` and for those that don't.
 */
function isRequestEligibleForHandshake(authenticateContext: { secFetchDest?: string; accept?: string }) {
  const { accept, secFetchDest } = authenticateContext;

  // NOTE: we could also check sec-fetch-mode === navigate here, but according to the spec, sec-fetch-dest: document should indicate that the request is the data of a user navigation.
  if (secFetchDest === 'document') {
    return true;
  }

  if (!secFetchDest && accept?.startsWith('text/html')) {
    return true;
  }

  return false;
}

export async function authenticateRequest(
  request: Request,
  options: AuthenticateRequestOptions,
): Promise<RequestState> {
  const { cookies, headers, searchParams, derivedRequestUrl } = buildRequest(request);

  const authenticateContext = {
    ...options,
    ...loadOptionsFromHeaders(headers),
    ...loadOptionsFromCookies(cookies),
    searchParams,
    derivedRequestUrl,
  };

  const devBrowserToken =
    searchParams?.get(constants.Cookies.DevBrowser) || cookies(constants.Cookies.DevBrowser) || '';
  const handshakeToken = searchParams?.get(constants.Cookies.Handshake) || cookies(constants.Cookies.Handshake) || '';

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
    const { derivedRequestUrl } = authenticateContext;

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
      const newUrl = new URL(derivedRequestUrl);
      newUrl.searchParams.delete('__clerk_handshake');
      newUrl.searchParams.delete('__clerk_help');
      headers.append('Location', newUrl.toString());
    }

    if (sessionToken === '') {
      return signedOut(authenticateContext, AuthErrorReason.SessionTokenMissing, '', headers);
    }

    const { data, error } = await verifyToken(sessionToken, authenticateContext);
    if (data) {
      return signedIn(authenticateContext, data, headers);
    }

    if (
      instanceType === 'development' &&
      (error.reason === TokenVerificationErrorReason.TokenExpired ||
        error.reason === TokenVerificationErrorReason.TokenNotActiveYet)
    ) {
      error.tokenCarrier = 'cookie';
      // This probably means we're dealing with clock skew
      console.error(
        `Clerk: Clock skew detected. This usually means that your system clock is inaccurate. Clerk will attempt to account for the clock skew in development.

To resolve this issue, make sure your system's clock is set to the correct time (e.g. turn off and on automatic time synchronization).

---

${error.getFullMessage()}`,
      );

      // Retry with a generous clock skew allowance (1 day)
      const { data: retryResult, error: retryError } = await verifyToken(sessionToken, {
        ...authenticateContext,
        clockSkewInMs: 86_400_000,
      });
      if (retryResult) {
        return signedIn(authenticateContext, retryResult, headers);
      }

      throw retryError;
    }

    throw error;
  }

  function handleMaybeHandshakeStatus(
    context: typeof authenticateContext,
    reason: AuthErrorReason,
    message: string,
    headers?: Headers,
  ) {
    if (isRequestEligibleForHandshake(context)) {
      // Right now the only usage of passing in different headers is for multi-domain sync, which redirects somewhere else.
      // In the future if we want to decorate the handshake redirect with additional headers per call we need to tweak this logic.
      return handshake(context, reason, message, headers ?? buildRedirectToHandshake());
    }
    return signedOut(context, reason, message, new Headers());
  }

  const pk = parsePublishableKey(options.publishableKey, {
    fatal: true,
    proxyUrl: options.proxyUrl,
    domain: options.domain,
  });

  const instanceType = pk.instanceType;

  async function authenticateRequestWithTokenInHeader() {
    const { sessionTokenInHeader } = authenticateContext;

    try {
      const { data, error } = await verifyToken(sessionTokenInHeader!, authenticateContext);
      if (error) {
        throw error;
      }
      // use `await` to force this try/catch handle the signedIn invocation
      return await signedIn(options, data);
    } catch (err) {
      return handleError(err, 'header');
    }
  }

  async function authenticateRequestWithTokenInCookie() {
    const {
      derivedRequestUrl,
      isSatellite,
      secFetchDest,
      signInUrl,
      clientUat: clientUatRaw,
      sessionTokenInCookie: sessionToken,
    } = authenticateContext;

    const clientUat = parseInt(clientUatRaw || '', 10) || 0;
    const hasActiveClient = clientUat > 0;
    const hasSessionToken = !!sessionToken;

    const isRequestEligibleForMultiDomainSync =
      isSatellite &&
      secFetchDest === 'document' &&
      !derivedRequestUrl.searchParams.has(constants.QueryParameters.ClerkSynced);

    /**
     * If we have a handshakeToken, resolve the handshake and attempt to return a definitive signed in or signed out state.
     */
    if (handshakeToken) {
      return resolveHandshake();
    }

    /**
     * Otherwise, check for "known unknown" auth states that we can resolve with a handshake.
     */
    if (instanceType === 'development' && derivedRequestUrl.searchParams.has(constants.Cookies.DevBrowser)) {
      return handleMaybeHandshakeStatus(authenticateContext, AuthErrorReason.DevBrowserSync, '');
    }

    /**
     * Begin multi-domain sync flows
     */
    if (instanceType === 'production' && isRequestEligibleForMultiDomainSync) {
      return handleMaybeHandshakeStatus(authenticateContext, AuthErrorReason.SatelliteCookieNeedsSyncing, '');
    }

    // Multi-domain development sync flow
    if (instanceType === 'development' && isRequestEligibleForMultiDomainSync) {
      // initiate MD sync

      // signInUrl exists, checked at the top of `authenticateRequest`
      const redirectURL = new URL(signInUrl!);
      redirectURL.searchParams.append(constants.QueryParameters.ClerkRedirectUrl, derivedRequestUrl.toString());

      const headers = new Headers({ location: redirectURL.toString() });
      return handleMaybeHandshakeStatus(authenticateContext, AuthErrorReason.SatelliteCookieNeedsSyncing, '', headers);
    }

    // Multi-domain development sync flow
    const redirectUrl = new URL(derivedRequestUrl).searchParams.get(constants.QueryParameters.ClerkRedirectUrl);
    if (instanceType === 'development' && !isSatellite && redirectUrl) {
      // Dev MD sync from primary, redirect back to satellite w/ __clerk_db_jwt
      const redirectBackToSatelliteUrl = new URL(redirectUrl);

      if (devBrowserToken) {
        redirectBackToSatelliteUrl.searchParams.append(constants.Cookies.DevBrowser, devBrowserToken);
      }
      redirectBackToSatelliteUrl.searchParams.append(constants.QueryParameters.ClerkSynced, 'true');

      const headers = new Headers({ location: redirectBackToSatelliteUrl.toString() });
      return handleMaybeHandshakeStatus(authenticateContext, AuthErrorReason.PrimaryRespondsToSyncing, '', headers);
    }
    /**
     * End multi-domain sync flows
     */

    if (!hasActiveClient && !hasSessionToken) {
      return signedOut(authenticateContext, AuthErrorReason.SessionTokenAndUATMissing, '');
    }

    // This can eagerly run handshake since client_uat is SameSite=Strict in dev
    if (!hasActiveClient && hasSessionToken) {
      return handleMaybeHandshakeStatus(authenticateContext, AuthErrorReason.SessionTokenWithoutClientUAT, '');
    }

    if (hasActiveClient && !hasSessionToken) {
      return handleMaybeHandshakeStatus(authenticateContext, AuthErrorReason.ClientUATWithoutSessionToken, '');
    }

    const { data: decodeResult, error: decodedError } = decodeJwt(sessionToken!);
    if (decodedError) {
      return handleError(decodedError, 'cookie');
    }

    if (decodeResult.payload.iat < clientUat) {
      return handleMaybeHandshakeStatus(authenticateContext, AuthErrorReason.SessionTokenOutdated, '');
    }

    try {
      const { data, error } = await verifyToken(sessionToken!, authenticateContext);
      if (error) {
        throw error;
      }
      // use `await` to force this try/catch handle the signedIn invocation
      return await signedIn(authenticateContext, data);
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
        return handleMaybeHandshakeStatus(
          authenticateContext,
          AuthErrorReason.SessionTokenOutdated,
          err.getFullMessage(),
        );
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

/**
 * @internal
 */
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
    accept: headers(constants.Headers.Accept),
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
