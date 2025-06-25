import { describe, expect, it } from 'vitest';
import { constants, SUPPORTED_HANDSHAKE_FORMAT } from '../../constants';
import type { AuthenticateContext } from '../../tokens/authenticateContext';
import {
  appendHandshakeFormatToOAuthCallback,
  createHandshakeFormatHeaders,
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
