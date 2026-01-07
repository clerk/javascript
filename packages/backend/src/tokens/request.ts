import type { JwtPayload } from '@clerk/shared/types';

import { constants } from '../constants';
import type { TokenCarrier } from '../errors';
import { MachineTokenVerificationError, TokenVerificationError, TokenVerificationErrorReason } from '../errors';
import { decodeJwt } from '../jwt/verifyJwt';
import { assertValidSecretKey } from '../util/optionsAssertions';
import { isDevelopmentFromSecretKey } from '../util/shared';
import type { AuthenticateContext } from './authenticateContext';
import { createAuthenticateContext } from './authenticateContext';
import type { SignedInAuthObject } from './authObjects';
import type { HandshakeState, RequestState, SignedInState, SignedOutState, UnauthenticatedState } from './authStatus';
import { AuthErrorReason, handshake, signedIn, signedOut, signedOutInvalidToken } from './authStatus';
import { createClerkRequest } from './clerkRequest';
import { getCookieName, getCookieValue } from './cookie';
import { HandshakeService } from './handshake';
import { getMachineTokenType, isMachineToken, isTokenTypeAccepted } from './machine';
import { OrganizationMatcher } from './organizationMatcher';
import type { MachineTokenType, SessionTokenType } from './tokenTypes';
import { TokenType } from './tokenTypes';
import type { AuthenticateRequestOptions } from './types';
import { verifyMachineAuthToken, verifyToken } from './verify';

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

