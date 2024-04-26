import { parsePublishableKey } from '@clerk/shared/keys';

import { constants } from '../constants';
import { assertValidPublishableKey } from '../util/optionsAssertions';
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

  public constructor(private clerkRequest: ClerkRequest, options: AuthenticateRequestOptions) {
    // Even though the options are assigned to this later in this function
    // we set the publishableKey here because it is being used in cookies/headers/handshake-values
    // as part of getMultipleAppsCookie
    this.initPublishableKeyValues(options);
    this.initHeaderValues();
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

  private initHandshakeValues() {
    this.devBrowserToken =
      this.getQueryParam(constants.QueryParameters.DevBrowser) ||
      this.getMultipleAppsCookie(constants.Cookies.DevBrowser);
    // Using getCookie since we don't suffix the handshake token cookie
    this.handshakeToken =
      this.getQueryParam(constants.QueryParameters.Handshake) || this.getCookie(constants.Cookies.Handshake);
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
    this.sessionTokenInCookie = this.getMultipleAppsCookie(constants.Cookies.Session);
    this.clientUat = Number.parseInt(this.getMultipleAppsCookie(constants.Cookies.ClientUat) || '') || 0;
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

  private getMultipleAppsCookie(cookieName: string) {
    const suffix = this.publishableKey?.split('_').pop();
    return this.getCookie(`${cookieName}_${suffix}`) || this.getCookie(cookieName) || undefined;
  }
}

export type { AuthenticateContext };

export const createAuthenticateContext = (
  ...args: ConstructorParameters<typeof AuthenticateContext>
): AuthenticateContext => {
  return new AuthenticateContext(...args);
};
