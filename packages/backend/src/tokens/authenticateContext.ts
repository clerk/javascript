import { constants } from '../constants';
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
    this.initHeaderValues();
    this.initCookieValues();
    this.initHandshakeValues();
    Object.assign(this, options);
    this.clerkUrl = this.clerkRequest.clerkUrl;
  }

  private initHandshakeValues() {
    this.devBrowserToken =
      this.clerkRequest.clerkUrl.searchParams.get(constants.Cookies.DevBrowser) ||
      this.clerkRequest.cookies.get(constants.Cookies.DevBrowser);
    this.handshakeToken =
      this.clerkRequest.clerkUrl.searchParams.get(constants.Cookies.Handshake) ||
      this.clerkRequest.cookies.get(constants.Cookies.Handshake);
  }

  private initHeaderValues() {
    const get = (name: string) => this.clerkRequest.headers.get(name) || undefined;
    this.sessionTokenInHeader = this.stripAuthorizationHeader(get(constants.Headers.Authorization));
    this.origin = get(constants.Headers.Origin);
    this.host = get(constants.Headers.Host);
    this.forwardedHost = get(constants.Headers.ForwardedHost);
    this.forwardedProto = get(constants.Headers.CloudFrontForwardedProto) || get(constants.Headers.ForwardedProto);
    this.referrer = get(constants.Headers.Referrer);
    this.userAgent = get(constants.Headers.UserAgent);
    this.secFetchDest = get(constants.Headers.SecFetchDest);
    this.accept = get(constants.Headers.Accept);
  }

  private initCookieValues() {
    const get = (name: string) => this.clerkRequest.cookies.get(name) || undefined;
    this.sessionTokenInCookie = get(constants.Cookies.Session);
    this.clientUat = Number.parseInt(get(constants.Cookies.ClientUat) || '') || 0;
  }

  private stripAuthorizationHeader(authValue: string | undefined | null): string | undefined {
    return authValue?.replace('Bearer ', '');
  }
}

export type { AuthenticateContext };

export const createAuthenticateContext = (
  ...args: ConstructorParameters<typeof AuthenticateContext>
): AuthenticateContext => {
  return new AuthenticateContext(...args);
};
