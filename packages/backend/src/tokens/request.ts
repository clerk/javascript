import { constants } from '../constants';
import type { TokenCarrier } from '../errors';
import { TokenVerificationError, TokenVerificationErrorReason } from '../errors';
import { decodeJwt } from '../jwt/verifyJwt';
import { assertValidSecretKey } from '../util/optionsAssertions';
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

  function removeDevBrowserFromURL(url: URL) {
    const updatedURL = new URL(url);

    updatedURL.searchParams.delete(constants.QueryParameters.DevBrowser);
    // Remove legacy dev browser query param key to support local app with v5 using AP with v4
    updatedURL.searchParams.delete(constants.QueryParameters.LegacyDevBrowser);

    return updatedURL;
  }

  function buildRedirectToHandshake() {
    const redirectUrl = removeDevBrowserFromURL(authenticateContext.clerkUrl);
    const frontendApiNoProtocol = authenticateContext.frontendApi.replace(/http(s)?:\/\//, '');

    const url = new URL(`https://${frontendApiNoProtocol}/v1/client/handshake`);
    url.searchParams.append('redirect_url', redirectUrl?.href || '');
    url.searchParams.append('suffixed_cookies', 'true');

    if (authenticateContext.instanceType === 'development' && authenticateContext.devBrowserToken) {
      url.searchParams.append(constants.QueryParameters.DevBrowser, authenticateContext.devBrowserToken);
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
      if (x.startsWith(`${constants.Cookies.Session}=`)) {
        sessionToken = x.split(';')[0].substring(10);
      }
    });

    if (authenticateContext.instanceType === 'development') {
      const newUrl = new URL(authenticateContext.clerkUrl);
      newUrl.searchParams.delete(constants.QueryParameters.Handshake);
      newUrl.searchParams.delete(constants.QueryParameters.HandshakeHelp);
      headers.append('Location', newUrl.toString());
    }

    if (sessionToken === '') {
      return signedOut(authenticateContext, AuthErrorReason.SessionTokenMissing, '', headers);
    }

    const { data, errors: [error] = [] } = await verifyToken(sessionToken, authenticateContext);
    if (data) {
      return signedIn(authenticateContext, data, headers, sessionToken);
    }

    if (
      authenticateContext.instanceType === 'development' &&
      (error?.reason === TokenVerificationErrorReason.TokenExpired ||
        error?.reason === TokenVerificationErrorReason.TokenNotActiveYet)
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
      const { data: retryResult, errors: [retryError] = [] } = await verifyToken(sessionToken, {
        ...authenticateContext,
        clockSkewInMs: 86_400_000,
      });
      if (retryResult) {
        return signedIn(authenticateContext, retryResult, headers, sessionToken);
      }

      throw retryError;
    }

    throw error;
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

  async function authenticateRequestWithTokenInHeader() {
    const { sessionTokenInHeader } = authenticateContext;

    try {
      const { data, errors } = await verifyToken(sessionTokenInHeader!, authenticateContext);
      if (errors) {
        throw errors[0];
      }
      // use `await` to force this try/catch handle the signedIn invocation
      return await signedIn(authenticateContext, data, undefined, sessionTokenInHeader!);
    } catch (err) {
      return handleError(err, 'header');
    }
  }

  async function authenticateRequestWithTokenInCookie() {
    const hasActiveClient = authenticateContext.clientUat;
    const hasSessionToken = !!authenticateContext.sessionTokenInCookie;
    const hasDevBrowserToken = !!authenticateContext.devBrowserToken;

    const isRequestEligibleForMultiDomainSync =
      authenticateContext.isSatellite &&
      authenticateContext.secFetchDest === 'document' &&
      !authenticateContext.clerkUrl.searchParams.has(constants.QueryParameters.ClerkSynced);

    /**
     * If we have a handshakeToken, resolve the handshake and attempt to return a definitive signed in or signed out state.
     */
    if (authenticateContext.handshakeToken) {
      try {
        return await resolveHandshake();
      } catch (error) {
        // If for some reason the handshake token is invalid or stale, we ignore it and continue trying to authenticate the request.
        // Worst case, the handshake will trigger again and return a refreshed token.
        if (error instanceof TokenVerificationError) {
          if (authenticateContext.instanceType === 'development') {
            if (error.reason === TokenVerificationErrorReason.TokenInvalidSignature) {
              throw new Error(
                `Clerk: Handshake token verification failed due to an invalid signature. If you have switched Clerk keys locally, clear your cookies and try again.`,
              );
            }

            throw new Error(`Clerk: Handshake token verification failed: ${error.getFullMessage()}.`);
          }

          if (
            error.reason === TokenVerificationErrorReason.TokenInvalidSignature ||
            error.reason === TokenVerificationErrorReason.InvalidSecretKey
          ) {
            // Avoid infinite redirect loops due to incorrect secret-keys
            return signedOut(
              authenticateContext,
              AuthErrorReason.UnexpectedError,
              `Clerk: Handshake token verification failed with "${error.reason}"`,
            );
          }
        }
      }
    }

    /**
     * Otherwise, check for "known unknown" auth states that we can resolve with a handshake.
     */
    if (
      authenticateContext.instanceType === 'development' &&
      authenticateContext.clerkUrl.searchParams.has(constants.QueryParameters.DevBrowser)
    ) {
      return handleMaybeHandshakeStatus(authenticateContext, AuthErrorReason.DevBrowserSync, '');
    }

    /**
     * Begin multi-domain sync flows
     */
    if (authenticateContext.instanceType === 'production' && isRequestEligibleForMultiDomainSync) {
      return handleMaybeHandshakeStatus(authenticateContext, AuthErrorReason.SatelliteCookieNeedsSyncing, '');
    }

    // Multi-domain development sync flow
    if (authenticateContext.instanceType === 'development' && isRequestEligibleForMultiDomainSync) {
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
    if (authenticateContext.instanceType === 'development' && !authenticateContext.isSatellite && redirectUrl) {
      // Dev MD sync from primary, redirect back to satellite w/ dev browser query param
      const redirectBackToSatelliteUrl = new URL(redirectUrl);

      if (authenticateContext.devBrowserToken) {
        redirectBackToSatelliteUrl.searchParams.append(
          constants.QueryParameters.DevBrowser,
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

    if (authenticateContext.instanceType === 'development' && !hasDevBrowserToken) {
      return handleMaybeHandshakeStatus(authenticateContext, AuthErrorReason.DevBrowserMissing, '');
    }

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

    const { data: decodeResult, errors: decodedErrors } = decodeJwt(authenticateContext.sessionTokenInCookie!);
    if (decodedErrors) {
      return handleError(decodedErrors[0], 'cookie');
    }

    if (decodeResult.payload.iat < authenticateContext.clientUat) {
      return handleMaybeHandshakeStatus(authenticateContext, AuthErrorReason.SessionTokenOutdated, '');
    }

    try {
      const { data, errors } = await verifyToken(authenticateContext.sessionTokenInCookie!, authenticateContext);
      if (errors) {
        throw errors[0];
      }
      // use `await` to force this try/catch handle the signedIn invocation
      return await signedIn(authenticateContext, data, undefined, authenticateContext.sessionTokenInCookie!);
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