function assertMachineSecretOrSecretKey(authenticateContext: AuthenticateContext) {
  if (!authenticateContext.machineSecretKey && !authenticateContext.secretKey) {
    throw new Error(
      'Machine token authentication requires either a Machine secret key or a Clerk secret key. ' +
        'Ensure a Clerk secret key or Machine secret key is set.',
    );
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

function checkTokenTypeMismatch(
  parsedTokenType: MachineTokenType,
  acceptsToken: NonNullable<AuthenticateRequestOptions['acceptsToken']>,
  authenticateContext: AuthenticateContext,
): UnauthenticatedState<MachineTokenType> | null {
  const mismatch = !isTokenTypeAccepted(parsedTokenType, acceptsToken);
  if (mismatch) {
    const tokenTypeToReturn = (typeof acceptsToken === 'string' ? acceptsToken : parsedTokenType) as MachineTokenType;
    return signedOut({
      tokenType: tokenTypeToReturn,
      authenticateContext,
      reason: AuthErrorReason.TokenTypeMismatch,
    });
  }
  return null;
}

function isTokenTypeInAcceptedArray(acceptsToken: TokenType[], authenticateContext: AuthenticateContext): boolean {
  let parsedTokenType: TokenType | null = null;
  const { tokenInHeader } = authenticateContext;
  if (tokenInHeader) {
    if (isMachineToken(tokenInHeader)) {
      parsedTokenType = getMachineTokenType(tokenInHeader);
    } else {
      parsedTokenType = TokenType.SessionToken;
    }
  }
  const typeToCheck = parsedTokenType ?? TokenType.SessionToken;
  return isTokenTypeAccepted(typeToCheck, acceptsToken);
}

export interface AuthenticateRequest {
  /**
   * @example
   * clerkClient.authenticateRequest(request, { acceptsToken: ['session_token', 'api_key'] });
   */
  <T extends readonly TokenType[]>(
    request: Request,
    options: AuthenticateRequestOptions & { acceptsToken: T },
  ): Promise<RequestState<T[number] | null>>;

  /**
   * @example
   * clerkClient.authenticateRequest(request, { acceptsToken: 'session_token' });
   */
  <T extends TokenType>(
    request: Request,
    options: AuthenticateRequestOptions & { acceptsToken: T },
  ): Promise<RequestState<T>>;

  /**
   * @example
   * clerkClient.authenticateRequest(request, { acceptsToken: 'any' });
   */
  (request: Request, options: AuthenticateRequestOptions & { acceptsToken: 'any' }): Promise<RequestState<TokenType>>;

  /**
   * @example
   * clerkClient.authenticateRequest(request);
   */
  (request: Request, options?: AuthenticateRequestOptions): Promise<RequestState<SessionTokenType>>;
}

export const authenticateRequest: AuthenticateRequest = (async (
  request: Request,
  options: AuthenticateRequestOptions,
): Promise<RequestState<TokenType> | UnauthenticatedState<null>> => {
  const authenticateContext = await createAuthenticateContext(createClerkRequest(request), options);

  // Default tokenType is session_token for backwards compatibility.
  const acceptsToken = options.acceptsToken ?? TokenType.SessionToken;

  // machine-to-machine tokens can accept a machine secret or a secret key
  if (acceptsToken !== TokenType.M2MToken) {
    assertValidSecretKey(authenticateContext.secretKey);

    if (authenticateContext.isSatellite) {
      assertSignInUrlExists(authenticateContext.signInUrl, authenticateContext.secretKey);
      if (authenticateContext.signInUrl && authenticateContext.origin) {
        assertSignInUrlFormatAndOrigin(authenticateContext.signInUrl, authenticateContext.origin);
      }
      assertProxyUrlOrDomain(authenticateContext.proxyUrl || authenticateContext.domain);
    }
  }

  // Make sure a machine secret or instance secret key is provided if acceptsToken is m2m_token
  if (acceptsToken === TokenType.M2MToken) {
    assertMachineSecretOrSecretKey(authenticateContext);
  }

  const organizationMatcher = new OrganizationMatcher(options.organizationSyncOptions);
  const handshakeService = new HandshakeService(
    authenticateContext,
    { organizationSyncOptions: options.organizationSyncOptions },
    organizationMatcher,
  );

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
    if (!handshakeService.isRequestEligibleForHandshake()) {
      return signedOut({
        tokenType: TokenType.SessionToken,
        authenticateContext,
        reason,
        message,
      });
    }

    // Right now the only usage of passing in different headers is for multi-domain sync, which redirects somewhere else.
    // In the future if we want to decorate the handshake redirect with additional headers per call we need to tweak this logic.
    const handshakeHeaders = headers ?? handshakeService.buildRedirectToHandshake(reason);

    // Chrome aggressively caches inactive tabs. If we don't set the header here,
    // all 307 redirects will be cached and the handshake will end up in an infinite loop.
    if (handshakeHeaders.get(constants.Headers.Location)) {
      handshakeHeaders.set(constants.Headers.CacheControl, 'no-store');
    }

    // Introduce the mechanism to protect for infinite handshake redirect loops
    // using a cookie and returning true if it's infinite redirect loop or false if we can
    // proceed with triggering handshake.
    const isRedirectLoop = handshakeService.checkAndTrackRedirectLoop(handshakeHeaders);
    if (isRedirectLoop) {
      const msg = `Clerk: Refreshing the session token resulted in an infinite redirect loop. This usually means that your Clerk instance keys do not match - make sure to copy the correct publishable and secret keys from the Clerk dashboard.`;
      console.log(msg);
      return signedOut({
        tokenType: TokenType.SessionToken,
        authenticateContext,
        reason,
        message,
      });
    }

    return handshake(authenticateContext, reason, message, handshakeHeaders);
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
    const organizationSyncTarget = organizationMatcher.findTarget(authenticateContext.clerkUrl);
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
    if (authenticateContext.handshakeRedirectLoopCounter >= 3) {
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
    const { tokenInHeader } = authenticateContext;

    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { data, errors } = await verifyToken(tokenInHeader!, authenticateContext);
      if (errors) {
        throw errors[0];
      }
      // use `await` to force this try/catch handle the signedIn invocation
      return signedIn({
        tokenType: TokenType.SessionToken,
        authenticateContext,
        sessionClaims: data,
        headers: new Headers(),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        token: tokenInHeader!,
      });
    } catch (err) {
      return handleSessionTokenError(err, 'header');
    }
  }

  async function authenticateRequestWithTokenInCookie() {
    const hasActiveClient = authenticateContext.clientUat;
    const hasSessionToken = !!authenticateContext.sessionTokenInCookie;
    const hasDevBrowserToken = !!authenticateContext.devBrowserToken;

    /**
     * If we have a handshakeToken, resolve the handshake and attempt to return a definitive signed in or signed out state.
     */
    if (authenticateContext.handshakeNonce || authenticateContext.handshakeToken) {
      try {
        return await handshakeService.resolveHandshake();
      } catch (error) {
        // In production, the handshake token is being transferred as a cookie, so there is a possibility of collision
        // with a handshake token of another app running on the same etld+1 domain.
        // For example, if one app is running on sub1.clerk.com and another on sub2.clerk.com, the handshake token
        // cookie for both apps will be set on etld+1 (clerk.com) so there's a possibility that one app will accidentally
        // use the handshake token of a different app during the handshake flow.
        // In this scenario, verification will fail with TokenInvalidSignature. In contrast to the development case,
        // we need to allow the flow to continue so the app eventually retries another handshake with the correct token.
        // We need to make sure, however, that we don't allow the flow to continue indefinitely, so we throw an error after X
        // retries to avoid an infinite loop. An infinite loop can happen if the customer switched Clerk keys for their prod app.

        // Check the handleTokenVerificationErrorInDevelopment method for the development case.
        if (error instanceof TokenVerificationError && authenticateContext.instanceType === 'development') {
          handshakeService.handleTokenVerificationErrorInDevelopment(error);
        } else {
          console.error('Clerk: unable to resolve handshake:', error);
        }
      }
    }

    // Only trigger satellite sync handshake if we don't have session cookies.
    // If we have cookies, the client is already linked - fall through to normal
    // verification flow which can leverage the refresh flow for expired tokens
    // instead of requiring a full multi-domain handshake.
    const isLinked = authenticateContext.clientUat && authenticateContext.sessionTokenInCookie;

    const isRequestEligibleForMultiDomainSync =
      authenticateContext.isSatellite && authenticateContext.secFetchDest === 'document' && !isLinked;

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

    // Multi-domain development sync flow - primary responds to syncing
    // IMPORTANT: This must come BEFORE dev-browser-sync check to avoid the root domain
    // triggering its own handshakes when it's in the middle of handling a satellite sync request
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

    /**
     * Otherwise, check for "known unknown" auth states that we can resolve with a handshake.
     */
    if (
      authenticateContext.instanceType === 'development' &&
      authenticateContext.clerkUrl.searchParams.has(constants.QueryParameters.DevBrowser)
    ) {
      return handleMaybeHandshakeStatus(authenticateContext, AuthErrorReason.DevBrowserSync, '');
    }

    if (authenticateContext.instanceType === 'development' && !hasDevBrowserToken) {
      return handleMaybeHandshakeStatus(authenticateContext, AuthErrorReason.DevBrowserMissing, '');
    }

    if (!hasActiveClient && !hasSessionToken) {
      return signedOut({
        tokenType: TokenType.SessionToken,
        authenticateContext,
        reason: AuthErrorReason.SessionTokenAndUATMissing,
      });
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
      return handleSessionTokenError(decodedErrors[0], 'cookie');
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

      const signedInRequestState = signedIn({
        tokenType: TokenType.SessionToken,
        authenticateContext,
        sessionClaims: data,
        headers: new Headers(),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        token: authenticateContext.sessionTokenInCookie!,
      });

      // Check for cross-origin requests from satellite domains to primary domain
      const shouldForceHandshakeForCrossDomain =
        !authenticateContext.isSatellite && // We're on primary
        authenticateContext.secFetchDest === 'document' && // Document navigation
        authenticateContext.isCrossOriginReferrer() && // Came from different domain
        !authenticateContext.isKnownClerkReferrer() && // Not from Clerk accounts portal or FAPI
        authenticateContext.handshakeRedirectLoopCounter === 0; // Not in a redirect loop

      if (shouldForceHandshakeForCrossDomain) {
        return handleMaybeHandshakeStatus(
          authenticateContext,
          AuthErrorReason.PrimaryDomainCrossOriginSync,
          'Cross-origin request from satellite domain requires handshake',
        );
      }

      const authObject = signedInRequestState.toAuth();
      // Org sync if necessary
      if (authObject.userId) {
        const handshakeRequestState = handleMaybeOrganizationSyncHandshake(authenticateContext, authObject);
        if (handshakeRequestState) {
          return handshakeRequestState;
        }
      }

      return signedInRequestState;
    } catch (err) {
      return handleSessionTokenError(err, 'cookie');
    }

    // Unreachable
    return signedOut({
      tokenType: TokenType.SessionToken,
      authenticateContext,
      reason: AuthErrorReason.UnexpectedError,
    });
  }

  async function handleSessionTokenError(
    err: unknown,
    tokenCarrier: TokenCarrier,
  ): Promise<SignedInState | SignedOutState | HandshakeState> {
    if (!(err instanceof TokenVerificationError)) {
      return signedOut({
        tokenType: TokenType.SessionToken,
        authenticateContext,
        reason: AuthErrorReason.UnexpectedError,
      });
    }

    let refreshError: string | null;

    if (isRequestEligibleForRefresh(err, authenticateContext, request)) {
      const { data, error } = await attemptRefresh(authenticateContext);
      if (data) {
        return signedIn({
          tokenType: TokenType.SessionToken,
          authenticateContext,
          sessionClaims: data.jwtPayload,
          headers: data.headers,
          token: data.sessionToken,
        });
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

    return signedOut({
      tokenType: TokenType.SessionToken,
      authenticateContext,
      reason: err.reason,
      message: err.getFullMessage(),
    });
  }

  function handleMachineError(tokenType: MachineTokenType, err: unknown): UnauthenticatedState<MachineTokenType> {
    if (!(err instanceof MachineTokenVerificationError)) {
      return signedOut({
        tokenType,
        authenticateContext,
        reason: AuthErrorReason.UnexpectedError,
      });
    }

    return signedOut({
      tokenType,
      authenticateContext,
      reason: err.code,
      message: err.getFullMessage(),
    });
  }

  async function authenticateMachineRequestWithTokenInHeader() {
    const { tokenInHeader } = authenticateContext;
    // Use session token error handling if no token in header (default behavior)
    if (!tokenInHeader) {
      return handleSessionTokenError(new Error('Missing token in header'), 'header');
    }

    // Handle case where tokenType is any and the token is not a machine token
    if (!isMachineToken(tokenInHeader)) {
      return signedOut({
        tokenType: acceptsToken as TokenType,
        authenticateContext,
        reason: AuthErrorReason.TokenTypeMismatch,
        message: '',
      });
    }

    const parsedTokenType = getMachineTokenType(tokenInHeader);
    const mismatchState = checkTokenTypeMismatch(parsedTokenType, acceptsToken, authenticateContext);
    if (mismatchState) {
      return mismatchState;
    }

    const { data, tokenType, errors } = await verifyMachineAuthToken(tokenInHeader, authenticateContext);
    if (errors) {
      return handleMachineError(tokenType, errors[0]);
    }
    return signedIn({
      tokenType,
      authenticateContext,
      machineData: data,
      token: tokenInHeader,
    });
  }

  async function authenticateAnyRequestWithTokenInHeader() {
    const { tokenInHeader } = authenticateContext;
    // Use session token error handling if no token in header (default behavior)
    if (!tokenInHeader) {
      return handleSessionTokenError(new Error('Missing token in header'), 'header');
    }

    // Handle as a machine token
    if (isMachineToken(tokenInHeader)) {
      const parsedTokenType = getMachineTokenType(tokenInHeader);
      const mismatchState = checkTokenTypeMismatch(parsedTokenType, acceptsToken, authenticateContext);
      if (mismatchState) {
        return mismatchState;
      }

      const { data, tokenType, errors } = await verifyMachineAuthToken(tokenInHeader, authenticateContext);
      if (errors) {
        return handleMachineError(tokenType, errors[0]);
      }

      return signedIn({
        tokenType,
        authenticateContext,
        machineData: data,
        token: tokenInHeader,
      });
    }

    // Handle as a regular session token
    const { data, errors } = await verifyToken(tokenInHeader, authenticateContext);
    if (errors) {
      return handleSessionTokenError(errors[0], 'header');
    }

    return signedIn({
      tokenType: TokenType.SessionToken,
      authenticateContext,
      sessionClaims: data,
      token: tokenInHeader,
    });
  }

  // If acceptsToken is an array, early check if the token is in the accepted array
  // to avoid unnecessary verification calls
  if (Array.isArray(acceptsToken)) {
    if (!isTokenTypeInAcceptedArray(acceptsToken, authenticateContext)) {
      return signedOutInvalidToken();
    }
  }

  if (authenticateContext.tokenInHeader) {
    if (acceptsToken === 'any') {
      return authenticateAnyRequestWithTokenInHeader();
    }
    if (acceptsToken === TokenType.SessionToken) {
      return authenticateRequestWithTokenInHeader();
    }
    return authenticateMachineRequestWithTokenInHeader();
  }

  // Machine requests cannot have the token in the cookie, it must be in header.
  if (
    acceptsToken === TokenType.OAuthToken ||
    acceptsToken === TokenType.ApiKey ||
    acceptsToken === TokenType.M2MToken
  ) {
    return signedOut({
      tokenType: acceptsToken,
      authenticateContext,
      reason: 'No token in header',
    });
  }

  return authenticateRequestWithTokenInCookie();
}) as AuthenticateRequest;

/**
 * @internal
 */
export const debugRequestState = (params: RequestState) => {
  const { isSignedIn, isAuthenticated, proxyUrl, reason, message, publishableKey, isSatellite, domain } = params;
  return { isSignedIn, isAuthenticated, proxyUrl, reason, message, publishableKey, isSatellite, domain };
};

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
