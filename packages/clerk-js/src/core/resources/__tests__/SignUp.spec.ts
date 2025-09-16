import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { inIframe } from '../../../utils/runtime';
import { BaseResource } from '../internal';
import { SignUp } from '../SignUp';

vi.mock('../../../utils/runtime', () => ({
  inIframe: vi.fn(),
}));

const originalBuildVariant = global.__BUILD_VARIANT_CHIPS__;
global.__BUILD_VARIANT_CHIPS__ = true;

describe('SignUp', () => {
  let signUp: SignUp;
  let mockCreate: any;
  let mockUpdate: any;
  let mockBuildUrlWithAuth: any;

  beforeEach(() => {
    vi.clearAllMocks();

    const mockClerk = {
      buildUrlWithAuth: vi.fn((url: string) => `https://clerk.example.com${url}`),
      client: {
        id: 'test-client-id',
      },
      __unstable__environment: {
        displayConfig: {
          captchaOauthBypass: [],
        },
        userSettings: {
          signUp: {
            captcha_enabled: false,
          },
        },
      },
    };

    const mockFapiClient = {
      buildEmailAddress: vi.fn(() => 'support@clerk.com'),
    };

    SignUp.clerk = mockClerk as any;

    // Mock BaseResource.clerk for client ID access
    BaseResource.clerk = mockClerk as any;

    Object.defineProperty(SignUp, 'fapiClient', {
      get: () => mockFapiClient,
      configurable: true,
    });

    signUp = new SignUp({
      id: 'test-signup-id',
      status: 'missing_requirements',
      verifications: {
        external_account: {
          status: 'unverified',
          external_verification_redirect_url: 'https://oauth.provider.com/auth',
        },
      },
    } as any);

    mockCreate = vi.fn().mockResolvedValue({
      verifications: {
        externalAccount: {
          status: 'unverified',
          externalVerificationRedirectURL: 'https://oauth.provider.com/auth',
        },
      },
    });
    mockUpdate = vi.fn().mockResolvedValue({
      verifications: {
        externalAccount: {
          status: 'unverified',
          externalVerificationRedirectURL: 'https://oauth.provider.com/auth',
        },
      },
    });
    signUp._basePost = mockCreate;
    signUp._basePatch = mockUpdate;

    mockBuildUrlWithAuth = vi.fn((url: string) => `https://clerk.example.com${url}`);
    SignUp.clerk.buildUrlWithAuth = mockBuildUrlWithAuth;
  });

  afterEach(() => {
    global.__BUILD_VARIANT_CHIPS__ = originalBuildVariant;
  });

  describe('create', () => {
    it('should set clientId to true when CHIPS build and in iframe', async () => {
      global.__BUILD_VARIANT_CHIPS__ = true;
      vi.mocked(inIframe).mockReturnValue(true);

      const params = {
        strategy: 'oauth_google' as const,
        redirectUrl: '/callback',
        identifier: 'test@example.com',
      };

      await signUp.create(params);

      expect(mockCreate).toHaveBeenCalledWith({
        path: '/client/sign_ups',
        body: {
          strategy: 'oauth_google',
          redirectUrl: '/callback',
          identifier: 'test@example.com',
          clientId: 'test-client-id',
        },
      });
    });

    it('should not set clientId when not in iframe', async () => {
      vi.mocked(inIframe).mockReturnValue(false);

      const params = {
        strategy: 'oauth_google' as const,
        redirectUrl: '/callback',
        identifier: 'test@example.com',
      };

      await signUp.create(params);

      expect(mockCreate).toHaveBeenCalledWith({
        path: '/client/sign_ups',
        body: {
          strategy: 'oauth_google',
          redirectUrl: '/callback',
          identifier: 'test@example.com',
        },
      });
      expect(mockCreate).toHaveBeenCalledWith(
        expect.not.objectContaining({ body: expect.objectContaining({ clientId: 'test-client-id' }) }),
      );
    });

    it('should not set clientId when not CHIPS build', async () => {
      global.__BUILD_VARIANT_CHIPS__ = false;
      vi.mocked(inIframe).mockReturnValue(true);

      const params = {
        strategy: 'oauth_google' as const,
        redirectUrl: '/callback',
        identifier: 'test@example.com',
      };

      await signUp.create(params);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.not.objectContaining({ body: expect.objectContaining({ clientId: 'test-client-id' }) }),
      );
    });
  });

  describe('update', () => {
    it('should set clientId to true when CHIPS build and in iframe', async () => {
      global.__BUILD_VARIANT_CHIPS__ = true;
      vi.mocked(inIframe).mockReturnValue(true);

      const params = {
        strategy: 'oauth_google' as const,
        redirectUrl: '/callback',
        identifier: 'test@example.com',
      };

      await signUp.update(params);

      expect(mockUpdate).toHaveBeenCalledWith({
        body: {
          strategy: 'oauth_google',
          redirectUrl: '/callback',
          identifier: 'test@example.com',
          clientId: 'test-client-id',
        },
      });
    });

    it('should not set clientId when not in iframe', async () => {
      vi.mocked(inIframe).mockReturnValue(false);

      const params = {
        strategy: 'oauth_google' as const,
        redirectUrl: '/callback',
        identifier: 'test@example.com',
      };

      await signUp.update(params);

      expect(mockUpdate).toHaveBeenCalledWith({
        body: {
          strategy: 'oauth_google',
          redirectUrl: '/callback',
          identifier: 'test@example.com',
        },
      });
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.not.objectContaining({ body: expect.objectContaining({ clientId: 'test-client-id' }) }),
      );
    });

    it('should not set clientId when not CHIPS build', async () => {
      global.__BUILD_VARIANT_CHIPS__ = false;
      vi.mocked(inIframe).mockReturnValue(true);

      const params = {
        strategy: 'oauth_google' as const,
        redirectUrl: '/callback',
        identifier: 'test@example.com',
      };

      await signUp.update(params);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.not.objectContaining({ body: expect.objectContaining({ clientId: 'test-client-id' }) }),
      );
    });
  });

  describe('authenticateWithRedirectOrPopup', () => {
    it('should set clientId to true when CHIPS build and in iframe for create flow', async () => {
      global.__BUILD_VARIANT_CHIPS__ = true;
      vi.mocked(inIframe).mockReturnValue(true);

      const params = {
        strategy: 'oauth_google' as const,
        redirectUrl: '/callback',
        identifier: 'test@example.com',
        continueSignUp: false,
      };

      const mockNavigate = vi.fn();

      const mockVerifications = {
        externalAccount: {
          status: 'unverified',
          externalVerificationRedirectURL: 'https://oauth.provider.com/auth',
        },
      };
      Object.defineProperty(signUp, 'verifications', {
        value: mockVerifications,
        writable: true,
      });

      await signUp.authenticateWithRedirectOrPopup(params, mockNavigate);

      expect(mockCreate).toHaveBeenCalledWith({
        path: '/client/sign_ups',
        body: {
          strategy: 'oauth_google',
          redirectUrl: 'https://clerk.example.com/callback',
          actionCompleteRedirectUrl: undefined,
          unsafeMetadata: undefined,
          emailAddress: undefined,
          legalAccepted: undefined,
          oidcPrompt: undefined,
          clientId: 'test-client-id',
        },
      });
    });

    it('should set clientId to true when CHIPS build and in iframe for update flow', async () => {
      global.__BUILD_VARIANT_CHIPS__ = true;
      vi.mocked(inIframe).mockReturnValue(true);

      const params = {
        strategy: 'oauth_google' as const,
        redirectUrl: '/callback',
        identifier: 'test@example.com',
        continueSignUp: true,
      };

      const mockNavigate = vi.fn();

      const mockVerifications = {
        externalAccount: {
          status: 'unverified',
          externalVerificationRedirectURL: 'https://oauth.provider.com/auth',
        },
      };
      Object.defineProperty(signUp, 'verifications', {
        value: mockVerifications,
        writable: true,
      });

      await signUp.authenticateWithRedirectOrPopup(params, mockNavigate);

      expect(mockUpdate).toHaveBeenCalledWith({
        body: {
          strategy: 'oauth_google',
          redirectUrl: 'https://clerk.example.com/callback',
          actionCompleteRedirectUrl: undefined,
          unsafeMetadata: undefined,
          emailAddress: undefined,
          legalAccepted: undefined,
          oidcPrompt: undefined,
          clientId: 'test-client-id',
        },
      });
    });
  });
});
