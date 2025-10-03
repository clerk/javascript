import { constants, SUPPORTED_BAPI_VERSION } from '../constants';
import { TokenVerificationError, TokenVerificationErrorAction, TokenVerificationErrorReason } from '../errors';
import type { VerifyJwtOptions } from '../jwt';
import { assertHeaderAlgorithm, assertHeaderType } from '../jwt/assertions';
import { decodeJwt, hasValidSignature } from '../jwt/verifyJwt';
import type { AuthenticateContext } from './authenticateContext';
import type { SignedInState, SignedOutState } from './authStatus';
import { AuthErrorReason, signedIn, signedOut } from './authStatus';
import { getCookieName, getCookieValue } from './cookie';
import { loadClerkJWKFromLocal, loadClerkJWKFromRemote } from './keys';
import type { OrganizationMatcher } from './organizationMatcher';
import { TokenType } from './tokenTypes';
import type { OrganizationSyncOptions, OrganizationSyncTarget } from './types';
import type { VerifyTokenOptions } from './verify';
import { verifyToken } from './verify';

async function verifyHandshakeJwt(token: string, { key }: VerifyJwtOptions): Promise<{ handshake: string[] }> {
  const { data: decoded, errors } = decodeJwt(token);
  if (errors) {
    throw errors[0];
  }

  const { header, payload } = decoded;

  // Header verifications
  const { typ, alg } = header;

  assertHeaderType(typ);
  assertHeaderAlgorithm(alg);

  const { data: signatureValid, errors: signatureErrors } = await hasValidSignature(decoded, key);
  if (signatureErrors) {
    throw new TokenVerificationError({
      reason: TokenVerificationErrorReason.TokenVerificationFailed,
      message: `Error verifying handshake token. ${signatureErrors[0]}`,
    });
  }

  if (!signatureValid) {
    throw new TokenVerificationError({
      reason: TokenVerificationErrorReason.TokenInvalidSignature,
      message: 'Handshake signature is invalid.',
    });
  }

  return payload as unknown as { handshake: string[] };
}

/**
 * Similar to our verifyToken flow for Clerk-issued JWTs, but this verification flow is for our signed handshake payload.
 * The handshake payload requires fewer verification steps.
 */
export async function verifyHandshakeToken(
  token: string,
  options: VerifyTokenOptions,
): Promise<{ handshake: string[] }> {
  const { secretKey, apiUrl, apiVersion, jwksCacheTtlInMs, jwtKey, skipJwksCache } = options;

  const { data, errors } = decodeJwt(token);
  if (errors) {
    throw errors[0];
  }

  const { kid } = data.header;

  let key;

  if (jwtKey) {
    key = loadClerkJWKFromLocal(jwtKey);
  } else if (secretKey) {
    // Fetch JWKS from Backend API using the key
    key = await loadClerkJWKFromRemote({ secretKey, apiUrl, apiVersion, kid, jwksCacheTtlInMs, skipJwksCache });
  } else {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.SetClerkJWTKey,
      message: 'Failed to resolve JWK during handshake verification.',
      reason: TokenVerificationErrorReason.JWKFailedToResolve,
    });
  }

  return await verifyHandshakeJwt(token, {
    key,
  });
}

export class HandshakeService {
  private readonly authenticateContext: AuthenticateContext;
  private readonly organizationMatcher: OrganizationMatcher;
  private readonly options: { organizationSyncOptions?: OrganizationSyncOptions };

  constructor(
    authenticateContext: AuthenticateContext,
    options: { organizationSyncOptions?: OrganizationSyncOptions },
    organizationMatcher: OrganizationMatcher,
  ) {
    this.authenticateContext = authenticateContext;
    this.options = options;
    this.organizationMatcher = organizationMatcher;
  }

  /**
   * Determines if a request is eligible for handshake based on its headers
   *
   * Currently, a request is only eligible for a handshake if we can say it's *probably* a request for a document, not a fetch or some other exotic request.
   * This heuristic should give us a reliable enough signal for browsers that support `Sec-Fetch-Dest` and for those that don't.
   *
   * @returns boolean indicating if the request is eligible for handshake
   */
  isRequestEligibleForHandshake(): boolean {
    const { accept, secFetchDest } = this.authenticateContext;

    // NOTE: we could also check sec-fetch-mode === navigate here, but according to the spec, sec-fetch-dest: document should indicate that the request is the data of a user navigation.
    // Also, we check for 'iframe' because it's the value set when a doc request is made by an iframe.
    if (secFetchDest === 'document' || secFetchDest === 'iframe') {
      return true;
    }

    if (!secFetchDest && accept?.startsWith('text/html')) {
      return true;
    }

    return false;
  }

