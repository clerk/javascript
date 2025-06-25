import { describe, expect, it } from 'vitest';
import { constants, SUPPORTED_HANDSHAKE_FORMAT } from '../../constants';
import type { AuthenticateContext } from '../../tokens/authenticateContext';
import {
  appendHandshakeFormatToOAuthCallback,
  createHandshakeFormatHeaders,
  enhanceOAuthRedirectUrl,
  getHandshakeFormatCookie,
} from '../handshakeUtils';

describe('handshakeUtils', () => {
  const mockAuthenticateContextWithNonce = {
    canHandleNonceHandshake: () => true,
    getHandshakeFormat: () => 'nonce' as const,
  } as AuthenticateContext;

  const mockAuthenticateContextWithToken = {
    canHandleNonceHandshake: () => false,
    getHandshakeFormat: () => 'token' as const,
  } as AuthenticateContext;

  describe('appendHandshakeFormatToOAuthCallback', () => {
    it('should append handshake format parameter when nonce is supported', () => {
      const originalUrl = 'https://example.com/oauth/callback';
      const modifiedUrl = appendHandshakeFormatToOAuthCallback(originalUrl, mockAuthenticateContextWithNonce);

      const url = new URL(modifiedUrl);
      expect(url.searchParams.get(constants.QueryParameters.HandshakeFormat)).toBe(SUPPORTED_HANDSHAKE_FORMAT);
    });

    it('should not append handshake format parameter when token is used', () => {
      const originalUrl = 'https://example.com/oauth/callback';
      const modifiedUrl = appendHandshakeFormatToOAuthCallback(originalUrl, mockAuthenticateContextWithToken);

      const url = new URL(modifiedUrl);
      expect(url.searchParams.get(constants.QueryParameters.HandshakeFormat)).toBeNull();
    });

    it('should preserve existing query parameters', () => {
      const originalUrl = 'https://example.com/oauth/callback?existing=param&other=value';
      const modifiedUrl = appendHandshakeFormatToOAuthCallback(originalUrl, mockAuthenticateContextWithNonce);

      const url = new URL(modifiedUrl);
      expect(url.searchParams.get('existing')).toBe('param');
      expect(url.searchParams.get('other')).toBe('value');
      expect(url.searchParams.get(constants.QueryParameters.HandshakeFormat)).toBe(SUPPORTED_HANDSHAKE_FORMAT);
    });
  });

  describe('enhanceOAuthRedirectUrl', () => {
    it('should enhance OAuth callback URLs directly', () => {
      const originalUrl = 'https://example.com/oauth_callback';
      const enhancedUrl = enhanceOAuthRedirectUrl(originalUrl, mockAuthenticateContextWithNonce);

      const url = new URL(enhancedUrl);
      expect(url.searchParams.get(constants.QueryParameters.HandshakeFormat)).toBe(SUPPORTED_HANDSHAKE_FORMAT);
    });

    it('should enhance OAuth callback URLs with oauth-callback path', () => {
      const originalUrl = 'https://example.com/oauth-callback';
      const enhancedUrl = enhanceOAuthRedirectUrl(originalUrl, mockAuthenticateContextWithNonce);

      const url = new URL(enhancedUrl);
      expect(url.searchParams.get(constants.QueryParameters.HandshakeFormat)).toBe(SUPPORTED_HANDSHAKE_FORMAT);
    });

    it('should enhance URLs with redirect_url containing oauth callback', () => {
      const callbackUrl = 'https://app.example.com/oauth_callback';
      const originalUrl = `https://provider.com/oauth/authorize?redirect_url=${encodeURIComponent(callbackUrl)}`;
      const enhancedUrl = enhanceOAuthRedirectUrl(originalUrl, mockAuthenticateContextWithNonce);

      const url = new URL(enhancedUrl);
      const enhancedCallbackUrl = url.searchParams.get('redirect_url');
      expect(enhancedCallbackUrl).toBeDefined();

      const callbackUrlObj = new URL(enhancedCallbackUrl as string);
      expect(callbackUrlObj.searchParams.get(constants.QueryParameters.HandshakeFormat)).toBe(
        SUPPORTED_HANDSHAKE_FORMAT,
      );
    });

    it('should not modify URL when nonce is not supported', () => {
      const originalUrl = 'https://example.com/oauth_callback';
      const enhancedUrl = enhanceOAuthRedirectUrl(originalUrl, mockAuthenticateContextWithToken);

      expect(enhancedUrl).toBe(originalUrl);
    });

    it('should return original URL when redirectUrl is empty', () => {
      const enhancedUrl = enhanceOAuthRedirectUrl('', mockAuthenticateContextWithNonce);

      expect(enhancedUrl).toBe('');
    });

    it('should handle malformed URLs gracefully', () => {
      const malformedUrl = 'not-a-valid-url';
      const enhancedUrl = enhanceOAuthRedirectUrl(malformedUrl, mockAuthenticateContextWithNonce);

      expect(enhancedUrl).toBe(malformedUrl);
    });

    it('should preserve existing parameters in OAuth callback URLs', () => {
      const originalUrl = 'https://example.com/oauth_callback?state=xyz&code=abc';
      const enhancedUrl = enhanceOAuthRedirectUrl(originalUrl, mockAuthenticateContextWithNonce);

      const url = new URL(enhancedUrl);
      expect(url.searchParams.get('state')).toBe('xyz');
      expect(url.searchParams.get('code')).toBe('abc');
      expect(url.searchParams.get(constants.QueryParameters.HandshakeFormat)).toBe(SUPPORTED_HANDSHAKE_FORMAT);
    });
  });

  describe('getHandshakeFormatCookie', () => {
    it('should return cookie string when nonce is supported', () => {
      const cookie = getHandshakeFormatCookie(mockAuthenticateContextWithNonce);

      expect(cookie).toBe(
        `${constants.Cookies.HandshakeFormat}=${SUPPORTED_HANDSHAKE_FORMAT}; Path=/; SameSite=None; Secure`,
      );
    });

    it('should return null when token is used', () => {
      const cookie = getHandshakeFormatCookie(mockAuthenticateContextWithToken);

      expect(cookie).toBeNull();
    });
  });

  describe('createHandshakeFormatHeaders', () => {
    it('should create headers with Set-Cookie when nonce is supported', () => {
      const headers = createHandshakeFormatHeaders(mockAuthenticateContextWithNonce);

      const setCookieHeader = headers.get('Set-Cookie');
      expect(setCookieHeader).toBe(
        `${constants.Cookies.HandshakeFormat}=${SUPPORTED_HANDSHAKE_FORMAT}; Path=/; SameSite=None; Secure`,
      );
    });

    it('should create empty headers when token is used', () => {
      const headers = createHandshakeFormatHeaders(mockAuthenticateContextWithToken);

      const setCookieHeader = headers.get('Set-Cookie');
      expect(setCookieHeader).toBeNull();
    });

    it('should return Headers instance', () => {
      const headers = createHandshakeFormatHeaders(mockAuthenticateContextWithNonce);

      expect(headers).toBeInstanceOf(Headers);
    });
  });
});
