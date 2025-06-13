import type { Jwt } from '@clerk/types';

import { constants } from '../constants';
import { decodeJwt } from '../jwt/verifyJwt';
import { runtime } from '../runtime';
import { assertValidPublishableKey } from '../util/optionsAssertions';
import { getCookieSuffix, getSuffixedCookieName, parsePublishableKey } from '../util/shared';
import type { ClerkRequest } from './clerkRequest';
import type { AuthenticateRequestOptions } from './types';

// Separate parser classes for single responsibility
class HeaderParser {
  constructor(private clerkRequest: ClerkRequest) {}

  parse(): HeaderValues {
    return {
      tokenInHeader: this.parseAuthorizationHeader(),
      origin: this.getHeader(constants.Headers.Origin),
      host: this.getHeader(constants.Headers.Host),
      forwardedHost: this.getHeader(constants.Headers.ForwardedHost),
      forwardedProto: this.getForwardedProto(),
      referrer: this.getHeader(constants.Headers.Referrer),
      userAgent: this.getHeader(constants.Headers.UserAgent),
      secFetchDest: this.getHeader(constants.Headers.SecFetchDest),
      accept: this.getHeader(constants.Headers.Accept),
    };
  }

  private getHeader(name: string): string | undefined {
    return this.clerkRequest.headers.get(name) || undefined;
  }

  private getForwardedProto(): string | undefined {
    return (
      this.getHeader(constants.Headers.CloudFrontForwardedProto) || this.getHeader(constants.Headers.ForwardedProto)
    );
  }

  private parseAuthorizationHeader(): string | undefined {
    const authHeader = this.getHeader(constants.Headers.Authorization);
    if (!authHeader) return undefined;

    const [scheme, token] = authHeader.split(' ', 2);

    if (!token) return scheme; // No scheme specified, treat entire value as token
    if (scheme === 'Bearer') return token;

    return undefined; // Skip all other schemes
  }
}

class CookieParser {
  private suffixedCookieStrategy: SuffixedCookieStrategy;

  constructor(
    private clerkRequest: ClerkRequest,
    private cookieSuffix: string,
    private publishableKeyValues: PublishableKeyValues,
  ) {
    this.suffixedCookieStrategy = new SuffixedCookieStrategy(clerkRequest, cookieSuffix, publishableKeyValues);
  }

  parse(): CookieValues {
    const usesSuffixed = this.suffixedCookieStrategy.shouldUseSuffixedCookies();

    return {
      sessionTokenInCookie: this.getCookieValue(constants.Cookies.Session, usesSuffixed),
      refreshTokenInCookie: this.getSuffixedCookie(constants.Cookies.Refresh),
      clientUat: this.parseClientUat(usesSuffixed),
    };
  }

  private getCookieValue(name: string, useSuffixed: boolean): string | undefined {
    return useSuffixed ? this.getSuffixedCookie(name) : this.getCookie(name);
  }

  private parseClientUat(useSuffixed: boolean): number {
    const value = this.getCookieValue(constants.Cookies.ClientUat, useSuffixed);
    return Number.parseInt(value || '') || 0;
  }

  private getCookie(name: string): string | undefined {
    return this.clerkRequest.cookies.get(name) || undefined;
  }

  private getSuffixedCookie(name: string): string | undefined {
    return this.getCookie(getSuffixedCookieName(name, this.cookieSuffix)) || undefined;
  }
}

// Extract complex logic into a strategy class
class SuffixedCookieStrategy {
  constructor(
    private clerkRequest: ClerkRequest,
    private cookieSuffix: string,
    private publishableKeyValues: PublishableKeyValues,
  ) {}

  shouldUseSuffixedCookies(): boolean {
    const cookies = this.getCookieValues();

    // Early returns for simple cases
    if (this.shouldUseUnsuffixedForMalformedSession(cookies.session)) {
      return false;
    }

    if (this.shouldUseSuffixedForDifferentInstance(cookies.session)) {
      return true;
    }

    if (!cookies.suffixedClientUat && !cookies.suffixedSession) {
      return false;
    }

    // Complex cases handled by dedicated methods
    return this.evaluateComplexScenarios(cookies);
  }

  private getCookieValues() {
    return {
      suffixedClientUat: this.getSuffixedCookie(constants.Cookies.ClientUat),
      clientUat: this.getCookie(constants.Cookies.ClientUat),
      suffixedSession: this.getSuffixedCookie(constants.Cookies.Session) || '',
      session: this.getCookie(constants.Cookies.Session) || '',
    };
  }

  private shouldUseUnsuffixedForMalformedSession(session: string): boolean {
    return !!session && !this.tokenHasIssuer(session);
  }

  private shouldUseSuffixedForDifferentInstance(session: string): boolean {
    return !!session && !this.tokenBelongsToInstance(session);
  }

