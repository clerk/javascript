import type { Match, MatchFunction } from '@clerk/shared/pathToRegexp';

import { constants } from '../constants';
import { TokenVerificationError, TokenVerificationErrorAction, TokenVerificationErrorReason } from '../errors';
import type { VerifyJwtOptions } from '../jwt';
import { assertHeaderAlgorithm, assertHeaderType } from '../jwt/assertions';
import { decodeJwt, hasValidSignature } from '../jwt/verifyJwt';
import type { AuthenticateContext } from './authenticateContext';
import type { SignedInState, SignedOutState } from './authStatus';
import { AuthErrorReason, signedIn, signedOut } from './authStatus';
import { getCookieName, getCookieValue } from './cookie';
import { loadClerkJWKFromLocal, loadClerkJWKFromRemote } from './keys';
import type { OrganizationSyncOptions } from './types';
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

export type OrganizationSyncTargetMatchers = {
  OrganizationMatcher: MatchFunction<Partial<Record<string, string | string[]>>> | null;
  PersonalAccountMatcher: MatchFunction<Partial<Record<string, string | string[]>>> | null;
};

export type OrganizationSyncTarget =
  | { type: 'personalAccount' }
  | { type: 'organization'; organizationId?: string; organizationSlug?: string };

export class HandshakeService {
  private handshakeRedirectLoopCounter: number;
  private readonly authenticateContext: AuthenticateContext;
  private readonly organizationSyncTargetMatchers: OrganizationSyncTargetMatchers;
  private readonly options: { organizationSyncOptions?: OrganizationSyncOptions };

  constructor(
    authenticateContext: AuthenticateContext,
    organizationSyncTargetMatchers: OrganizationSyncTargetMatchers,
    options: { organizationSyncOptions?: OrganizationSyncOptions },
  ) {
    this.handshakeRedirectLoopCounter = 0;
    this.authenticateContext = authenticateContext;
    this.organizationSyncTargetMatchers = organizationSyncTargetMatchers;
    this.options = options;
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
    const frontendApiNoProtocol = this.authenticateContext.frontendApi.replace(/http(s)?:\/\//, '');

    const url = new URL(`https://${frontendApiNoProtocol}/v1/client/handshake`);
    url.searchParams.append('redirect_url', redirectUrl?.href || '');
    url.searchParams.append(
      constants.QueryParameters.SuffixedCookies,
      this.authenticateContext.usesSuffixedCookies().toString(),
    );
    url.searchParams.append(constants.QueryParameters.HandshakeReason, reason);

    if (this.authenticateContext.instanceType === 'development' && this.authenticateContext.devBrowserToken) {
      url.searchParams.append(constants.QueryParameters.DevBrowser, this.authenticateContext.devBrowserToken);
    }

    const toActivate = this.getOrganizationSyncTarget(
      this.authenticateContext.clerkUrl,
      this.options.organizationSyncOptions,
      this.organizationSyncTargetMatchers,
    );
    if (toActivate) {
      const params = this.getOrganizationSyncQueryParams(toActivate);
      params.forEach((value, key) => {
        url.searchParams.append(key, value);
      });
    }

    return new Headers({ [constants.Headers.Location]: url.href });
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

    const cookiesToSet: string[] = [];

    if (this.authenticateContext.handshakeNonce) {
      // TODO: implement handshake nonce handling, fetch handshake payload with nonce
      console.warn('Clerk: Handshake nonce is not implemented yet.');
    }
    if (this.authenticateContext.handshakeToken) {
      const handshakePayload = await verifyHandshakeToken(
        this.authenticateContext.handshakeToken,
        this.authenticateContext,
      );
      cookiesToSet.push(...handshakePayload.handshake);
    }

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
      headers.append(constants.Headers.Location, newUrl.toString());
      headers.set(constants.Headers.CacheControl, 'no-store');
    }

    if (sessionToken === '') {
      return signedOut(this.authenticateContext, AuthErrorReason.SessionTokenMissing, '', headers);
    }

    const { data, errors: [error] = [] } = await verifyToken(sessionToken, this.authenticateContext);
    if (data) {
      return signedIn(this.authenticateContext, data, headers, sessionToken);
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
        return signedIn(this.authenticateContext, retryResult, headers, sessionToken);
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
  handleHandshakeTokenVerificationErrorInDevelopment(error: TokenVerificationError): void {
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
   * Sets headers to prevent infinite handshake redirection loops
   * @param headers - The Headers object to modify
   * @returns boolean indicating if a redirect loop was detected (true) or if the request can proceed (false)
   */
  setHandshakeInfiniteRedirectionLoopHeaders(headers: Headers): boolean {
    if (this.handshakeRedirectLoopCounter === 3) {
      return true;
    }

    const newCounterValue = this.handshakeRedirectLoopCounter + 1;
    const cookieName = constants.Cookies.RedirectCount;
    headers.append('Set-Cookie', `${cookieName}=${newCounterValue}; SameSite=Lax; HttpOnly; Max-Age=3`);
    return false;
  }

  private removeDevBrowserFromURL(url: URL): URL {
    const updatedURL = new URL(url);
    updatedURL.searchParams.delete(constants.QueryParameters.DevBrowser);
    updatedURL.searchParams.delete(constants.QueryParameters.LegacyDevBrowser);
    return updatedURL;
  }

  private getOrganizationSyncTarget(
    url: URL,
    options: OrganizationSyncOptions | undefined,
    matchers: OrganizationSyncTargetMatchers,
  ): OrganizationSyncTarget | null {
    if (!options) {
      return null;
    }

    if (matchers.OrganizationMatcher) {
      let orgResult: Match<Partial<Record<string, string | string[]>>>;
      try {
        orgResult = matchers.OrganizationMatcher(url.pathname);
      } catch (e) {
        console.error(`Clerk: Failed to apply organization pattern "${options.organizationPatterns}" to a path`, e);
        return null;
      }

      if (orgResult && 'params' in orgResult) {
        const params = orgResult.params;

        if ('id' in params && typeof params.id === 'string') {
          return { type: 'organization', organizationId: params.id };
        }
        if ('slug' in params && typeof params.slug === 'string') {
          return { type: 'organization', organizationSlug: params.slug };
        }
        console.warn(
          'Clerk: Detected an organization pattern match, but no organization ID or slug was found in the URL. Does the pattern include `:id` or `:slug`?',
        );
      }
    }

    if (matchers.PersonalAccountMatcher) {
      let personalResult: Match<Partial<Record<string, string | string[]>>>;
      try {
        personalResult = matchers.PersonalAccountMatcher(url.pathname);
      } catch (e) {
        console.error(`Failed to apply personal account pattern "${options.personalAccountPatterns}" to a path`, e);
        return null;
      }

      if (personalResult) {
        return { type: 'personalAccount' };
      }
    }
    return null;
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
