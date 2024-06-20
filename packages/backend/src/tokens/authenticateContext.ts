import type { Jwt } from '@clerk/types';

import { constants } from '../constants';
import { decodeJwt } from '../jwt/verifyJwt';
import runtime from '../runtime';
import { assertValidPublishableKey } from '../util/optionsAssertions';
import { getCookieSuffix, getSuffixedCookieName, parsePublishableKey } from '../util/shared';
import type { ClerkRequest } from './clerkRequest';
import type { AuthenticateRequestOptions } from './types';

interface AuthenticateContextInterface extends AuthenticateRequestOptions {
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
  clientUat: number;
  suffixedCookies: boolean;
  // handshake-related values
  devBrowserToken: string | undefined;
  handshakeToken: string | undefined;
  // url derived from headers
  clerkUrl: URL;
  // cookie or header session token
  sessionToken: string | undefined;
  // enforce existence of the following props
  publishableKey: string;
  instanceType: string;
  frontendApi: string;
}

interface AuthenticateContext extends AuthenticateContextInterface {}

/**
 * All data required to authenticate a request.
 * This is the data we use to decide whether a request
 * is in a signed in or signed out state or if we need
 * to perform a handshake.
 */
class AuthenticateContext {
  public get sessionToken(): string | undefined {
    return this.sessionTokenInCookie || this.sessionTokenInHeader;
  }

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
    // initCookieValues should be used before initHandshakeValues because the it depends on suffixedCookies
    this.initCookieValues();
    this.initHandshakeValues();
    Object.assign(this, options);
    this.clerkUrl = this.clerkRequest.clerkUrl;
  }

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

  private initHeaderValues() {
    this.sessionTokenInHeader = this.stripAuthorizationHeader(this.getHeader(constants.Headers.Authorization));
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
    this.suffixedCookies = this.shouldUseSuffixed();
    this.sessionTokenInCookie = this.getSuffixedOrUnSuffixedCookie(constants.Cookies.Session);
    this.clientUat = Number.parseInt(this.getSuffixedOrUnSuffixedCookie(constants.Cookies.ClientUat) || '') || 0;
  }

  private initHandshakeValues() {
    this.devBrowserToken =
      this.getQueryParam(constants.QueryParameters.DevBrowser) ||
      this.getSuffixedOrUnSuffixedCookie(constants.Cookies.DevBrowser);
    // Using getCookie since we don't suffix the handshake token cookie
    this.handshakeToken =
      this.getQueryParam(constants.QueryParameters.Handshake) || this.getCookie(constants.Cookies.Handshake);
  }

  private stripAuthorizationHeader(authValue: string | undefined | null): string | undefined {
    return authValue?.replace('Bearer ', '');
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
    if (this.suffixedCookies) {
      return this.getSuffixedCookie(cookieName);
    }
    return this.getCookie(cookieName);
  }

  private shouldUseSuffixed(): boolean {
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

    // If there is no suffixed cookies use un-suffixed
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

    return true;
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
    return this.frontendApi === tokenIssuer;
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
