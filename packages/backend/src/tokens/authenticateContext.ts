import type { Jwt } from '@clerk/types';

import { constants } from '../constants';
import { decodeJwt } from '../jwt/verifyJwt';
import { runtime } from '../runtime';
import { assertValidPublishableKey } from '../util/optionsAssertions';
import { getCookieSuffix, getSuffixedCookieName, parsePublishableKey } from '../util/shared';
import type { ClerkRequest } from './clerkRequest';
import type { AuthenticateRequestOptions } from './types';

/**
 * Interface defining the structure of authentication context data.
 * Contains all necessary information for request authentication including
 * headers, cookies, and handshake-related values.
 */
interface AuthenticateContext extends AuthenticateRequestOptions {
  // header-based values
  sessionTokenInHeader: string | undefined;
  origin: string | undefined;
  host: string | undefined;
  forwardedHost: string | undefined;
  forwardedProto: string | undefined;
  referrer: string | undefined;
  userAgent: string | undefined;
  secFetchDest: string | undefined;
  accept: string | undefined;
  // cookie-based values
  sessionTokenInCookie: string | undefined;
  refreshTokenInCookie: string | undefined;
  clientUat: number;
  // handshake-related values
  devBrowserToken: string | undefined;
  handshakeNonce: string | undefined;
  handshakeToken: string | undefined;
  handshakeRedirectLoopCounter: number;

  // url derived from headers
  clerkUrl: URL;
  // enforce existence of the following props
  publishableKey: string;
  instanceType: string;
  frontendApi: string;
}

/**
 * Class responsible for managing authentication context data and determining
 * the authentication state of a request. Handles session tokens, cookies,
 * headers, and handshake-related operations.
 */
class AuthenticateContext implements AuthenticateContext {
  /**
   * Retrieves the session token from either the cookie or the header.
   * Prioritizes cookie-based tokens over header-based ones.
   *
   * @returns {string | undefined} The session token if available, otherwise undefined.
   */
  public get sessionToken(): string | undefined {
    return this.sessionTokenInCookie || this.sessionTokenInHeader;
  }

  /**
   * Creates a new instance of AuthenticateContext.
   * Initializes all necessary authentication data from cookies, headers, and options.
   *
   * @param {string} cookieSuffix - The suffix to use for cookie names
   * @param {ClerkRequest} clerkRequest - The request object containing headers and cookies
   * @param {AuthenticateRequestOptions} options - Configuration options for authentication
   */
  public constructor(
    private cookieSuffix: string,
    private clerkRequest: ClerkRequest,
    options: AuthenticateRequestOptions,
  ) {
    // Even though the options are assigned to this later in this function
    // we set the publishableKey here because it is being used in cookies/headers/handshake-values
    // as part of getMultipleAppsCookie
    this.initPublishableKeyValues(options);
    this.initHeaderValues();
    // initCookieValues should be used before initHandshakeValues because it depends on suffixedCookies
    this.initCookieValues();
    this.initHandshakeValues();
    Object.assign(this, options);
    this.clerkUrl = this.clerkRequest.clerkUrl;
  }

