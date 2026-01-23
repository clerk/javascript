import { buildAccountsBaseUrl } from '@clerk/shared/buildAccountsBaseUrl';
import { resolveProxyUrl } from '@clerk/shared/multiDomain';
import type { Jwt } from '@clerk/shared/types';
import { isCurrentDevAccountPortalOrigin, isLegacyDevAccountPortalOrigin } from '@clerk/shared/url';

import { constants } from '../constants';
import { decodeJwt } from '../jwt/verifyJwt';
import { runtime } from '../runtime';
import { assertValidPublishableKey } from '../util/optionsAssertions';
import { getCookieSuffix, getSuffixedCookieName, parsePublishableKey } from '../util/shared';
import type { ClerkRequest } from './clerkRequest';
import { TokenType } from './tokenTypes';
import type { AuthenticateRequestOptions } from './types';

interface AuthenticateContext extends AuthenticateRequestOptions {
  // header-based values
  accept: string | undefined;
  forwardedHost: string | undefined;
  forwardedProto: string | undefined;
  host: string | undefined;
  origin: string | undefined;
  referrer: string | undefined;
  secFetchDest: string | undefined;
  tokenInHeader: string | undefined;
  userAgent: string | undefined;

  // cookie-based values
  clientUat: number;
  refreshTokenInCookie: string | undefined;
  sessionTokenInCookie: string | undefined;

  // handshake-related values
  devBrowserToken: string | undefined;
  handshakeNonce: string | undefined;
  handshakeRedirectLoopCounter: number;
  handshakeToken: string | undefined;

  // resolved multi-domain values (set in initPublishableKeyValues)
  isSatellite: boolean;
  domain: string | undefined;
  satelliteAutoSync: boolean | undefined;

  // url derived from headers
  clerkUrl: URL;
  // enforce existence of the following props
  frontendApi: string;
  instanceType: string;
  publishableKey: string;
}

/**
 * All data required to authenticate a request.
 * This is the data we use to decide whether a request
 * is in a signed in or signed out state or if we need
 * to perform a handshake.
 */
class AuthenticateContext implements AuthenticateContext {
  /**
   * The original Clerk frontend API URL, extracted from publishable key before proxy URL override.
   * Used for backend operations like token validation and issuer checking.
   */
  private originalFrontendApi: string = '';

  /**
   * Retrieves the session token from either the cookie or the header.
   *
   * @returns {string | undefined} The session token if available, otherwise undefined.
   */
  public get sessionToken(): string | undefined {
    return this.sessionTokenInCookie || this.tokenInHeader;
  }

  public constructor(
    private cookieSuffix: string,
    private clerkRequest: ClerkRequest,
    options: AuthenticateRequestOptions,
  ) {
    if (options.acceptsToken === TokenType.M2MToken || options.acceptsToken === TokenType.ApiKey) {
      // For non-session tokens, we only want to set the header values.
      this.initHeaderValues();
    } else {
      // Even though the options are assigned to this later in this function
      // we set the publishableKey here because it is being used in cookies/headers/handshake-values
      // as part of getMultipleAppsCookie.
      this.initPublishableKeyValues(options);
      this.initHeaderValues();
      // initCookieValues should be used before initHandshakeValues because it depends on suffixedCookies
      this.initCookieValues();
      this.initHandshakeValues();
    }

    // Copy options excluding fields that are resolved from multiDomain
    const { multiDomain: _, proxyUrl: __, ...rest } = options;
    Object.assign(this, rest);
    this.clerkUrl = this.clerkRequest.clerkUrl;
  }

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
   * Determines if the request came from a different origin based on the referrer header.
   * Used for cross-origin detection in multi-domain authentication flows.
   *
   * @returns {boolean} True if referrer exists and is from a different origin, false otherwise.
   */
  public isCrossOriginReferrer(): boolean {
    if (!this.referrer || !this.clerkUrl.origin) {
      return false;
    }

    try {
      const referrerOrigin = new URL(this.referrer).origin;
      return referrerOrigin !== this.clerkUrl.origin;
    } catch {
      // Invalid referrer URL format
      return false;
    }
  }