  private evaluateComplexScenarios(cookies: {
    suffixedClientUat: string | undefined;
    clientUat: string | undefined;
    suffixedSession: string;
    session: string;
  }): boolean {
    const sessionData = this.decodeSessionData(cookies.session, cookies.suffixedSession);

    if (this.isUnsuffixedNewer(cookies, sessionData)) {
      return false;
    }

    if (this.shouldTrustUnsuffixedForSignOut(cookies)) {
      return false;
    }

    if (this.shouldHandleDevelopmentDowngrade(cookies, sessionData.suffixedSessionData)) {
      return false;
    }

    if (this.shouldFallbackForMissingClientUat(cookies)) {
      return false;
    }

    return true;
  }

  private decodeSessionData(session: string, suffixedSession: string) {
    const { data: sessionData } = decodeJwt(session);
    const { data: suffixedSessionData } = decodeJwt(suffixedSession);

    return {
      sessionIat: sessionData?.payload.iat || 0,
      suffixedSessionIat: suffixedSessionData?.payload.iat || 0,
      suffixedSessionData,
    };
  }

  private isUnsuffixedNewer(cookies: any, sessionData: any): boolean {
    return (
      cookies.suffixedClientUat !== '0' &&
      cookies.clientUat !== '0' &&
      sessionData.sessionIat > sessionData.suffixedSessionIat
    );
  }

  private shouldTrustUnsuffixedForSignOut(cookies: any): boolean {
    return cookies.suffixedClientUat === '0' && cookies.clientUat !== '0';
  }

  private shouldHandleDevelopmentDowngrade(cookies: any, suffixedSessionData: Jwt | undefined): boolean {
    if (this.publishableKeyValues.instanceType !== 'production') {
      const isSuffixedSessionExpired = this.sessionExpired(suffixedSessionData);
      return cookies.suffixedClientUat !== '0' && cookies.clientUat === '0' && isSuffixedSessionExpired;
    }
    return false;
  }

  private shouldFallbackForMissingClientUat(cookies: any): boolean {
    return !cookies.suffixedClientUat && cookies.suffixedSession;
  }

  private getCookie(name: string): string | undefined {
    return this.clerkRequest.cookies.get(name) || undefined;
  }

  private getSuffixedCookie(name: string): string | undefined {
    return this.getCookie(getSuffixedCookieName(name, this.cookieSuffix)) || undefined;
  }

  private tokenHasIssuer(token: string): boolean {
    const { data, errors } = decodeJwt(token);
    return !errors && !!data.payload.iss;
  }

  private tokenBelongsToInstance(token: string): boolean {
    if (!token) return false;

    const { data, errors } = decodeJwt(token);
    if (errors) return false;

    const tokenIssuer = data.payload.iss.replace(/https?:\/\//gi, '');
    return this.publishableKeyValues.originalFrontendApi === tokenIssuer;
  }

  private sessionExpired(jwt: Jwt | undefined): boolean {
    return !!jwt && jwt?.payload.exp <= (Date.now() / 1000) >> 0;
  }
}

class HandshakeParser {
  constructor(
    private clerkRequest: ClerkRequest,
    private cookieParser: { getCookie: (name: string) => string | undefined },
  ) {}

  parse(usesSuffixedCookies: boolean): HandshakeValues {
    return {
      devBrowserToken: this.getDevBrowserToken(usesSuffixedCookies),
      handshakeToken: this.getHandshakeToken(),
      handshakeRedirectLoopCounter: this.getRedirectLoopCounter(),
      handshakeNonce: this.getHandshakeNonce(),
    };
  }

  private getDevBrowserToken(usesSuffixedCookies: boolean): string | undefined {
    const queryParam = this.getQueryParam(constants.QueryParameters.DevBrowser);
    if (queryParam) return queryParam;

    const cookieName = constants.Cookies.DevBrowser;
    return usesSuffixedCookies
      ? this.cookieParser.getCookie(getSuffixedCookieName(cookieName, ''))
      : this.cookieParser.getCookie(cookieName);
  }

  private getHandshakeToken(): string | undefined {
    return (
      this.getQueryParam(constants.QueryParameters.Handshake) ||
      this.cookieParser.getCookie(constants.Cookies.Handshake)
    );
  }

  private getRedirectLoopCounter(): number {
    return Number(this.cookieParser.getCookie(constants.Cookies.RedirectCount)) || 0;
  }

  private getHandshakeNonce(): string | undefined {
    return (
      this.getQueryParam(constants.QueryParameters.HandshakeNonce) ||
      this.cookieParser.getCookie(constants.Cookies.HandshakeNonce)
    );
  }

  private getQueryParam(name: string): string | undefined {
    return this.clerkRequest.clerkUrl.searchParams.get(name) || undefined;
  }
}

// Main class with simplified structure
export class AuthenticateContext {
  private data: AuthenticateContextData;

  constructor(data: AuthenticateContextData) {
    this.data = data;
  }

  get sessionToken(): string | undefined {
    return this.data.cookies.sessionTokenInCookie || this.data.headers.tokenInHeader;
  }