  /**
   * Builds the redirect headers for a handshake request
   * @param reason - The reason for the handshake (e.g. 'session-token-expired')
   * @returns Headers object containing the Location header for redirect
   * @throws Error if clerkUrl is missing in authenticateContext
   */
  buildRedirectToHandshake(reason: string): Headers {
    if (!this.authenticateContext?.clerkUrl) {
      throw new Error('Missing clerkUrl in authenticateContext');
    }

    const redirectUrl = this.removeDevBrowserFromURL(this.authenticateContext.clerkUrl);

    let baseUrl = this.authenticateContext.frontendApi.startsWith('http')
      ? this.authenticateContext.frontendApi
      : `https://${this.authenticateContext.frontendApi}`;

    baseUrl = baseUrl.replace(/\/+$/, '') + '/';

    const url = new URL('v1/client/handshake', baseUrl);
    url.searchParams.append('redirect_url', redirectUrl?.href || '');
    url.searchParams.append('__clerk_api_version', SUPPORTED_BAPI_VERSION);
    url.searchParams.append(
      constants.QueryParameters.SuffixedCookies,
      this.authenticateContext.usesSuffixedCookies().toString(),
    );
    url.searchParams.append(constants.QueryParameters.HandshakeReason, reason);
    url.searchParams.append(constants.QueryParameters.HandshakeFormat, 'nonce');

    if (this.authenticateContext.sessionToken) {
      url.searchParams.append(constants.Cookies.Session, this.authenticateContext.sessionToken);
    }

    if (this.authenticateContext.instanceType === 'development' && this.authenticateContext.devBrowserToken) {
      url.searchParams.append(constants.QueryParameters.DevBrowser, this.authenticateContext.devBrowserToken);
    }

    const toActivate = this.getOrganizationSyncTarget(this.authenticateContext.clerkUrl, this.organizationMatcher);
    if (toActivate) {
      const params = this.getOrganizationSyncQueryParams(toActivate);
      params.forEach((value, key) => {
        url.searchParams.append(key, value);
      });
    }

    return new Headers({ [constants.Headers.Location]: url.href });
  }

  /**
   * Gets cookies from either a handshake nonce or a handshake token
   * @returns Promise resolving to string array of cookie directives
   */
  public async getCookiesFromHandshake(): Promise<string[]> {
    const cookiesToSet: string[] = [];

    if (this.authenticateContext.handshakeNonce) {
      try {
        const handshakePayload = await this.authenticateContext.apiClient?.clients.getHandshakePayload({
          nonce: this.authenticateContext.handshakeNonce,
        });
        if (handshakePayload) {
          cookiesToSet.push(...handshakePayload.directives);
        }
      } catch (error) {
        console.error('Clerk: HandshakeService: error getting handshake payload:', error);
      }
    } else if (this.authenticateContext.handshakeToken) {
      const handshakePayload = await verifyHandshakeToken(
        this.authenticateContext.handshakeToken,
        this.authenticateContext,
      );
      if (handshakePayload && Array.isArray(handshakePayload.handshake)) {
        cookiesToSet.push(...handshakePayload.handshake);
      }
    }

    return cookiesToSet;
  }