  /**
   * Determines whether to use suffixed or unsuffixed cookies for authentication.
   * Implements complex logic to handle various edge cases and migration scenarios.
   *
   * @returns {boolean} True if suffixed cookies should be used, false otherwise
   */
  public usesSuffixedCookies(): boolean {
    const suffixedClientUat = this.getSuffixedCookie(constants.Cookies.ClientUat);
    const clientUat = this.getCookie(constants.Cookies.ClientUat);
    const suffixedSession = this.getSuffixedCookie(constants.Cookies.Session) || '';
    const session = this.getCookie(constants.Cookies.Session) || '';

    // In the case of malformed session cookies (eg missing the iss claim), we should
    // use the un-suffixed cookies to return signed-out state instead of triggering
    // handshake
    if (session && !this.tokenHasIssuer(session)) {
      return false;
    }

    // If there's a token in un-suffixed, and it doesn't belong to this
    // instance, then we must trust suffixed
    if (session && !this.tokenBelongsToInstance(session)) {
      return true;
    }

    // If there are no suffixed cookies use un-suffixed
    if (!suffixedClientUat && !suffixedSession) {
      return false;
    }

    const { data: sessionData } = decodeJwt(session);
    const sessionIat = sessionData?.payload.iat || 0;
    const { data: suffixedSessionData } = decodeJwt(suffixedSession);
    const suffixedSessionIat = suffixedSessionData?.payload.iat || 0;

    // Both indicate signed in, but un-suffixed is newer
    // Trust un-suffixed because it's newer
    if (suffixedClientUat !== '0' && clientUat !== '0' && sessionIat > suffixedSessionIat) {
      return false;
    }

    // Suffixed indicates signed out, but un-suffixed indicates signed in
    // Trust un-suffixed because it gets set with both new and old clerk.js,
    // so we can assume it's newer
    if (suffixedClientUat === '0' && clientUat !== '0') {
      return false;
    }

    // Suffixed indicates signed in, un-suffixed indicates signed out
    // This is the tricky one

    // In production, suffixed_uat should be set reliably, since it's
    // set by FAPI and not clerk.js. So in the scenario where a developer
    // downgrades, the state will look like this:
    // - un-suffixed session cookie: empty
    // - un-suffixed uat: 0
    // - suffixed session cookie: (possibly filled, possibly empty)
    // - suffixed uat: 0

    // Our SDK honors client_uat over the session cookie, so we don't
    // need a special case for production. We can rely on suffixed,
    // and the fact that the suffixed uat is set properly means and
    // suffixed session cookie will be ignored.

    // The important thing to make sure we have a test that confirms
    // the user ends up as signed out in this scenario, and the suffixed
    // session cookie is ignored

    // In development, suffixed_uat is not set reliably, since it's done
    // by clerk.js. If the developer downgrades to a pinned version of
    // clerk.js, the suffixed uat will no longer be updated

    // The best we can do is look to see if the suffixed token is expired.
    // This means that, if a developer downgrades, and then immediately
    // signs out, all in the span of 1 minute, then they will inadvertently
    // remain signed in for the rest of that minute. This is a known
    // limitation of the strategy but seems highly unlikely.
    if (this.instanceType !== 'production') {
      const isSuffixedSessionExpired = this.sessionExpired(suffixedSessionData);
      if (suffixedClientUat !== '0' && clientUat === '0' && isSuffixedSessionExpired) {
        return false;
      }
    }

    // If a suffixed session cookie exists but the corresponding client_uat cookie is missing, fallback to using
    // unsuffixed cookies.
    // This handles the scenario where an app has been deployed using an SDK version that supports suffixed
    // cookies, but FAPI for its Clerk instance has the feature disabled (eg: if we need to temporarily disable the feature).
    if (!suffixedClientUat && suffixedSession) {
      return false;
    }

    return true;
  }

  /**
   * Initializes publishable key related values and validates the key.
   * Sets up instance type and frontend API information.
   *
   * @param {AuthenticateRequestOptions} options - Configuration options containing the publishable key
   * @throws {Error} If the publishable key is invalid
   */
  private initPublishableKeyValues(options: AuthenticateRequestOptions) {
    assertValidPublishableKey(options.publishableKey);
    this.publishableKey = options.publishableKey;

    const pk = parsePublishableKey(this.publishableKey, {
      fatal: true,
      proxyUrl: options.proxyUrl,
      domain: options.domain,
    });
    this.instanceType = pk.instanceType;
    this.frontendApi = pk.frontendApi;
  }

  /**
   * Initializes header-based values from the request.
   * Extracts and processes various HTTP headers for authentication.
   */
  private initHeaderValues() {
    this.sessionTokenInHeader = this.parseAuthorizationHeader(this.getHeader(constants.Headers.Authorization));
    this.origin = this.getHeader(constants.Headers.Origin);
    this.host = this.getHeader(constants.Headers.Host);
    this.forwardedHost = this.getHeader(constants.Headers.ForwardedHost);
    this.forwardedProto =
      this.getHeader(constants.Headers.CloudFrontForwardedProto) || this.getHeader(constants.Headers.ForwardedProto);
    this.referrer = this.getHeader(constants.Headers.Referrer);
    this.userAgent = this.getHeader(constants.Headers.UserAgent);
    this.secFetchDest = this.getHeader(constants.Headers.SecFetchDest);
    this.accept = this.getHeader(constants.Headers.Accept);
  }

  /**
   * Initializes cookie-based values from the request.
   * Handles both suffixed and unsuffixed cookies based on the current configuration.
   */
  private initCookieValues() {
    // suffixedCookies needs to be set first because it's used in getMultipleAppsCookie
    this.sessionTokenInCookie = this.getSuffixedOrUnSuffixedCookie(constants.Cookies.Session);
    this.refreshTokenInCookie = this.getSuffixedCookie(constants.Cookies.Refresh);
    this.clientUat = Number.parseInt(this.getSuffixedOrUnSuffixedCookie(constants.Cookies.ClientUat) || '') || 0;
  }

  /**
   * Initializes handshake-related values from the request.
   * Processes dev browser tokens, handshake tokens, and nonce values.
   */
  private initHandshakeValues() {
    this.devBrowserToken =
      this.getQueryParam(constants.QueryParameters.DevBrowser) ||
      this.getSuffixedOrUnSuffixedCookie(constants.Cookies.DevBrowser);
    // Using getCookie since we don't suffix the handshake token cookie
    this.handshakeToken =
      this.getQueryParam(constants.QueryParameters.Handshake) || this.getCookie(constants.Cookies.Handshake);
    this.handshakeRedirectLoopCounter = Number(this.getCookie(constants.Cookies.RedirectCount)) || 0;
    this.handshakeNonce =
      this.getQueryParam(constants.QueryParameters.HandshakeNonce) || this.getCookie(constants.Cookies.HandshakeNonce);
  }