  /**
   * Determines if the referrer URL is from a Clerk domain (accounts portal or FAPI).
   * This includes both development and production account portal domains, as well as FAPI domains
   * used for redirect-based authentication flows.
   *
   * @returns {boolean} True if the referrer is from a Clerk accounts portal or FAPI domain, false otherwise
   */
  public isKnownClerkReferrer(): boolean {
    if (!this.referrer) {
      return false;
    }

    try {
      const referrerOrigin = new URL(this.referrer);
      const referrerHost = referrerOrigin.hostname;

      // Check if referrer is the FAPI domain itself (redirect-based auth flows)
      if (this.frontendApi) {
        const fapiHost = this.frontendApi.startsWith('http') ? new URL(this.frontendApi).hostname : this.frontendApi;
        if (referrerHost === fapiHost) {
          return true;
        }
      }

      // Check for development account portal patterns
      if (isLegacyDevAccountPortalOrigin(referrerHost) || isCurrentDevAccountPortalOrigin(referrerHost)) {
        return true;
      }

      // Check for production account portal by comparing with expected accounts URL
      const expectedAccountsUrl = buildAccountsBaseUrl(this.frontendApi);
      if (expectedAccountsUrl) {
        const expectedAccountsOrigin = new URL(expectedAccountsUrl).origin;
        if (referrerOrigin.origin === expectedAccountsOrigin) {
          return true;
        }
      }

      // Check for generic production accounts patterns (accounts.*)
      if (referrerHost.startsWith('accounts.')) {
        return true;
      }

      return false;
    } catch {
      // Invalid URL format
      return false;
    }
  }

  private initPublishableKeyValues(options: AuthenticateRequestOptions) {
    assertValidPublishableKey(options.publishableKey);
    this.publishableKey = options.publishableKey;

    const isSatellite = options.multiDomain?.isSatellite ?? false;
    const domain = options.multiDomain?.domain;
    const proxyUrl = resolveProxyUrl(options.proxyUrl, options.multiDomain?.proxyUrl);
    const satelliteAutoSync = options.multiDomain?.autoSync;

    const originalPk = parsePublishableKey(this.publishableKey, {
      fatal: true,
      domain,
      isSatellite,
    });
    this.originalFrontendApi = originalPk.frontendApi;

    const pk = parsePublishableKey(this.publishableKey, {
      fatal: true,
      proxyUrl,
      domain,
      isSatellite,
    });
    this.instanceType = pk.instanceType;
    this.frontendApi = pk.frontendApi;

    // Set resolved values so downstream code doesn't need to re-resolve
    (this as any).isSatellite = isSatellite;
    (this as any).domain = domain;
    (this as any).proxyUrl = proxyUrl;
    (this as any).satelliteAutoSync = satelliteAutoSync;
  }

  private initHeaderValues() {
    this.tokenInHeader = this.parseAuthorizationHeader(this.getHeader(constants.Headers.Authorization));
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

  private initCookieValues() {
    // suffixedCookies needs to be set first because it's used in getMultipleAppsCookie
    this.sessionTokenInCookie = this.getSuffixedOrUnSuffixedCookie(constants.Cookies.Session);
    this.refreshTokenInCookie = this.getSuffixedCookie(constants.Cookies.Refresh);
    this.clientUat = Number.parseInt(this.getSuffixedOrUnSuffixedCookie(constants.Cookies.ClientUat) || '') || 0;
  }

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

  private getQueryParam(name: string) {
    return this.clerkRequest.clerkUrl.searchParams.get(name);
  }

  private getHeader(name: string) {
    return this.clerkRequest.headers.get(name) || undefined;
  }

  private getCookie(name: string) {
    return this.clerkRequest.cookies.get(name) || undefined;
  }

  private getSuffixedCookie(name: string) {
    return this.getCookie(getSuffixedCookieName(name, this.cookieSuffix)) || undefined;
  }

  private getSuffixedOrUnSuffixedCookie(cookieName: string) {
    if (this.usesSuffixedCookies()) {
      return this.getSuffixedCookie(cookieName);
    }
    return this.getCookie(cookieName);
  }

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

  private tokenHasIssuer(token: string): boolean {
    const { data, errors } = decodeJwt(token);
    if (errors) {
      return false;
    }
    return !!data.payload.iss;
  }

  private tokenBelongsToInstance(token: string): boolean {
    if (!token) {
      return false;
    }

    const { data, errors } = decodeJwt(token);
    if (errors) {
      return false;
    }
    const tokenIssuer = data.payload.iss.replace(/https?:\/\//gi, '');
    // Use original frontend API for token validation since tokens are issued by the actual Clerk API, not proxy
    return this.originalFrontendApi === tokenIssuer;
  }

  private sessionExpired(jwt: Jwt | undefined): boolean {
    return !!jwt && jwt?.payload.exp <= (Date.now() / 1000) >> 0;
  }
}

export type { AuthenticateContext };

export const createAuthenticateContext = async (
  clerkRequest: ClerkRequest,
  options: AuthenticateRequestOptions,
): Promise<AuthenticateContext> => {
  const cookieSuffix = options.publishableKey
    ? await getCookieSuffix(options.publishableKey, runtime.crypto.subtle)
    : '';
  return new AuthenticateContext(cookieSuffix, clerkRequest, options);
};
