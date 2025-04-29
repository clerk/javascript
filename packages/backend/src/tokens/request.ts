import type { Match, MatchFunction } from '@clerk/shared/pathToRegexp';
import { match } from '@clerk/shared/pathToRegexp';
import type { JwtPayload } from '@clerk/types';

import { constants } from '../constants';
import type { TokenCarrier } from '../errors';
import { TokenVerificationError, TokenVerificationErrorReason } from '../errors';
import { decodeJwt } from '../jwt/verifyJwt';
import { assertValidSecretKey } from '../util/optionsAssertions';
import { isDevelopmentFromSecretKey } from '../util/shared';
import type { AuthenticateContext } from './authenticateContext';
import { createAuthenticateContext } from './authenticateContext';
import type { SignedInAuthObject } from './authObjects';
import type { HandshakeState, RequestState, SignedInState, SignedOutState } from './authStatus';
import { AuthErrorReason, handshake, signedIn, signedOut } from './authStatus';
import { createClerkRequest } from './clerkRequest';
import { getCookieName, getCookieValue } from './cookie';
import { HandshakeService } from './handshake';
import type { AuthenticateRequestOptions, OrganizationSyncOptions } from './types';
import { verifyToken } from './verify';

export const RefreshTokenErrorReason = {
  NonEligibleNoCookie: 'non-eligible-no-refresh-cookie',
  NonEligibleNonGet: 'non-eligible-non-get',
  InvalidSessionToken: 'invalid-session-token',
  MissingApiClient: 'missing-api-client',
  MissingSessionToken: 'missing-session-token',
  MissingRefreshToken: 'missing-refresh-token',
  ExpiredSessionTokenDecodeFailed: 'expired-session-token-decode-failed',
  ExpiredSessionTokenMissingSidClaim: 'expired-session-token-missing-sid-claim',
  FetchError: 'fetch-error',
  UnexpectedSDKError: 'unexpected-sdk-error',
  UnexpectedBAPIError: 'unexpected-bapi-error',
} as const;

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

function isRequestEligibleForRefresh(
  err: TokenVerificationError,
  authenticateContext: { refreshTokenInCookie?: string },
  request: Request,
) {
  return (
    err.reason === TokenVerificationErrorReason.TokenExpired &&
    !!authenticateContext.refreshTokenInCookie &&
    request.method === 'GET'
  );
}

