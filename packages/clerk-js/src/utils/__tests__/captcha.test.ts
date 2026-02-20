import { beforeEach, describe, expect, it, vi } from 'vitest';

import { shouldRetryTurnstileErrorCode } from '../captcha/turnstile';
import type { CaptchaOptions } from '../captcha/types';

describe('shouldRetryTurnstileErrorCode', () => {
  it.each([
    ['crashed', true],
    ['undefined_error', true],
    ['102', true],
    ['102xxx', true],
    ['102002', true],
    ['103xxx', true],
    ['104xxx', true],
    ['106xxx', true],
    ['110600', true],
    ['200', true],
    ['200100', true],
    ['200xxx', true],
    ['300xxx', true],
    ['600xxx', true],
    ['100405', false],
    ['105001', false],
    ['110430', false],
  ])('should the error code %s trigger a retry: %s', (str, expected) => {
    expect(shouldRetryTurnstileErrorCode(str)).toBe(expected);
  });
});

describe('Nonce support', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('retrieveCaptchaInfo', () => {
    it('should extract nonce from clerk options when available', async () => {
      // Mock clerk instance with internal options
      const mockClerk = {
        __internal_environment: {
          displayConfig: {
            captchaProvider: 'turnstile',
            captchaPublicKey: 'test-site-key',
            captchaWidgetType: 'managed',
            captchaPublicKeyInvisible: 'test-invisible-key',
          },
          userSettings: {
            signUp: {
              captcha_enabled: true,
            },
          },
        },
        isStandardBrowser: true,
        __internal_getOption: vi.fn().mockReturnValue('test-nonce-123'),
      };

      const { retrieveCaptchaInfo } = await import('../captcha/retrieveCaptchaInfo');
      const result = retrieveCaptchaInfo(mockClerk as any);

      expect(mockClerk.__internal_getOption).toHaveBeenCalledWith('nonce');
      expect(result.nonce).toBe('test-nonce-123');
      expect(result.captchaSiteKey).toBe('test-site-key');
      expect(result.captchaProvider).toBe('turnstile');
    });

    it('should return undefined nonce when not available in clerk options', async () => {
      const mockClerk = {
        __internal_environment: {
          displayConfig: {
            captchaProvider: 'turnstile',
            captchaPublicKey: 'test-site-key',
            captchaWidgetType: 'managed',
            captchaPublicKeyInvisible: 'test-invisible-key',
          },
          userSettings: {
            signUp: {
              captcha_enabled: true,
            },
          },
        },
        isStandardBrowser: true,
        __internal_getOption: vi.fn().mockReturnValue(undefined),
      };

      const { retrieveCaptchaInfo } = await import('../captcha/retrieveCaptchaInfo');
      const result = retrieveCaptchaInfo(mockClerk as any);

      expect(result.nonce).toBeUndefined();
    });

    it('should handle clerk instance without __internal_getOption method', async () => {
      const mockClerk = {
        __internal_environment: {
          displayConfig: {
            captchaProvider: 'turnstile',
            captchaPublicKey: 'test-site-key',
            captchaWidgetType: 'managed',
            captchaPublicKeyInvisible: 'test-invisible-key',
          },
          userSettings: {
            signUp: {
              captcha_enabled: true,
            },
          },
        },
        isStandardBrowser: true,
        // No __internal_getOption method
      };

      const { retrieveCaptchaInfo } = await import('../captcha/retrieveCaptchaInfo');
      const result = retrieveCaptchaInfo(mockClerk as any);

      expect(result.nonce).toBeUndefined();
    });
  });

  describe('CaptchaOptions type support', () => {
    it('should accept nonce in CaptchaOptions type definition', () => {
      // This test verifies that the CaptchaOptions type includes the nonce field
      const validOptions: CaptchaOptions = {
        action: 'signup',
        captchaProvider: 'turnstile',
        closeModal: async () => {},
        invisibleSiteKey: 'test-invisible-key',
        modalContainerQuerySelector: '.modal',
        modalWrapperQuerySelector: '.wrapper',
        nonce: 'test-nonce-from-csp',
        openModal: async () => {},
        siteKey: 'test-site-key',
        widgetType: 'invisible',
      };

      // If this compiles without TypeScript errors, the test passes
      expect(validOptions.nonce).toBe('test-nonce-from-csp');
    });

    it('should allow undefined nonce in CaptchaOptions', () => {
      const validOptionsWithoutNonce: CaptchaOptions = {
        action: 'signup',
        captchaProvider: 'turnstile',
        invisibleSiteKey: 'test-invisible-key',
        siteKey: 'test-site-key',
        widgetType: 'invisible',
        // nonce is optional
      };

      expect(validOptionsWithoutNonce.nonce).toBeUndefined();
    });
  });

  describe('CaptchaChallenge nonce integration', () => {
    let mockClerk: any;

    beforeEach(() => {
      // Mock clerk instance
      mockClerk = {
        __internal_environment: {
          displayConfig: {
            captchaProvider: 'turnstile',
            captchaPublicKey: 'test-site-key',
            captchaWidgetType: 'managed',
            captchaPublicKeyInvisible: 'test-invisible-key',
          },
          userSettings: {
            signUp: {
              captcha_enabled: true,
            },
          },
        },
        isStandardBrowser: true,
        __internal_getOption: vi.fn().mockReturnValue('clerk-nonce-789'),
      };

      // Mock getCaptchaToken
      vi.doMock('../captcha/getCaptchaToken', () => ({
        getCaptchaToken: vi.fn().mockResolvedValue({
          captchaToken: 'mock-token',
          captchaWidgetType: 'invisible',
        }),
      }));
    });

    it('should use nonce from clerk options in invisible challenge', async () => {
      const { getCaptchaToken } = await import('../captcha/getCaptchaToken');
      const { CaptchaChallenge } = await import('../captcha/CaptchaChallenge');

      const challenge = new CaptchaChallenge(mockClerk);
      await challenge.invisible({ action: 'signup' });

      expect(getCaptchaToken).toHaveBeenCalledWith(
        expect.objectContaining({
          nonce: 'clerk-nonce-789',
          captchaProvider: 'turnstile',
          siteKey: 'test-invisible-key',
          widgetType: 'invisible',
        }),
      );
    });

    it('should use nonce from clerk options in managedOrInvisible challenge', async () => {
      const { getCaptchaToken } = await import('../captcha/getCaptchaToken');
      const { CaptchaChallenge } = await import('../captcha/CaptchaChallenge');

      const challenge = new CaptchaChallenge(mockClerk);
      await challenge.managedOrInvisible({ action: 'verify' });

      expect(getCaptchaToken).toHaveBeenCalledWith(
        expect.objectContaining({
          nonce: 'clerk-nonce-789',
          captchaProvider: 'turnstile',
          siteKey: 'test-site-key',
          widgetType: 'managed',
        }),
      );
    });

    it('should prefer explicit nonce over clerk options nonce', async () => {
      const { getCaptchaToken } = await import('../captcha/getCaptchaToken');
      const { CaptchaChallenge } = await import('../captcha/CaptchaChallenge');

      const challenge = new CaptchaChallenge(mockClerk);
      await challenge.invisible({
        action: 'signup',
        nonce: 'explicit-nonce-override',
      });

      expect(getCaptchaToken).toHaveBeenCalledWith(
        expect.objectContaining({
          nonce: 'explicit-nonce-override',
        }),
      );
    });

    it('should handle missing nonce gracefully', async () => {
      // Mock clerk without nonce
      const clerkWithoutNonce = {
        ...mockClerk,
        __internal_getOption: vi.fn().mockReturnValue(undefined),
      };

      const { getCaptchaToken } = await import('../captcha/getCaptchaToken');
      const { CaptchaChallenge } = await import('../captcha/CaptchaChallenge');

      const challenge = new CaptchaChallenge(clerkWithoutNonce);
      await challenge.invisible({ action: 'signup' });

      expect(getCaptchaToken).toHaveBeenCalledWith(
        expect.objectContaining({
          nonce: undefined,
        }),
      );
    });
  });
});
