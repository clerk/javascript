import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { inIframe } from '../../../utils/runtime';
import { SignIn } from '../SignIn';

vi.mock('../../../utils/runtime', () => ({
  inIframe: vi.fn(),
}));

const originalBuildVariant = global.__BUILD_VARIANT_CHIPS__;
global.__BUILD_VARIANT_CHIPS__ = true;

describe('SignIn', () => {
  let signIn: SignIn;
  let mockCreate: any;
  let mockBuildUrlWithAuth: any;

  beforeEach(() => {
    vi.clearAllMocks();

    const mockClerk = {
      buildUrlWithAuth: vi.fn((url: string) => `https://clerk.example.com${url}`),
    };

    const mockFapiClient = {
      buildEmailAddress: vi.fn(() => 'support@clerk.com'),
    };

    SignIn.clerk = mockClerk as any;

    Object.defineProperty(SignIn, 'fapiClient', {
      get: () => mockFapiClient,
      configurable: true,
    });

    signIn = new SignIn({
      id: 'test-signin-id',
      status: 'needs_first_factor',
      first_factor_verification: {
        status: 'unverified',
        external_verification_redirect_url: 'https://oauth.provider.com/auth',
      },
    } as any);

    mockCreate = vi.fn().mockResolvedValue({});
    signIn.create = mockCreate;

    mockBuildUrlWithAuth = vi.fn((url: string) => `https://clerk.example.com${url}`);
    SignIn.clerk.buildUrlWithAuth = mockBuildUrlWithAuth;
  });

  afterEach(() => {
    global.__BUILD_VARIANT_CHIPS__ = originalBuildVariant;
  });

  describe('authenticateWithRedirectOrPopup', () => {
    it('should set iframeContext to true when CHIPS build and in iframe', async () => {
      vi.mocked(inIframe).mockReturnValue(true);

      const params = {
        strategy: 'oauth_google' as const,
        redirectUrl: '/callback',
        identifier: 'test@example.com',
      };

      const mockNavigate = vi.fn();

      Object.defineProperty(signIn, 'firstFactorVerification', {
        value: {
          status: 'unverified',
          externalVerificationRedirectURL: 'https://oauth.provider.com/auth',
        },
        writable: true,
      });

      await signIn.authenticateWithRedirectOrPopup(params, mockNavigate);

      expect(mockCreate).toHaveBeenCalledWith({
        strategy: 'oauth_google',
        identifier: 'test@example.com',
        redirectUrl: 'https://clerk.example.com/callback',
        actionCompleteRedirectUrl: undefined,
        iframeContext: true,
      });
    });

    it('should not set iframeContext when not in iframe', async () => {
      vi.mocked(inIframe).mockReturnValue(false);

      const params = {
        strategy: 'oauth_google' as const,
        redirectUrl: '/callback',
        identifier: 'test@example.com',
      };

      const mockNavigate = vi.fn();

      Object.defineProperty(signIn, 'firstFactorVerification', {
        value: {
          status: 'unverified',
          externalVerificationRedirectURL: 'https://oauth.provider.com/auth',
        },
        writable: true,
      });

      await signIn.authenticateWithRedirectOrPopup(params, mockNavigate);

      expect(mockCreate).toHaveBeenCalledWith({
        strategy: 'oauth_google',
        identifier: 'test@example.com',
        redirectUrl: 'https://clerk.example.com/callback',
        actionCompleteRedirectUrl: undefined,
      });
      expect(mockCreate).toHaveBeenCalledWith(expect.not.objectContaining({ iframeContext: true }));
    });

    it('should not set iframeContext when not CHIPS build', async () => {
      global.__BUILD_VARIANT_CHIPS__ = false;

      vi.mocked(inIframe).mockReturnValue(true);

      const params = {
        strategy: 'oauth_google' as const,
        redirectUrl: '/callback',
        identifier: 'test@example.com',
      };

      const mockNavigate = vi.fn();

      Object.defineProperty(signIn, 'firstFactorVerification', {
        value: {
          status: 'unverified',
          externalVerificationRedirectURL: 'https://oauth.provider.com/auth',
        },
        writable: true,
      });

      await signIn.authenticateWithRedirectOrPopup(params, mockNavigate);

      expect(mockCreate).toHaveBeenCalledWith(expect.not.objectContaining({ iframeContext: true }));
    });

    it('should not set iframeContext when continueSignIn is true', async () => {
      vi.mocked(inIframe).mockReturnValue(true);

      const params = {
        strategy: 'oauth_google' as const,
        redirectUrl: '/callback',
        identifier: 'test@example.com',
        continueSignIn: true,
      };

      const mockNavigate = vi.fn();

      Object.defineProperty(signIn, 'firstFactorVerification', {
        value: {
          status: 'unverified',
          externalVerificationRedirectURL: 'https://oauth.provider.com/auth',
        },
        writable: true,
      });

      await signIn.authenticateWithRedirectOrPopup(params, mockNavigate);

      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  describe('SignInFuture.create', () => {
    it('should set iframeContext to true when CHIPS build and in iframe', async () => {
      global.__BUILD_VARIANT_CHIPS__ = true;
      vi.mocked(inIframe).mockReturnValue(true);

      const params = {
        strategy: 'oauth_google' as const,
        redirectUrl: '/callback',
        identifier: 'test@example.com',
      };

      const signInFuture = signIn.__internal_future;

      const mockBasePost = vi.fn().mockResolvedValue({});
      signInFuture.resource.__internal_basePost = mockBasePost;

      await signInFuture.create(params);

      expect(mockBasePost).toHaveBeenCalledWith({
        path: '/client/sign_ins',
        body: {
          strategy: 'oauth_google',
          redirectUrl: '/callback',
          identifier: 'test@example.com',
          iframeContext: true,
        },
      });
    });

    it('should not set iframeContext when not in iframe', async () => {
      vi.mocked(inIframe).mockReturnValue(false);

      const params = {
        strategy: 'oauth_google' as const,
        redirectUrl: '/callback',
        identifier: 'test@example.com',
      };

      const signInFuture = signIn.__internal_future;

      const mockBasePost = vi.fn().mockResolvedValue({});
      signInFuture.resource.__internal_basePost = mockBasePost;

      await signInFuture.create(params);

      expect(mockBasePost).toHaveBeenCalledWith({
        path: '/client/sign_ins',
        body: {
          strategy: 'oauth_google',
          redirectUrl: '/callback',
          identifier: 'test@example.com',
        },
      });
    });
  });
});