  // Header properties
  get tokenInHeader() {
    return this.data.headers.tokenInHeader;
  }
  get origin() {
    return this.data.headers.origin;
  }
  get host() {
    return this.data.headers.host;
  }
  get forwardedHost() {
    return this.data.headers.forwardedHost;
  }
  get forwardedProto() {
    return this.data.headers.forwardedProto;
  }
  get referrer() {
    return this.data.headers.referrer;
  }
  get userAgent() {
    return this.data.headers.userAgent;
  }
  get secFetchDest() {
    return this.data.headers.secFetchDest;
  }
  get accept() {
    return this.data.headers.accept;
  }

  // Cookie properties
  get clientUat() {
    return this.data.cookies.clientUat;
  }
  get refreshTokenInCookie() {
    return this.data.cookies.refreshTokenInCookie;
  }
  get sessionTokenInCookie() {
    return this.data.cookies.sessionTokenInCookie;
  }

  // Handshake properties
  get devBrowserToken() {
    return this.data.handshake.devBrowserToken;
  }
  get handshakeNonce() {
    return this.data.handshake.handshakeNonce;
  }
  get handshakeRedirectLoopCounter() {
    return this.data.handshake.handshakeRedirectLoopCounter;
  }
  get handshakeToken() {
    return this.data.handshake.handshakeToken;
  }

  // Publishable key properties
  get publishableKey() {
    return this.data.publishableKeyValues.publishableKey;
  }
  get frontendApi() {
    return this.data.publishableKeyValues.frontendApi;
  }
  get instanceType() {
    return this.data.publishableKeyValues.instanceType;
  }

  // Options properties
  get secretKey() {
    return this.data.secretKey;
  }
  get domain() {
    return this.data.domain;
  }
  get isSatellite() {
    return this.data.isSatellite;
  }
  get proxyUrl() {
    return this.data.proxyUrl;
  }
  get signInUrl() {
    return this.data.signInUrl;
  }
  get signUpUrl() {
    return this.data.signUpUrl;
  }
  get afterSignInUrl() {
    return this.data.afterSignInUrl;
  }
  get afterSignUpUrl() {
    return this.data.afterSignUpUrl;
  }
  get organizationSyncOptions() {
    return this.data.organizationSyncOptions;
  }
  get acceptsToken() {
    return this.data.acceptsToken;
  }
  get apiClient() {
    return this.data.apiClient;
  }

  // Other properties
  get clerkUrl() {
    return this.data.clerkUrl;
  }

  // Delegate to data properties for compatibility
  get headers() {
    return this.data.headers;
  }
  get cookies() {
    return this.data.cookies;
  }
  get handshake() {
    return this.data.handshake;
  }

  // Method for compatibility
  usesSuffixedCookies(): boolean {
    // This method needs to be implemented properly based on the original logic
    // For now, return a simple implementation
    return false; // TODO: Implement proper logic
  }
}

// Factory function with clear initialization flow
export const createAuthenticateContext = async (
  clerkRequest: ClerkRequest,
  options: AuthenticateRequestOptions,
): Promise<AuthenticateContext> => {
  // 1. Parse publishable key
  assertValidPublishableKey(options.publishableKey);
  const publishableKeyValues = parsePublishableKeyValues(options);

  // 2. Get cookie suffix
  const cookieSuffix = options.publishableKey
    ? await getCookieSuffix(options.publishableKey, runtime.crypto.subtle)
    : '';

  // 3. Initialize parsers
  const headerParser = new HeaderParser(clerkRequest);
  const cookieParser = new CookieParser(clerkRequest, cookieSuffix, publishableKeyValues);
  const handshakeParser = new HandshakeParser(clerkRequest, {
    getCookie: name => clerkRequest.cookies.get(name) || undefined,
  });

  // 4. Parse values
  const headers = headerParser.parse();
  const cookies = cookieParser.parse();
  const usesSuffixedCookies = new SuffixedCookieStrategy(
    clerkRequest,
    cookieSuffix,
    publishableKeyValues,
  ).shouldUseSuffixedCookies();
  const handshake = handshakeParser.parse(usesSuffixedCookies);

  // 5. Create context
  const contextData: AuthenticateContextData = {
    ...options,
    headers,
    cookies,
    handshake,
    publishableKeyValues,
    clerkUrl: clerkRequest.clerkUrl,
  };

  return new AuthenticateContext(contextData);
};

function parsePublishableKeyValues(options: AuthenticateRequestOptions): PublishableKeyValues {
  const originalPk = parsePublishableKey(options.publishableKey, {
    fatal: true,
    domain: options.domain,
    isSatellite: options.isSatellite,
  });

  const pk = parsePublishableKey(options.publishableKey, {
    fatal: true,
    proxyUrl: options.proxyUrl,
    domain: options.domain,
    isSatellite: options.isSatellite,
  });

  return {
    publishableKey: options.publishableKey as string,
    originalFrontendApi: originalPk.frontendApi,
    frontendApi: pk.frontendApi,
    instanceType: pk.instanceType,
  };
}
