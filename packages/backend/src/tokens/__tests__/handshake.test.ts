import { beforeEach, describe, expect, it, vi } from 'vitest';

import { constants } from '../../constants';
import { TokenVerificationError, TokenVerificationErrorReason } from '../../errors';
import type { AuthenticateContext } from '../authenticateContext';
import { AuthErrorReason, signedIn, signedOut } from '../authStatus';
import { HandshakeService } from '../handshake';
import type { OrganizationSyncTargetMatchers } from '../types';

vi.mock('../handshake.js', async importOriginal => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    verifyHandshakeToken: vi.fn().mockResolvedValue({
      handshake: ['cookie1=value1', 'session=session-token'],
    }),
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
}));

describe('HandshakeService', () => {
  let mockAuthenticateContext: AuthenticateContext;
  let mockOrganizationSyncTargetMatchers: OrganizationSyncTargetMatchers;
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
    } as AuthenticateContext;

    mockOrganizationSyncTargetMatchers = {
      OrganizationMatcher: null,
      PersonalAccountMatcher: null,
    };

    mockOptions = {
      organizationSyncOptions: {
        organizationPatterns: ['/org/:id'],
        personalAccountPatterns: ['/account'],
      },
    };

    handshakeService = new HandshakeService(mockAuthenticateContext, mockOrganizationSyncTargetMatchers, mockOptions);
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
  });

  describe.skip('resolveHandshake', () => {
    it('should resolve handshake with valid token', async () => {
      const mockJwt = {
        header: {
          typ: 'JWT',
          alg: 'RS256',
          kid: 'test-kid',
        },
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
      };
      const mockHandshakePayload = {
        handshake: ['cookie1=value1', 'session=session-token'],
      };

      const mockVerifyToken = vi.mocked(await import('../handshake.js')).verifyHandshakeToken;
      mockVerifyToken.mockResolvedValue(mockHandshakePayload);

      const mockVerifyTokenResult = vi.mocked(await import('../verify.js')).verifyToken;
      mockVerifyTokenResult.mockResolvedValue({
        data: mockJwt.payload,
        errors: undefined,
      });

      const mockDecodeJwt = vi.mocked(await import('../../jwt/verifyJwt.js')).decodeJwt;
      mockDecodeJwt.mockReturnValue({
        data: mockJwt,
        errors: undefined,
      });

      vi.mocked(await import('../handshake.js')).verifyHandshakeToken.mockResolvedValue(mockHandshakePayload);

      mockAuthenticateContext.handshakeToken = 'any-token';
      const result = await handshakeService.resolveHandshake();

      expect(result).toEqual(
        signedIn(
          mockAuthenticateContext,
          {
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
          expect.any(Headers),
          'session-token',
        ),
      );
    });

    it('should handle missing session token', async () => {
      const mockHandshakePayload = { handshake: ['cookie1=value1'] };
      const mockVerifyToken = vi.mocked(await import('../handshake.js')).verifyHandshakeToken;
      mockVerifyToken.mockResolvedValue(mockHandshakePayload);

      mockAuthenticateContext.handshakeToken = 'valid-token';
      const result = await handshakeService.resolveHandshake();

      expect(result).toEqual(
        signedOut(mockAuthenticateContext, AuthErrorReason.SessionTokenMissing, '', expect.any(Headers)),
      );
    });

    it('should handle development mode clock skew', async () => {
      mockAuthenticateContext.instanceType = 'development';

      const mockJwt = {
        header: {
          typ: 'JWT',
          alg: 'RS256',
          kid: 'test-kid',
        },
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
      };
      const mockHandshakePayload = {
        handshake: ['cookie1=value1', 'session=session-token'],
      };

      const mockVerifyToken = vi.mocked(await import('../handshake.js')).verifyHandshakeToken;
      mockVerifyToken.mockResolvedValue(mockHandshakePayload);

      const mockVerifyTokenResult = vi.mocked(await import('../verify.js')).verifyToken;
      mockVerifyTokenResult
        .mockRejectedValueOnce(
          new TokenVerificationError({
            reason: TokenVerificationErrorReason.TokenExpired,
            message: 'Token expired',
          }),
        )
        .mockResolvedValueOnce({
          data: mockJwt.payload,
          errors: undefined,
        });

      const mockDecodeJwt = vi.mocked(await import('../../jwt/verifyJwt.js')).decodeJwt;
      mockDecodeJwt.mockReturnValue({
        data: mockJwt,
        errors: undefined,
      });

      // Mock verifyHandshakeToken to return our mock data directly
      vi.mocked(await import('../handshake.js')).verifyHandshakeToken.mockResolvedValue(mockHandshakePayload);

      mockAuthenticateContext.handshakeToken = 'any-token';
      const result = await handshakeService.resolveHandshake();

      expect(result).toEqual(
        signedIn(
          mockAuthenticateContext,
          {
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
          expect.any(Headers),
          'session-token',
        ),
      );
    });
  });

  describe('handleHandshakeTokenVerificationErrorInDevelopment', () => {
    it('should throw specific error for invalid signature', () => {
      const error = new TokenVerificationError({
        reason: TokenVerificationErrorReason.TokenInvalidSignature,
        message: 'Invalid signature',
      });

      expect(() => handshakeService.handleHandshakeTokenVerificationErrorInDevelopment(error)).toThrow(
        'Clerk: Handshake token verification failed due to an invalid signature',
      );
    });

    it('should throw generic error for other verification failures', () => {
      const error = new TokenVerificationError({
        reason: TokenVerificationErrorReason.TokenExpired,
        message: 'Token expired',
      });

      expect(() => handshakeService.handleHandshakeTokenVerificationErrorInDevelopment(error)).toThrow(
        'Clerk: Handshake token verification failed: Token expired',
      );
    });
  });

  describe('setHandshakeInfiniteRedirectionLoopHeaders', () => {
    it('should return true after 3 redirects', () => {
      const headers = new Headers();
      handshakeService['handshakeRedirectLoopCounter'] = 3;

      const result = handshakeService.setHandshakeInfiniteRedirectionLoopHeaders(headers);

      expect(result).toBe(true);
      expect(headers.get('Set-Cookie')).toBeNull();
    });

    it('should increment counter and set cookie for first redirect', () => {
      const headers = new Headers();
      handshakeService['handshakeRedirectLoopCounter'] = 0;

      const result = handshakeService.setHandshakeInfiniteRedirectionLoopHeaders(headers);

      expect(result).toBe(false);
      expect(headers.get('Set-Cookie')).toContain('__clerk_redirect_count=1');
    });
  });
});