export async function authenticateRequest(
  request: Request,
  options: AuthenticateRequestOptions,
): Promise<RequestState> {
  const authenticateContext = await createAuthenticateContext(createClerkRequest(request), options);
  assertValidSecretKey(authenticateContext.secretKey);

  if (authenticateContext.isSatellite) {
    assertSignInUrlExists(authenticateContext.signInUrl, authenticateContext.secretKey);
    if (authenticateContext.signInUrl && authenticateContext.origin) {
      assertSignInUrlFormatAndOrigin(authenticateContext.signInUrl, authenticateContext.origin);
    }
    assertProxyUrlOrDomain(authenticateContext.proxyUrl || authenticateContext.domain);
  }

  const organizationSyncTargetMatchers = computeOrganizationSyncTargetMatchers(options.organizationSyncOptions);
  const handshakeService = new HandshakeService();

  async function refreshToken(
    authenticateContext: AuthenticateContext,
  ): Promise<{ data: string[]; error: null } | { data: null; error: any }> {
    // To perform a token refresh, apiClient must be defined.
    if (!options.apiClient) {
      return {
        data: null,
        error: {
          message: 'An apiClient is needed to perform token refresh.',
          cause: { reason: RefreshTokenErrorReason.MissingApiClient },
        },
      };
    }
    const { sessionToken: expiredSessionToken, refreshTokenInCookie: refreshToken } = authenticateContext;
    if (!expiredSessionToken) {
      return {
        data: null,
        error: {
          message: 'Session token must be provided.',
          cause: { reason: RefreshTokenErrorReason.MissingSessionToken },
        },
      };
    }
    if (!refreshToken) {
      return {
        data: null,
        error: {
          message: 'Refresh token must be provided.',
          cause: { reason: RefreshTokenErrorReason.MissingRefreshToken },
        },
      };
    }
    // The token refresh endpoint requires a sessionId, so we decode that from the expired token.
    const { data: decodeResult, errors: decodedErrors } = decodeJwt(expiredSessionToken);
    if (!decodeResult || decodedErrors) {
      return {
        data: null,
        error: {
          message: 'Unable to decode the expired session token.',
          cause: { reason: RefreshTokenErrorReason.ExpiredSessionTokenDecodeFailed, errors: decodedErrors },
        },
      };
    }

    if (!decodeResult?.payload?.sid) {
      return {
        data: null,
        error: {
          message: 'Expired session token is missing the `sid` claim.',
          cause: { reason: RefreshTokenErrorReason.ExpiredSessionTokenMissingSidClaim },
        },
      };
    }

    try {
      // Perform the actual token refresh.
      const response = await options.apiClient.sessions.refreshSession(decodeResult.payload.sid, {
        format: 'cookie',
        suffixed_cookies: authenticateContext.usesSuffixedCookies(),
        expired_token: expiredSessionToken || '',
        refresh_token: refreshToken || '',
        request_origin: authenticateContext.clerkUrl.origin,
        // The refresh endpoint expects headers as Record<string, string[]>, so we need to transform it.
        request_headers: Object.fromEntries(Array.from(request.headers.entries()).map(([k, v]) => [k, [v]])),
      });
      return { data: response.cookies, error: null };
    } catch (err: any) {
      if (err?.errors?.length) {
        if (err.errors[0].code === 'unexpected_error') {
          return {
            data: null,
            error: {
              message: `Fetch unexpected error`,
              cause: { reason: RefreshTokenErrorReason.FetchError, errors: err.errors },
            },
          };
        }
        return {
          data: null,
          error: {
            message: err.errors[0].code,
            cause: { reason: err.errors[0].code, errors: err.errors },
          },
        };
      } else {
        return {
          data: null,
          error: {
            message: `Unexpected Server/BAPI error`,
            cause: { reason: RefreshTokenErrorReason.UnexpectedBAPIError, errors: [err] },
          },
        };
      }
    }
  }

  async function attemptRefresh(
    authenticateContext: AuthenticateContext,
  ): Promise<
    | { data: { jwtPayload: JwtPayload; sessionToken: string; headers: Headers }; error: null }
    | { data: null; error: any }
  > {
    const { data: cookiesToSet, error } = await refreshToken(authenticateContext);
    if (!cookiesToSet || cookiesToSet.length === 0) {
      return { data: null, error };
    }

    const headers = new Headers();
    let sessionToken = '';
    cookiesToSet.forEach((x: string) => {
      headers.append('Set-Cookie', x);
      if (getCookieName(x).startsWith(constants.Cookies.Session)) {
        sessionToken = getCookieValue(x);
      }
    });

    // Since we're going to return a signedIn response, we need to decode the data from the new sessionToken.
    const { data: jwtPayload, errors } = await verifyToken(sessionToken, authenticateContext);
    if (errors) {
      return {
        data: null,
        error: {
          message: `Clerk: unable to verify refreshed session token.`,
          cause: { reason: RefreshTokenErrorReason.InvalidSessionToken, errors },
        },
      };
    }
    return { data: { jwtPayload, sessionToken, headers }, error: null };
  }

  function handleMaybeHandshakeStatus(
    authenticateContext: AuthenticateContext,
    reason: string,
    message: string,
    headers?: Headers,
  ): SignedInState | SignedOutState | HandshakeState {
    if (handshakeService.isRequestEligibleForHandshake(authenticateContext)) {
      const handshakeHeaders =
        headers ??
        handshakeService.buildRedirectToHandshake(authenticateContext, organizationSyncTargetMatchers, options, reason);

      if (handshakeHeaders.get(constants.Headers.Location)) {
        handshakeHeaders.set(constants.Headers.CacheControl, 'no-store');
      }

      const isRedirectLoop = handshakeService.setHandshakeInfiniteRedirectionLoopHeaders(handshakeHeaders);
      if (isRedirectLoop) {
        const msg = `Clerk: Refreshing the session token resulted in an infinite redirect loop. This usually means that your Clerk instance keys do not match - make sure to copy the correct publishable and secret keys from the Clerk dashboard.`;
        console.log(msg);
        return signedOut(authenticateContext, reason, message);
      }

      return handshake(authenticateContext, reason, message, handshakeHeaders);
    }

    return signedOut(authenticateContext, reason, message);
  }

  /**
   * Determines if a handshake must occur to resolve a mismatch between the organization as specified
   * by the URL (according to the options) and the actual active organization on the session.
   *
   * @returns {HandshakeState | SignedOutState | null} - The function can return the following:
   *   - {HandshakeState}: If a handshake is needed to resolve the mismatched organization.
   *   - {SignedOutState}: If a handshake is required but cannot be performed.
   *   - {null}:           If no action is required.
   */
  function handleMaybeOrganizationSyncHandshake(
    authenticateContext: AuthenticateContext,
    auth: SignedInAuthObject,
  ): HandshakeState | SignedOutState | null {
    const organizationSyncTarget = getOrganizationSyncTarget(
      authenticateContext.clerkUrl,
      options.organizationSyncOptions,
      organizationSyncTargetMatchers,
    );
    if (!organizationSyncTarget) {
      return null;
    }
    let mustActivate = false;
    if (organizationSyncTarget.type === 'organization') {
      // Activate an org by slug?
      if (organizationSyncTarget.organizationSlug && organizationSyncTarget.organizationSlug !== auth.orgSlug) {
        mustActivate = true;
      }
      // Activate an org by ID?
      if (organizationSyncTarget.organizationId && organizationSyncTarget.organizationId !== auth.orgId) {
        mustActivate = true;
      }
    }
    // Activate the personal account?
    if (organizationSyncTarget.type === 'personalAccount' && auth.orgId) {
      mustActivate = true;
    }
    if (!mustActivate) {
      return null;
    }
    if (authenticateContext.handshakeRedirectLoopCounter > 0) {
      // We have an organization that needs to be activated, but this isn't our first time redirecting.
      // This is because we attempted to activate the organization previously, but the organization
      // must not have been valid (either not found, or not valid for this user), and gave us back
      // a null organization. We won't re-try the handshake, and leave it to the server component to handle.
      console.warn(
        'Clerk: Organization activation handshake loop detected. This is likely due to an invalid organization ID or slug. Skipping organization activation.',
      );
      return null;
    }
    const handshakeState = handleMaybeHandshakeStatus(
      authenticateContext,
      AuthErrorReason.ActiveOrganizationMismatch,
      '',
    );
    if (handshakeState.status !== 'handshake') {
      // Currently, this is only possible if we're in a redirect loop, but the above check should guard against that.
      return null;
    }
    return handshakeState;
  }

  async function authenticateRequestWithTokenInHeader() {
    const { sessionTokenInHeader } = authenticateContext;

    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { data, errors } = await verifyToken(sessionTokenInHeader!, authenticateContext);
      if (errors) {
        throw errors[0];
      }
      // use `await` to force this try/catch handle the signedIn invocation
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return signedIn(authenticateContext, data, undefined, sessionTokenInHeader!);
    } catch (err) {
      return handleError(err, 'header');
    }
  }

  async function authenticateRequestWithTokenInCookie() {
    const hasActiveClient = authenticateContext.clientUat;
    const hasSessionToken = !!authenticateContext.sessionTokenInCookie;
    const hasDevBrowserToken = !!authenticateContext.devBrowserToken;

    /**
     * If we have a handshakeToken, resolve the handshake and attempt to return a definitive signed in or signed out state.
     */
    if (authenticateContext.handshakeToken) {
      try {
        return await handshakeService.resolveHandshake(authenticateContext);
      } catch (error) {
        if (error instanceof TokenVerificationError && authenticateContext.instanceType === 'development') {
          handshakeService.handleHandshakeTokenVerificationErrorInDevelopment(error);
        } else {
          console.error('Clerk: unable to resolve handshake:', error);
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

    const isRequestEligibleForMultiDomainSync =
      authenticateContext.isSatellite && authenticateContext.secFetchDest === 'document';

    /**
     * Begin multi-domain sync flows
     */
    if (authenticateContext.instanceType === 'production' && isRequestEligibleForMultiDomainSync) {
      return handleMaybeHandshakeStatus(authenticateContext, AuthErrorReason.SatelliteCookieNeedsSyncing, '');
    }

    // Multi-domain development sync flow
    if (
      authenticateContext.instanceType === 'development' &&
      isRequestEligibleForMultiDomainSync &&
      !authenticateContext.clerkUrl.searchParams.has(constants.QueryParameters.ClerkSynced)
    ) {
      // initiate MD sync

      // signInUrl exists, checked at the top of `authenticateRequest`
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const redirectURL = new URL(authenticateContext.signInUrl!);
      redirectURL.searchParams.append(
        constants.QueryParameters.ClerkRedirectUrl,
        authenticateContext.clerkUrl.toString(),
      );
      const headers = new Headers({ [constants.Headers.Location]: redirectURL.toString() });
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

      const headers = new Headers({ [constants.Headers.Location]: redirectBackToSatelliteUrl.toString() });
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

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { data: decodeResult, errors: decodedErrors } = decodeJwt(authenticateContext.sessionTokenInCookie!);

    if (decodedErrors) {
      return handleError(decodedErrors[0], 'cookie');
    }

    if (decodeResult.payload.iat < authenticateContext.clientUat) {
      return handleMaybeHandshakeStatus(authenticateContext, AuthErrorReason.SessionTokenIATBeforeClientUAT, '');
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { data, errors } = await verifyToken(authenticateContext.sessionTokenInCookie!, authenticateContext);
      if (errors) {
        throw errors[0];
      }
      const signedInRequestState = signedIn(
        authenticateContext,
        data,
        undefined,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        authenticateContext.sessionTokenInCookie!,
      );

      // Org sync if necessary
      const handshakeRequestState = handleMaybeOrganizationSyncHandshake(
        authenticateContext,
        signedInRequestState.toAuth(),
      );
      if (handshakeRequestState) {
        return handshakeRequestState;
      }

      return signedInRequestState;
    } catch (err) {
      return handleError(err, 'cookie');
    }

    return signedOut(authenticateContext, AuthErrorReason.UnexpectedError);
  }

  async function handleError(
    err: unknown,
    tokenCarrier: TokenCarrier,
  ): Promise<SignedInState | SignedOutState | HandshakeState> {
    if (!(err instanceof TokenVerificationError)) {
      return signedOut(authenticateContext, AuthErrorReason.UnexpectedError);
    }

    let refreshError: string | null;

    if (isRequestEligibleForRefresh(err, authenticateContext, request)) {
      const { data, error } = await attemptRefresh(authenticateContext);
      if (data) {
        return signedIn(authenticateContext, data.jwtPayload, data.headers, data.sessionToken);
      }

      // If there's any error, simply fallback to the handshake flow including the reason as a query parameter.
      if (error?.cause?.reason) {
        refreshError = error.cause.reason;
      } else {
        refreshError = RefreshTokenErrorReason.UnexpectedSDKError;
      }
    } else {
      if (request.method !== 'GET') {
        refreshError = RefreshTokenErrorReason.NonEligibleNonGet;
      } else if (!authenticateContext.refreshTokenInCookie) {
        refreshError = RefreshTokenErrorReason.NonEligibleNoCookie;
      } else {
        //refresh error is not applicable if token verification error is not 'session-token-expired'
        refreshError = null;
      }
    }

    err.tokenCarrier = tokenCarrier;

    const reasonToHandshake = [
      TokenVerificationErrorReason.TokenExpired,
      TokenVerificationErrorReason.TokenNotActiveYet,
      TokenVerificationErrorReason.TokenIatInTheFuture,
    ].includes(err.reason);

    if (reasonToHandshake) {
      return handleMaybeHandshakeStatus(
        authenticateContext,
        convertTokenVerificationErrorReasonToAuthErrorReason({ tokenError: err.reason, refreshError }),
        err.getFullMessage(),
      );
    }

    return signedOut(authenticateContext, err.reason, err.getFullMessage());
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

type OrganizationSyncTargetMatchers = {
  OrganizationMatcher: MatchFunction<Partial<Record<string, string | string[]>>> | null;
  PersonalAccountMatcher: MatchFunction<Partial<Record<string, string | string[]>>> | null;
};

/**
 * Computes regex-based matchers from the given organization sync options.
 */
export function computeOrganizationSyncTargetMatchers(
  options: OrganizationSyncOptions | undefined,
): OrganizationSyncTargetMatchers {
  let personalAccountMatcher: MatchFunction<Partial<Record<string, string | string[]>>> | null = null;
  if (options?.personalAccountPatterns) {
    try {
      personalAccountMatcher = match(options.personalAccountPatterns);
    } catch (e) {
      // Likely to be encountered during development, so throwing the error is more prudent than logging
      throw new Error(`Invalid personal account pattern "${options.personalAccountPatterns}": "${e}"`);
    }
  }

  let organizationMatcher: MatchFunction<Partial<Record<string, string | string[]>>> | null = null;
  if (options?.organizationPatterns) {
    try {
      organizationMatcher = match(options.organizationPatterns);
    } catch (e) {
      // Likely to be encountered during development, so throwing the error is more prudent than logging
      throw new Error(`Clerk: Invalid organization pattern "${options.organizationPatterns}": "${e}"`);
    }
  }

  return {
    OrganizationMatcher: organizationMatcher,
    PersonalAccountMatcher: personalAccountMatcher,
  };
}

/**
 * Determines if the given URL and settings indicate a desire to activate a specific
 * organization or personal account.
 *
 * @param url - The URL of the original request.
 * @param options - The organization sync options.
 * @param matchers - The matchers for the organization and personal account patterns, as generated by `computeOrganizationSyncTargetMatchers`.
 */
export function getOrganizationSyncTarget(
  url: URL,
  options: OrganizationSyncOptions | undefined,
  matchers: OrganizationSyncTargetMatchers,
): OrganizationSyncTarget | null {
  if (!options) {
    return null;
  }

  // Check for organization activation
  if (matchers.OrganizationMatcher) {
    let orgResult: Match<Partial<Record<string, string | string[]>>>;
    try {
      orgResult = matchers.OrganizationMatcher(url.pathname);
    } catch (e) {
      // Intentionally not logging the path to avoid potentially leaking anything sensitive
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

  // Check for personal account activation
  if (matchers.PersonalAccountMatcher) {
    let personalResult: Match<Partial<Record<string, string | string[]>>>;
    try {
      personalResult = matchers.PersonalAccountMatcher(url.pathname);
    } catch (e) {
      // Intentionally not logging the path to avoid potentially leaking anything sensitive
      console.error(`Failed to apply personal account pattern "${options.personalAccountPatterns}" to a path`, e);
      return null;
    }

    if (personalResult) {
      return { type: 'personalAccount' };
    }
  }
  return null;
}

/**
 * Represents an organization or a personal account - e.g. an
 * entity that can be activated by the handshake API.
 */
export type OrganizationSyncTarget =
  | { type: 'personalAccount' }
  | { type: 'organization'; organizationId?: string; organizationSlug?: string };

const convertTokenVerificationErrorReasonToAuthErrorReason = ({
  tokenError,
  refreshError,
}: {
  tokenError: TokenVerificationErrorReason;
  refreshError: string | null;
}): string => {
  switch (tokenError) {
    case TokenVerificationErrorReason.TokenExpired:
      return `${AuthErrorReason.SessionTokenExpired}-refresh-${refreshError}`;
    case TokenVerificationErrorReason.TokenNotActiveYet:
      return AuthErrorReason.SessionTokenNBF;
    case TokenVerificationErrorReason.TokenIatInTheFuture:
      return AuthErrorReason.SessionTokenIatInTheFuture;
    default:
      return AuthErrorReason.UnexpectedError;
  }
};