  /**
   * Retrieves a query parameter value from the request URL.
   *
   * @param {string} name - The name of the query parameter
   * @returns {string | null} The value of the query parameter or null if not found
   */
  private getQueryParam(name: string) {
    return this.clerkRequest.clerkUrl.searchParams.get(name);
  }

  /**
   * Retrieves a header value from the request.
   *
   * @param {string} name - The name of the header
   * @returns {string | undefined} The value of the header or undefined if not found
   */
  private getHeader(name: string) {
    return this.clerkRequest.headers.get(name) || undefined;
  }

  /**
   * Retrieves a cookie value from the request.
   *
   * @param {string} name - The name of the cookie
   * @returns {string | undefined} The value of the cookie or undefined if not found
   */
  private getCookie(name: string) {
    return this.clerkRequest.cookies.get(name) || undefined;
  }

  /**
   * Retrieves a suffixed cookie value from the request.
   *
   * @param {string} name - The base name of the cookie
   * @returns {string | undefined} The value of the suffixed cookie or undefined if not found
   */
  private getSuffixedCookie(name: string) {
    return this.getCookie(getSuffixedCookieName(name, this.cookieSuffix)) || undefined;
  }

  /**
   * Retrieves either a suffixed or unsuffixed cookie value based on the current configuration.
   *
   * @param {string} cookieName - The base name of the cookie
   * @returns {string | undefined} The value of the cookie or undefined if not found
   */
  private getSuffixedOrUnSuffixedCookie(cookieName: string) {
    if (this.usesSuffixedCookies()) {
      return this.getSuffixedCookie(cookieName);
    }
    return this.getCookie(cookieName);
  }

  /**
   * Parses an Authorization header value to extract the token.
   * Supports both Bearer token and raw token formats.
   *
   * @param {string | undefined | null} authorizationHeader - The Authorization header value
   * @returns {string | undefined} The extracted token or undefined if invalid
   */
  private parseAuthorizationHeader(authorizationHeader: string | undefined | null): string | undefined {
    if (!authorizationHeader) {
      return undefined;
    }

    const [scheme, token] = authorizationHeader.split(' ', 2);

    if (!token) {
      // No scheme specified, treat the entire value as the token
      return scheme;
    }

    if (scheme === 'Bearer') {
      return token;
    }

    // Skip all other schemes
    return undefined;
  }

  /**
   * Checks if a JWT token contains an issuer claim.
   *
   * @param {string} token - The JWT token to check
   * @returns {boolean} True if the token has an issuer claim, false otherwise
   */
  private tokenHasIssuer(token: string): boolean {
    const { data, errors } = decodeJwt(token);
    if (errors) {
      return false;
    }
    return !!data.payload.iss;
  }

  /**
   * Verifies if a token belongs to the current instance by checking its issuer.
   *
   * @param {string} token - The JWT token to verify
   * @returns {boolean} True if the token belongs to the current instance, false otherwise
   */
  private tokenBelongsToInstance(token: string): boolean {
    if (!token) {
      return false;
    }

    const { data, errors } = decodeJwt(token);
    if (errors) {
      return false;
    }
    const tokenIssuer = data.payload.iss.replace(/https?:\/\//gi, '');
    return this.frontendApi === tokenIssuer;
  }

  /**
   * Checks if a JWT session has expired.
   *
   * @param {Jwt | undefined} jwt - The JWT to check
   * @returns {boolean} True if the session has expired, false otherwise
   */
  private sessionExpired(jwt: Jwt | undefined): boolean {
    return !!jwt && jwt?.payload.exp <= (Date.now() / 1000) >> 0;
  }
}

export type { AuthenticateContext };

/**
 * Creates a new AuthenticateContext instance with the provided request and options.
 *
 * @param {ClerkRequest} clerkRequest - The request object containing headers and cookies
 * @param {AuthenticateRequestOptions} options - Configuration options for authentication
 * @returns {Promise<AuthenticateContext>} A promise that resolves to a new AuthenticateContext instance
 */
export const createAuthenticateContext = async (
  clerkRequest: ClerkRequest,
  options: AuthenticateRequestOptions,
): Promise<AuthenticateContext> => {
  const cookieSuffix = options.publishableKey
    ? await getCookieSuffix(options.publishableKey, runtime.crypto.subtle)
    : '';
  return new AuthenticateContext(cookieSuffix, clerkRequest, options);
};