  /**
   * Resolves a handshake request by verifying the handshake token and setting appropriate cookies
   * @returns Promise resolving to either a SignedInState or SignedOutState
   * @throws Error if handshake verification fails or if there are issues with the session token
   */
  async resolveHandshake(): Promise<SignedInState | SignedOutState> {
    const headers = new Headers({
      'Access-Control-Allow-Origin': 'null',
      'Access-Control-Allow-Credentials': 'true',
    });

    const cookiesToSet = await this.getCookiesFromHandshake();

    let sessionToken = '';
    cookiesToSet.forEach((x: string) => {
      headers.append('Set-Cookie', x);
      if (getCookieName(x).startsWith(constants.Cookies.Session)) {
        sessionToken = getCookieValue(x);
      }
    });

    if (this.authenticateContext.instanceType === 'development') {
      const newUrl = new URL(this.authenticateContext.clerkUrl);
      newUrl.searchParams.delete(constants.QueryParameters.Handshake);
      newUrl.searchParams.delete(constants.QueryParameters.HandshakeHelp);
      newUrl.searchParams.delete(constants.QueryParameters.DevBrowser);
      headers.append(constants.Headers.Location, newUrl.toString());
      headers.set(constants.Headers.CacheControl, 'no-store');
    }

    if (sessionToken === '') {
      return signedOut({
        tokenType: TokenType.SessionToken,
        authenticateContext: this.authenticateContext,
        reason: AuthErrorReason.SessionTokenMissing,
        message: '',
        headers,
      });
    }

    const { data, errors: [error] = [] } = await verifyToken(sessionToken, this.authenticateContext);
    if (data) {
      return signedIn({
        tokenType: TokenType.SessionToken,
        authenticateContext: this.authenticateContext,
        sessionClaims: data,
        headers,
        token: sessionToken,
      });
    }

    if (
      this.authenticateContext.instanceType === 'development' &&
      (error?.reason === TokenVerificationErrorReason.TokenExpired ||
        error?.reason === TokenVerificationErrorReason.TokenNotActiveYet ||
        error?.reason === TokenVerificationErrorReason.TokenIatInTheFuture)
    ) {
      // Create a new error object with the same properties
      const developmentError = new TokenVerificationError({
        action: error.action,
        message: error.message,
        reason: error.reason,
      });
      // Set the tokenCarrier after construction
      developmentError.tokenCarrier = 'cookie';

      console.error(
        `Clerk: Clock skew detected. This usually means that your system clock is inaccurate. Clerk will attempt to account for the clock skew in development.

To resolve this issue, make sure your system's clock is set to the correct time (e.g. turn off and on automatic time synchronization).

---

${developmentError.getFullMessage()}`,
      );

      const { data: retryResult, errors: [retryError] = [] } = await verifyToken(sessionToken, {
        ...this.authenticateContext,
        clockSkewInMs: 86_400_000,
      });
      if (retryResult) {
        return signedIn({
          tokenType: TokenType.SessionToken,
          authenticateContext: this.authenticateContext,
          sessionClaims: retryResult,
          headers,
          token: sessionToken,
        });
      }

      throw new Error(retryError?.message || 'Clerk: Handshake retry failed.');
    }

    throw new Error(error?.message || 'Clerk: Handshake failed.');
  }

  /**
   * Handles handshake token verification errors in development mode
   * @param error - The TokenVerificationError that occurred
   * @throws Error with a descriptive message about the verification failure
   */
  handleTokenVerificationErrorInDevelopment(error: TokenVerificationError): void {
    // In development, the handshake token is being transferred in the URL as a query parameter, so there is no
    // possibility of collision with a handshake token of another app running on the same local domain
    // (etc one app on localhost:3000 and one on localhost:3001).
    // Therefore, if the handshake token is invalid, it is likely that the user has switched Clerk keys locally.
    // We make sure to throw a descriptive error message and then stop the handshake flow in every case,
    // to avoid the possibility of an infinite loop.
    if (error.reason === TokenVerificationErrorReason.TokenInvalidSignature) {
      const msg = `Clerk: Handshake token verification failed due to an invalid signature. If you have switched Clerk keys locally, clear your cookies and try again.`;
      throw new Error(msg);
    }
    throw new Error(`Clerk: Handshake token verification failed: ${error.getFullMessage()}.`);
  }

  /**
   * Checks if a redirect loop is detected and sets headers to track redirect count
   * @param headers - The Headers object to modify
   * @returns boolean indicating if a redirect loop was detected (true) or if the request can proceed (false)
   */
  checkAndTrackRedirectLoop(headers: Headers): boolean {
    if (this.authenticateContext.handshakeRedirectLoopCounter === 3) {
      return true;
    }

    const newCounterValue = this.authenticateContext.handshakeRedirectLoopCounter + 1;
    const cookieName = constants.Cookies.RedirectCount;
    headers.append('Set-Cookie', `${cookieName}=${newCounterValue}; SameSite=Lax; HttpOnly; Max-Age=2`);
    return false;
  }

  private removeDevBrowserFromURL(url: URL): URL {
    const updatedURL = new URL(url);
    updatedURL.searchParams.delete(constants.QueryParameters.DevBrowser);
    updatedURL.searchParams.delete(constants.QueryParameters.LegacyDevBrowser);
    return updatedURL;
  }

  private getOrganizationSyncTarget(url: URL, matchers: OrganizationMatcher): OrganizationSyncTarget | null {
    return matchers.findTarget(url);
  }

  private getOrganizationSyncQueryParams(toActivate: OrganizationSyncTarget): Map<string, string> {
    const ret = new Map();
    if (toActivate.type === 'personalAccount') {
      ret.set('organization_id', '');
    }
    if (toActivate.type === 'organization') {
      if (toActivate.organizationId) {
        ret.set('organization_id', toActivate.organizationId);
      }
      if (toActivate.organizationSlug) {
        ret.set('organization_id', toActivate.organizationSlug);
      }
    }
    return ret;
  }
}
