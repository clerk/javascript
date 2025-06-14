import { beforeEach, describe, expect, it, vi } from 'vitest';

import { constants } from '../../constants';
import { TokenVerificationError, TokenVerificationErrorReason } from '../../errors';
import type { AuthenticateContext } from '../authenticateContext';
import { HandshakeService } from '../handshake';
import { OrganizationMatcher } from '../organizationMatcher';

vi.mock('../handshake.js', async importOriginal => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    verifyHandshakeToken: vi.fn(),
  };
});

vi.mock('../verify.js', async importOriginal => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    verifyToken: vi.fn(),
  };
});

vi.mock('../../jwt/verifyJwt.js', () => ({
  decodeJwt: vi.fn().mockReturnValue({
    data: {
      header: { typ: 'JWT', alg: 'RS256', kid: 'test-kid' },
      payload: {
        sub: 'user_123',
        __raw: 'raw-token',
        iss: 'issuer',
        sid: 'session-id',
        nbf: 1234567890,
        exp: 1234567890,
        iat: 1234567890,
        v: 2 as const,
        fea: undefined,
        pla: undefined,
        o: undefined,
        org_permissions: undefined,
        org_id: undefined,
        org_slug: undefined,
        org_role: undefined,
      },
      signature: new Uint8Array([1, 2, 3]),
      raw: {
        header: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9',
        payload: 'eyJzdWIiOiJ1c2VyXzEyMyJ9',
        signature: 'signature',
        text: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyJ9.signature',
      },
    },
    errors: undefined,
  }),
  hasValidSignature: vi.fn().mockResolvedValue({
    data: true,
    errors: undefined,
  }),
}));

vi.mock('../keys.js', async importOriginal => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    loadClerkJWKFromRemote: vi.fn().mockResolvedValue({
      kty: 'RSA',
      kid: 'test-kid',
      use: 'sig',
      alg: 'RS256',
      n: 'test-n',
      e: 'AQAB',
    }),
  };
});

vi.mock('../../jwt/assertions.js', () => ({
  assertHeaderAlgorithm: vi.fn(),
  assertHeaderType: vi.fn(),
}));

