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

  constructor() {
    this.handshakeRedirectLoopCounter = 0;
  }

  isRequestEligibleForHandshake(authenticateContext: { secFetchDest?: string; accept?: string }): boolean {
    const { accept, secFetchDest } = authenticateContext;

    if (secFetchDest === 'document' || secFetchDest === 'iframe') {
      return true;
    }

    if (!secFetchDest && accept?.startsWith('text/html')) {
      return true;
    }

    return false;
  }

  buildRedirectToHandshake(
    authenticateContext: AuthenticateContext,
    organizationSyncTargetMatchers: OrganizationSyncTargetMatchers,
    options: { organizationSyncOptions?: OrganizationSyncOptions },
    reason: string,
  ): Headers {
    const redirectUrl = this.removeDevBrowserFromURL(authenticateContext.clerkUrl);
    const frontendApiNoProtocol = authenticateContext.frontendApi.replace(/http(s)?:\/\//, '');

    const url = new URL(`https://${frontendApiNoProtocol}/v1/client/handshake`);
    url.searchParams.append('redirect_url', redirectUrl?.href || '');
    url.searchParams.append(
      constants.QueryParameters.SuffixedCookies,
      authenticateContext.usesSuffixedCookies().toString(),
    );
    url.searchParams.append(constants.QueryParameters.HandshakeReason, reason);

    if (authenticateContext.instanceType === 'development' && authenticateContext.devBrowserToken) {
      url.searchParams.append(constants.QueryParameters.DevBrowser, authenticateContext.devBrowserToken);
    }

    const toActivate = this.getOrganizationSyncTarget(
      authenticateContext.clerkUrl,
      options.organizationSyncOptions,
      organizationSyncTargetMatchers,
    );
    if (toActivate) {
      const params = this.getOrganizationSyncQueryParams(toActivate);
      params.forEach((value, key) => {
        url.searchParams.append(key, value);
      });
    }

    return new Headers({ [constants.Headers.Location]: url.href });
  }

  async resolveHandshake(authenticateContext: AuthenticateContext): Promise<SignedInState | SignedOutState> {
    const headers = new Headers({
      'Access-Control-Allow-Origin': 'null',
      'Access-Control-Allow-Credentials': 'true',
    });

    const cookiesToSet: string[] = [];

    if (authenticateContext.handshakeNonce) {
      // TODO: implement handshake nonce handling, fetch handshake payload with nonce
    } else if (authenticateContext.handshakeToken) {
      const handshakePayload = await verifyHandshakeToken(authenticateContext.handshakeToken, authenticateContext);
      cookiesToSet.push(...handshakePayload.handshake);
    }

    let sessionToken = '';
    cookiesToSet.forEach((x: string) => {
      headers.append('Set-Cookie', x);
      if (getCookieName(x).startsWith(constants.Cookies.Session)) {
        sessionToken = getCookieValue(x);
      }
    });

    if (authenticateContext.instanceType === 'development') {
      const newUrl = new URL(authenticateContext.clerkUrl);
      newUrl.searchParams.delete(constants.QueryParameters.Handshake);
      newUrl.searchParams.delete(constants.QueryParameters.HandshakeHelp);
      headers.append(constants.Headers.Location, newUrl.toString());
      headers.set(constants.Headers.CacheControl, 'no-store');
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
        error?.reason === TokenVerificationErrorReason.TokenNotActiveYet ||
        error?.reason === TokenVerificationErrorReason.TokenIatInTheFuture)
    ) {
      error.tokenCarrier = 'cookie';
      console.error(
        `Clerk: Clock skew detected. This usually means that your system clock is inaccurate. Clerk will attempt to account for the clock skew in development.

To resolve this issue, make sure your system's clock is set to the correct time (e.g. turn off and on automatic time synchronization).

---

${error.getFullMessage()}`,
      );

      const { data: retryResult, errors: [retryError] = [] } = await verifyToken(sessionToken, {
        ...authenticateContext,
        clockSkewInMs: 86_400_000,
      });
      if (retryResult) {
        return signedIn(authenticateContext, retryResult, headers, sessionToken);
      }

      throw new Error(retryError?.message || 'Clerk: Handshake retry failed.');
    }

    throw new Error(error?.message || 'Clerk: Handshake failed.');
  }

  handleHandshakeTokenVerificationErrorInDevelopment(error: TokenVerificationError): void {
    if (error.reason === TokenVerificationErrorReason.TokenInvalidSignature) {
      const msg = `Clerk: Handshake token verification failed due to an invalid signature. If you have switched Clerk keys locally, clear your cookies and try again.`;
      throw new Error(msg);
    }
    throw new Error(`Clerk: Handshake token verification failed: ${error.getFullMessage()}.`);
  }

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
