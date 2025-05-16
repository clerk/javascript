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
      expect(url.searchParams.get(constants.QueryParameters.HandshakeFormat)).toBe('nonce');
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
      expect(url.searchParams.get(constants.QueryParameters.HandshakeFormat)).toBe('nonce');
    });

    it('should throw error if clerkUrl is missing', () => {
      mockAuthenticateContext.clerkUrl = undefined as any;
      expect(() => handshakeService.buildRedirectToHandshake('test-reason')).toThrow(
        'Missing clerkUrl in authenticateContext',
      );
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
      handshakeService['redirectLoopCounter'] = 3;

      const result = handshakeService.checkAndTrackRedirectLoop(headers);

      expect(result).toBe(true);
      expect(headers.get('Set-Cookie')).toBeNull();
    });

    it('should increment counter and set cookie for first redirect', () => {
      const headers = new Headers();
      handshakeService['redirectLoopCounter'] = 0;

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
});