describe('HandshakeService', () => {
  let mockAuthenticateContext: AuthenticateContext;
  let mockOrganizationMatcher: OrganizationMatcher;
  let mockOptions: {
    organizationSyncOptions?: { organizationPatterns?: string[]; personalAccountPatterns?: string[] };
  };
  let handshakeService: HandshakeService;

  beforeEach(() => {
    vi.clearAllMocks();

    mockAuthenticateContext = {
      clerkUrl: new URL('https://example.com'),
      frontendApi: 'api.clerk.com',
      instanceType: 'production',
      usesSuffixedCookies: () => true,
      secFetchDest: 'document',
      accept: 'text/html',
      apiUrl: 'https://api.clerk.dev',
      secretKey: 'test-secret-key',
      handshakeRedirectLoopCounter: 0,
    } as AuthenticateContext;

    mockOrganizationMatcher = new OrganizationMatcher({
      organizationPatterns: ['/org/:id'],
      personalAccountPatterns: ['/account'],
    });

    mockOptions = {
      organizationSyncOptions: {
        organizationPatterns: ['/org/:id'],
        personalAccountPatterns: ['/account'],
      },
    };

    handshakeService = new HandshakeService(mockAuthenticateContext, mockOptions, mockOrganizationMatcher);
  });

  describe('isRequestEligibleForHandshake', () => {
    it('should return true for document secFetchDest', () => {
      mockAuthenticateContext.secFetchDest = 'document';
      expect(handshakeService.isRequestEligibleForHandshake()).toBe(true);
    });

    it('should return true for iframe secFetchDest', () => {
      mockAuthenticateContext.secFetchDest = 'iframe';
      expect(handshakeService.isRequestEligibleForHandshake()).toBe(true);
    });

    it('should return true for text/html accept header without secFetchDest', () => {
      mockAuthenticateContext.secFetchDest = undefined;
      mockAuthenticateContext.accept = 'text/html';
      expect(handshakeService.isRequestEligibleForHandshake()).toBe(true);
    });

    it('should return false for non-eligible requests', () => {
      mockAuthenticateContext.secFetchDest = 'image';
      mockAuthenticateContext.accept = 'image/png';
      expect(handshakeService.isRequestEligibleForHandshake()).toBe(false);
    });
  });

  describe('buildRedirectToHandshake', () => {
    it('should build redirect headers with basic parameters', () => {
      const headers = handshakeService.buildRedirectToHandshake('test-reason');
      const location = headers.get(constants.Headers.Location);
      if (!location) {
        throw new Error('Location header is missing');
      }
      const url = new URL(location);

      expect(url.hostname).toBe('api.clerk.com');
      expect(url.pathname).toBe('/v1/client/handshake');
      expect(url.searchParams.get('redirect_url')).toBe('https://example.com/');
      expect(url.searchParams.get(constants.QueryParameters.SuffixedCookies)).toBe('true');
      expect(url.searchParams.get(constants.QueryParameters.HandshakeReason)).toBe('test-reason');
    });

    it('should include dev browser token in development mode', () => {
      mockAuthenticateContext.instanceType = 'development';
      mockAuthenticateContext.devBrowserToken = 'dev-token';
      const headers = handshakeService.buildRedirectToHandshake('test-reason');
      const location = headers.get(constants.Headers.Location);
      if (!location) {
        throw new Error('Location header is missing');
      }
      const url = new URL(location);

      expect(url.searchParams.get(constants.QueryParameters.DevBrowser)).toBe('dev-token');
    });

    it('should throw error if clerkUrl is missing', () => {
      mockAuthenticateContext.clerkUrl = undefined as any;
      expect(() => handshakeService.buildRedirectToHandshake('test-reason')).toThrow(
        'Missing clerkUrl in authenticateContext',
      );
    });

    it('should use proxy URL when available', () => {
      mockAuthenticateContext.proxyUrl = 'https://my-proxy.example.com';
      // Simulate what parsePublishableKey does when proxy URL is provided
      mockAuthenticateContext.frontendApi = 'https://my-proxy.example.com';
      const headers = handshakeService.buildRedirectToHandshake('test-reason');
      const location = headers.get(constants.Headers.Location);
      if (!location) {
        throw new Error('Location header is missing');
      }
      const url = new URL(location);

      expect(url.hostname).toBe('my-proxy.example.com');
      expect(url.pathname).toBe('/v1/client/handshake');
      expect(url.searchParams.get('redirect_url')).toBe('https://example.com/');
      expect(url.searchParams.get(constants.QueryParameters.SuffixedCookies)).toBe('true');
      expect(url.searchParams.get(constants.QueryParameters.HandshakeReason)).toBe('test-reason');
    });

    it('should handle proxy URL with trailing slash', () => {
      mockAuthenticateContext.proxyUrl = 'https://my-proxy.example.com/';
      mockAuthenticateContext.frontendApi = 'https://my-proxy.example.com/';
      const headers = handshakeService.buildRedirectToHandshake('test-reason');
      const location = headers.get(constants.Headers.Location);
      if (!location) {
        throw new Error('Location header is missing');
      }
      const url = new URL(location);

      expect(url.hostname).toBe('my-proxy.example.com');
      expect(url.pathname).toBe('/v1/client/handshake');
    });

    it('should handle proxy URL with multiple trailing slashes', () => {
      mockAuthenticateContext.proxyUrl = 'https://my-proxy.example.com//';
      mockAuthenticateContext.frontendApi = 'https://my-proxy.example.com//';
      const headers = handshakeService.buildRedirectToHandshake('test-reason');
      const location = headers.get(constants.Headers.Location);
      if (!location) {
        throw new Error('Location header is missing');
      }
      const url = new URL(location);

      expect(url.hostname).toBe('my-proxy.example.com');
      expect(url.pathname).toBe('/v1/client/handshake');
      expect(location).not.toContain('//v1/client/handshake');
    });

    it('should handle proxy URL with many trailing slashes', () => {
      mockAuthenticateContext.proxyUrl = 'https://my-proxy.example.com///';
      mockAuthenticateContext.frontendApi = 'https://my-proxy.example.com///';
      const headers = handshakeService.buildRedirectToHandshake('test-reason');
      const location = headers.get(constants.Headers.Location);
      if (!location) {
        throw new Error('Location header is missing');
      }
      const url = new URL(location);

      expect(url.hostname).toBe('my-proxy.example.com');
      expect(url.pathname).toBe('/v1/client/handshake');
      expect(location).not.toContain('//v1/client/handshake');
    });

    it('should handle proxy URL without trailing slash', () => {
      mockAuthenticateContext.proxyUrl = 'https://my-proxy.example.com';
      mockAuthenticateContext.frontendApi = 'https://my-proxy.example.com';
      const headers = handshakeService.buildRedirectToHandshake('test-reason');
      const location = headers.get(constants.Headers.Location);
      if (!location) {
        throw new Error('Location header is missing');
      }
      const url = new URL(location);

      expect(url.hostname).toBe('my-proxy.example.com');
      expect(url.pathname).toBe('/v1/client/handshake');
    });

    it('should handle proxy URL with path and trailing slashes', () => {
      mockAuthenticateContext.proxyUrl = 'https://my-proxy.example.com/clerk-proxy//';
      mockAuthenticateContext.frontendApi = 'https://my-proxy.example.com/clerk-proxy//';
      const headers = handshakeService.buildRedirectToHandshake('test-reason');
      const location = headers.get(constants.Headers.Location);
      if (!location) {
        throw new Error('Location header is missing');
      }
      const url = new URL(location);

      expect(url.hostname).toBe('my-proxy.example.com');
      expect(url.pathname).toBe('/clerk-proxy/v1/client/handshake');
      expect(location).not.toContain('clerk-proxy//v1/client/handshake');
    });

    it('should handle non-HTTP frontendApi (domain only)', () => {
      mockAuthenticateContext.frontendApi = 'api.clerk.com';
      const headers = handshakeService.buildRedirectToHandshake('test-reason');
      const location = headers.get(constants.Headers.Location);
      if (!location) {
        throw new Error('Location header is missing');
      }
      const url = new URL(location);

      expect(url.protocol).toBe('https:');
      expect(url.hostname).toBe('api.clerk.com');
      expect(url.pathname).toBe('/v1/client/handshake');
    });

    it('should not include dev browser token in production mode', () => {
      mockAuthenticateContext.instanceType = 'production';
      mockAuthenticateContext.devBrowserToken = 'dev-token';
      const headers = handshakeService.buildRedirectToHandshake('test-reason');
      const location = headers.get(constants.Headers.Location);
      if (!location) {
        throw new Error('Location header is missing');
      }
      const url = new URL(location);

      expect(url.searchParams.get(constants.QueryParameters.DevBrowser)).toBeNull();
    });

    it('should not include dev browser token when not available in development', () => {
      mockAuthenticateContext.instanceType = 'development';
      mockAuthenticateContext.devBrowserToken = undefined;
      const headers = handshakeService.buildRedirectToHandshake('test-reason');
      const location = headers.get(constants.Headers.Location);
      if (!location) {
        throw new Error('Location header is missing');
      }
      const url = new URL(location);

      expect(url.searchParams.get(constants.QueryParameters.DevBrowser)).toBeNull();
    });

    it('should handle usesSuffixedCookies returning false', () => {
      mockAuthenticateContext.usesSuffixedCookies = vi.fn().mockReturnValue(false);
      const headers = handshakeService.buildRedirectToHandshake('test-reason');
      const location = headers.get(constants.Headers.Location);
      if (!location) {
        throw new Error('Location header is missing');
      }
      const url = new URL(location);

      expect(url.searchParams.get(constants.QueryParameters.SuffixedCookies)).toBe('false');
    });

    it('should include organization sync parameters when organization target is found', () => {
      // Mock the organization sync methods
      const mockTarget = { type: 'organization', id: 'org_123' };
      const mockParams = new Map([
        ['org_id', 'org_123'],
        ['org_slug', 'test-org'],
      ]);

      vi.spyOn(handshakeService as any, 'getOrganizationSyncTarget').mockReturnValue(mockTarget);
      vi.spyOn(handshakeService as any, 'getOrganizationSyncQueryParams').mockReturnValue(mockParams);

      const headers = handshakeService.buildRedirectToHandshake('test-reason');
      const location = headers.get(constants.Headers.Location);
      if (!location) {
        throw new Error('Location header is missing');
      }
      const url = new URL(location);

      expect(url.searchParams.get('org_id')).toBe('org_123');
      expect(url.searchParams.get('org_slug')).toBe('test-org');
    });

    it('should not include organization sync parameters when no target is found', () => {
      vi.spyOn(handshakeService as any, 'getOrganizationSyncTarget').mockReturnValue(null);

      const headers = handshakeService.buildRedirectToHandshake('test-reason');
      const location = headers.get(constants.Headers.Location);
      if (!location) {
        throw new Error('Location header is missing');
      }
      const url = new URL(location);

      expect(url.searchParams.get('org_id')).toBeNull();
      expect(url.searchParams.get('org_slug')).toBeNull();
    });

    it('should handle different handshake reasons', () => {
      const reasons = ['session-token-expired', 'dev-browser-sync', 'satellite-cookie-needs-syncing'];

      reasons.forEach(reason => {
        const headers = handshakeService.buildRedirectToHandshake(reason);
        const location = headers.get(constants.Headers.Location);
        if (!location) {
          throw new Error('Location header is missing');
        }
        const url = new URL(location);

        expect(url.searchParams.get(constants.QueryParameters.HandshakeReason)).toBe(reason);
      });
    });

    it('should handle complex clerkUrl with query parameters and fragments', () => {
      mockAuthenticateContext.clerkUrl = new URL('https://example.com/path?existing=param#fragment');

      const headers = handshakeService.buildRedirectToHandshake('test-reason');
      const location = headers.get(constants.Headers.Location);
      if (!location) {
        throw new Error('Location header is missing');
      }
      const url = new URL(location);

      const redirectUrl = url.searchParams.get('redirect_url');
      expect(redirectUrl).toBe('https://example.com/path?existing=param#fragment');
    });

    it('should create valid URLs with different frontend API formats', () => {
      const frontendApiFormats = [
        'api.clerk.com',
        'https://api.clerk.com',
        'https://api.clerk.com/',
        'foo-bar-13.clerk.accounts.dev',
        'https://foo-bar-13.clerk.accounts.dev',
        'clerk.example.com',
        'https://clerk.example.com/proxy-path',
      ];

      frontendApiFormats.forEach(frontendApi => {
        mockAuthenticateContext.frontendApi = frontendApi;

        const headers = handshakeService.buildRedirectToHandshake('test-reason');
        const location = headers.get(constants.Headers.Location);

        expect(location).toBeDefined();
        if (!location) {
          throw new Error('Location header should be defined');
        }
        expect(() => new URL(location)).not.toThrow();

        const url = new URL(location);
        // Path should end with '/v1/client/handshake' (may have proxy path prefix)
        expect(url.pathname).toMatch(/\/v1\/client\/handshake$/);
        expect(url.searchParams.get(constants.QueryParameters.HandshakeReason)).toBe('test-reason');
      });
    });

    it('should always include required query parameters', () => {
      const headers = handshakeService.buildRedirectToHandshake('test-reason');
      const location = headers.get(constants.Headers.Location);
      if (!location) {
        throw new Error('Location header is missing');
      }
      const url = new URL(location);

      // Verify all required parameters are present
      expect(url.searchParams.get('redirect_url')).toBeDefined();
      expect(url.searchParams.get('__clerk_api_version')).toBe('2025-04-10');
      expect(url.searchParams.get(constants.QueryParameters.SuffixedCookies)).toMatch(/^(true|false)$/);
      expect(url.searchParams.get(constants.QueryParameters.HandshakeReason)).toBe('test-reason');
    });
  });

  describe('handleTokenVerificationErrorInDevelopment', () => {
    it('should throw specific error for invalid signature', () => {
      const error = new TokenVerificationError({
        reason: TokenVerificationErrorReason.TokenInvalidSignature,
        message: 'Invalid signature',
      });

      expect(() => handshakeService.handleTokenVerificationErrorInDevelopment(error)).toThrow(
        'Clerk: Handshake token verification failed due to an invalid signature',
      );
    });

    it('should throw generic error for other verification failures', () => {
      const error = new TokenVerificationError({
        reason: TokenVerificationErrorReason.TokenExpired,
        message: 'Token expired',
      });

      expect(() => handshakeService.handleTokenVerificationErrorInDevelopment(error)).toThrow(
        'Clerk: Handshake token verification failed: Token expired',
      );
    });
  });

  describe('checkAndTrackRedirectLoop', () => {
    it('should return true after 3 redirects', () => {
      const headers = new Headers();
      mockAuthenticateContext.handshakeRedirectLoopCounter = 3;

      const result = handshakeService.checkAndTrackRedirectLoop(headers);

      expect(result).toBe(true);
      expect(headers.get('Set-Cookie')).toBeNull();
    });

    it('should increment counter and set cookie for first redirect', () => {
      const headers = new Headers();
      mockAuthenticateContext.handshakeRedirectLoopCounter = 0;

      const result = handshakeService.checkAndTrackRedirectLoop(headers);

      expect(result).toBe(false);
      expect(headers.get('Set-Cookie')).toContain('__clerk_redirect_count=1');
    });
  });

  describe('getHandshakePayload', () => {
    it('should return cookies from handshakeNonce when available', async () => {
      const mockDirectives = ['cookie1=value1', 'cookie2=value2'];
      const getHandshakePayloadMock = vi.fn().mockResolvedValue({
        directives: mockDirectives,
      });

      mockAuthenticateContext.handshakeNonce = 'test-nonce';
      mockAuthenticateContext.apiClient = {
        clients: {
          getHandshakePayload: getHandshakePayloadMock,
        },
      } as any;

      const result = await handshakeService.getCookiesFromHandshake();

      expect(result).toEqual(mockDirectives);
      expect(getHandshakePayloadMock).toHaveBeenCalledWith({
        nonce: 'test-nonce',
      });
    });

    it('should handle API errors when getting handshake payload with nonce', async () => {
      const mockError = new Error('API error');
      const getHandshakePayloadMock = vi.fn().mockRejectedValue(mockError);

      mockAuthenticateContext.handshakeNonce = 'test-nonce';
      mockAuthenticateContext.apiClient = {
        clients: {
          getHandshakePayload: getHandshakePayloadMock,
        },
      } as any;

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await handshakeService.getCookiesFromHandshake();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Clerk: HandshakeService: error getting handshake payload:', mockError);

      consoleSpy.mockRestore();
    });

    it.todo('should return cookies from handshakeToken when nonce is not available');

    it('should return empty array when neither handshakeNonce nor handshakeToken is available', async () => {
      mockAuthenticateContext.handshakeNonce = undefined;
      mockAuthenticateContext.handshakeToken = undefined;

      const result = await handshakeService.getCookiesFromHandshake();

      expect(result).toEqual([]);
    });

    it('should handle token verification errors gracefully', async () => {
      mockAuthenticateContext.handshakeNonce = undefined;
      mockAuthenticateContext.handshakeToken = 'test-token';

      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await handshakeService.getCookiesFromHandshake();

      expect(result).toEqual([]);

      spy.mockRestore();
    });
  });

  describe('URL construction edge cases', () => {
    const trailingSlashTestCases = [
      { input: 'https://example.com', expected: 'https://example.com' },
      { input: 'https://example.com/', expected: 'https://example.com' },
      { input: 'https://example.com//', expected: 'https://example.com' },
      { input: 'https://example.com///', expected: 'https://example.com' },
      { input: 'https://example.com/path', expected: 'https://example.com/path' },
      { input: 'https://example.com/path/', expected: 'https://example.com/path' },
      { input: 'https://example.com/path//', expected: 'https://example.com/path' },
      { input: 'https://example.com/proxy-path///', expected: 'https://example.com/proxy-path' },
    ];

    trailingSlashTestCases.forEach(({ input, expected }) => {
      it(`should correctly handle trailing slashes: "${input}" -> "${expected}"`, () => {
        const result = input.replace(/\/+$/, '');
        expect(result).toBe(expected);
      });
    });

    it('should construct valid handshake URLs with various proxy configurations', () => {
      const proxyConfigs = [
        'https://proxy.example.com',
        'https://proxy.example.com/',
        'https://proxy.example.com//',
        'https://proxy.example.com/clerk',
        'https://proxy.example.com/clerk/',
        'https://proxy.example.com/clerk//',
        'https://api.example.com/v1/clerk///',
      ];

      proxyConfigs.forEach(proxyUrl => {
        const isolatedContext = {
          ...mockAuthenticateContext,
          proxyUrl: proxyUrl,
          frontendApi: proxyUrl,
        } as AuthenticateContext;

        const isolatedHandshakeService = new HandshakeService(isolatedContext, mockOptions, mockOrganizationMatcher);

        const headers = isolatedHandshakeService.buildRedirectToHandshake('test-reason');
        const location = headers.get(constants.Headers.Location);

        expect(location).toBeDefined();
        if (!location) {
          throw new Error('Location header should be defined');
        }
        expect(location).toContain('/v1/client/handshake');
        expect(location).not.toContain('//v1/client/handshake'); // No double slashes

        // Ensure URL is valid
        expect(() => new URL(location)).not.toThrow();
      });
    });
  });
});
