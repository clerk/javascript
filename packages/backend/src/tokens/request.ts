import { parsePublishableKey } from '@clerk/shared/keys';

import { constants } from '../constants';
import type { TokenCarrier } from '../errors';
import { TokenVerificationError, TokenVerificationErrorReason } from '../errors';
import { decodeJwt } from '../jwt';
import { assertValidSecretKey } from '../util/assertValidSecretKey';
import { isDevelopmentFromSecretKey } from '../util/shared';
import type { AuthenticateContext } from './authenticateContext';
import { createAuthenticateContext } from './authenticateContext';
import type { RequestState } from './authStatus';
import { AuthErrorReason, handshake, signedIn, signedOut } from './authStatus';
import { createClerkRequest } from './clerkRequest';
import { verifyHandshakeToken } from './handshake';
import type { AuthenticateRequestOptions } from './types';
import { verifyToken } from './verify';

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
  const authenticateContext = createAuthenticateContext(createClerkRequest(request), options);
  assertValidSecretKey(authenticateContext.secretKey);

  if (authenticateContext.isSatellite) {
    assertSignInUrlExists(authenticateContext.signInUrl, authenticateContext.secretKey);
    if (authenticateContext.signInUrl && authenticateContext.origin) {
      assertSignInUrlFormatAndOrigin(authenticateContext.signInUrl, authenticateContext.origin);
    }
    assertProxyUrlOrDomain(authenticateContext.proxyUrl || authenticateContext.domain);
  }

  function buildRedirectToHandshake() {
    const redirectUrl = new URL(authenticateContext.clerkUrl);
    redirectUrl.searchParams.delete('__clerk_db_jwt');
    const frontendApiNoProtocol = pk.frontendApi.replace(/http(s)?:\/\//, '');

    const url = new URL(`https://${frontendApiNoProtocol}/v1/client/handshake`);
    url.searchParams.append('redirect_url', redirectUrl?.href || '');

    if (pk?.instanceType === 'development' && authenticateContext.devBrowserToken) {
      url.searchParams.append('__clerk_db_jwt', authenticateContext.devBrowserToken);
    }

    return new Headers({ location: url.href });
  }

  async function resolveHandshake() {
    const headers = new Headers({
      'Access-Control-Allow-Origin': 'null',
      'Access-Control-Allow-Credentials': 'true',
    });

    const handshakePayload = await verifyHandshakeToken(authenticateContext.handshakeToken!, authenticateContext);
    const cookiesToSet = handshakePayload.handshake;

    let sessionToken = '';
    cookiesToSet.forEach((x: string) => {
      headers.append('Set-Cookie', x);
      if (x.startsWith('__session=')) {
        sessionToken = x.split(';')[0].substring(10);
      }
    });

    if (instanceType === 'development') {
      const newUrl = new URL(authenticateContext.clerkUrl);
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
      console.error(retryError);
    }

    console.error(error);
    return signedOut(
      authenticateContext,
      AuthErrorReason.UnexpectedError,
      'handshake token verification failed',
      headers,
    );
  }

  function handleMaybeHandshakeStatus(
    authenticateContext: AuthenticateContext,
    reason: AuthErrorReason,
    message: string,
    headers?: Headers,
  ) {
    if (isRequestEligibleForHandshake(authenticateContext)) {
      // Right now the only usage of passing in different headers is for multi-domain sync, which redirects somewhere else.
      // In the future if we want to decorate the handshake redirect with additional headers per call we need to tweak this logic.
      return handshake(authenticateContext, reason, message, headers ?? buildRedirectToHandshake());
    }
    return signedOut(authenticateContext, reason, message, new Headers());
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
      return await signedIn(authenticateContext, data);
    } catch (err) {
      return handleError(err, 'header');
    }
  }

  async function authenticateRequestWithTokenInCookie() {
    const hasActiveClient = authenticateContext.clientUat;
    const hasSessionToken = !!authenticateContext.sessionTokenInCookie;

    const isRequestEligibleForMultiDomainSync =
      authenticateContext.isSatellite &&
      authenticateContext.secFetchDest === 'document' &&
      !authenticateContext.clerkUrl.searchParams.has(constants.QueryParameters.ClerkSynced);

    /**
     * If we have a handshakeToken, resolve the handshake and attempt to return a definitive signed in or signed out state.
     */
    if (authenticateContext.handshakeToken) {
      return resolveHandshake();
    }

    /**
     * Otherwise, check for "known unknown" auth states that we can resolve with a handshake.
     */
    if (instanceType === 'development' && authenticateContext.clerkUrl.searchParams.has(constants.Cookies.DevBrowser)) {
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
      const redirectURL = new URL(authenticateContext.signInUrl!);
      redirectURL.searchParams.append(
        constants.QueryParameters.ClerkRedirectUrl,
        authenticateContext.clerkUrl.toString(),
      );

      const headers = new Headers({ location: redirectURL.toString() });
      return handleMaybeHandshakeStatus(authenticateContext, AuthErrorReason.SatelliteCookieNeedsSyncing, '', headers);
    }

    // Multi-domain development sync flow
    const redirectUrl = new URL(authenticateContext.clerkUrl).searchParams.get(
      constants.QueryParameters.ClerkRedirectUrl,
    );
    if (instanceType === 'development' && !authenticateContext.isSatellite && redirectUrl) {
      // Dev MD sync from primary, redirect back to satellite w/ __clerk_db_jwt
      const redirectBackToSatelliteUrl = new URL(redirectUrl);

      if (authenticateContext.devBrowserToken) {
        redirectBackToSatelliteUrl.searchParams.append(
          constants.Cookies.DevBrowser,
          authenticateContext.devBrowserToken,
        );
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

    const { data: decodeResult, error: decodedError } = decodeJwt(authenticateContext.sessionTokenInCookie!);
    if (decodedError) {
      return handleError(decodedError, 'cookie');
    }

    if (decodeResult.payload.iat < authenticateContext.clientUat) {
      return handleMaybeHandshakeStatus(authenticateContext, AuthErrorReason.SessionTokenOutdated, '');
    }

    try {
      const { data, error } = await verifyToken(authenticateContext.sessionTokenInCookie!, authenticateContext);
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
