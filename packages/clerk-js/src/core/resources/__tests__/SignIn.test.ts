import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { eventBus } from '../../events';
import { signInErrorSignal, signInResourceSignal } from '../../signals';
import { BaseResource } from '../internal';
import { SignIn } from '../SignIn';

// Mock the authenticateWithPopup module
vi.mock('../../../utils/authenticateWithPopup', async () => {
  const actual = await vi.importActual('../../../utils/authenticateWithPopup');
  return {
    ...actual,
    _futureAuthenticateWithPopup: vi.fn(),
  };
});

// Import the mocked function after mocking
import { _futureAuthenticateWithPopup } from '../../../utils/authenticateWithPopup';

// Mock the CaptchaChallenge module
vi.mock('../../../utils/captcha/CaptchaChallenge', () => ({
  CaptchaChallenge: vi.fn().mockImplementation(() => ({
    managedOrInvisible: vi.fn().mockResolvedValue({
      captchaToken: 'mock_captcha_token',
      captchaWidgetType: 'invisible',
    }),
  })),
}));

describe('SignIn', () => {
  it('can be serialized with JSON.stringify', () => {
    const signIn = new SignIn();
    const snapshot = JSON.stringify(signIn);
    expect(snapshot).toBeDefined();
  });

  describe('signIn.create', () => {
    afterEach(() => {
      vi.clearAllMocks();
      vi.unstubAllGlobals();
    });

    it('includes locale in request body when navigator.language is available', async () => {
      vi.stubGlobal('navigator', { language: 'fr-FR' });

      const mockFetch = vi.fn().mockResolvedValue({
        client: null,
        response: { id: 'signin_123', status: 'needs_first_factor' },
      });
      BaseResource._fetch = mockFetch;

      const signIn = new SignIn();
      SignIn.clerk = {
        client: {
          captchaBypass: false,
        },
      } as any;

      await signIn.create({ identifier: 'user@example.com' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/client/sign_ins',
          body: {
            identifier: 'user@example.com',
            locale: 'fr-FR',
          },
        }),
      );
    });

    it('excludes locale from request body when navigator.language is empty', async () => {
      vi.stubGlobal('navigator', { language: '' });

      const mockFetch = vi.fn().mockResolvedValue({
        client: null,
        response: { id: 'signin_123', status: 'needs_first_factor' },
      });
      BaseResource._fetch = mockFetch;

      const signIn = new SignIn();
      SignIn.clerk = {
        client: {
          captchaBypass: false,
        },
      } as any;

      await signIn.create({ identifier: 'user@example.com' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/client/sign_ins',
          body: {
            identifier: 'user@example.com',
          },
        }),
      );
    });

    it('includes captcha params when sign_up_if_missing is true', async () => {
      vi.stubGlobal('__BUILD_DISABLE_RHC__', false);

      const mockFetch = vi.fn().mockResolvedValue({
        client: null,
        response: { id: 'signin_123', status: 'needs_first_factor' },
      });
      BaseResource._fetch = mockFetch;

      const signIn = new SignIn();
      SignIn.clerk = {
        client: {
          captchaBypass: false,
        },
        isStandardBrowser: true,
        __internal_environment: {
          displayConfig: {
            captchaOauthBypass: [],
            captchaPublicKey: 'test-site-key',
            captchaPublicKeyInvisible: 'test-invisible-key',
            captchaProvider: 'turnstile',
            captchaWidgetType: 'invisible',
          },
          userSettings: {
            signUp: {
              captcha_enabled: true,
            },
          },
        },
      } as any;

      await signIn.create({ identifier: 'user@example.com', sign_up_if_missing: true });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/client/sign_ins',
          body: expect.objectContaining({
            identifier: 'user@example.com',
            sign_up_if_missing: true,
            captchaToken: 'mock_captcha_token',
            captchaWidgetType: 'invisible',
          }),
        }),
      );
    });

    it('excludes captcha params when sign_up_if_missing is false', async () => {
      vi.stubGlobal('__BUILD_DISABLE_RHC__', false);

      const mockFetch = vi.fn().mockResolvedValue({
        client: null,
        response: { id: 'signin_123', status: 'needs_first_factor' },
      });
      BaseResource._fetch = mockFetch;

      const signIn = new SignIn();
      SignIn.clerk = {
        client: {
          captchaBypass: false,
        },
        isStandardBrowser: true,
        __internal_environment: {
          displayConfig: {
            captchaOauthBypass: [],
            captchaPublicKey: 'test-site-key',
            captchaPublicKeyInvisible: 'test-invisible-key',
            captchaProvider: 'turnstile',
            captchaWidgetType: 'invisible',
          },
          userSettings: {
            signUp: {
              captcha_enabled: true,
            },
          },
        },
      } as any;

      await signIn.create({ identifier: 'user@example.com', sign_up_if_missing: false });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/client/sign_ins',
          body: expect.not.objectContaining({
            captchaToken: expect.anything(),
            captchaWidgetType: expect.anything(),
          }),
        }),
      );
    });
  });

  describe('SignInFuture', () => {
    it('can be serialized with JSON.stringify', () => {
      const signIn = new SignIn();
      const snapshot = JSON.stringify(signIn.__internal_future);
      expect(snapshot).toBeDefined();
    });

    describe('selectFirstFactor', () => {
      beforeAll(() => {
        const signInCreatedJSON = {
          id: 'test_id',

          supported_first_factors: [
            { strategy: 'email_code', emailAddressId: 'email_address_0', safe_identifier: 'test+abc@clerk.com' },
            { strategy: 'email_code', emailAddressId: 'email_address_1', safe_identifier: 'test@clerk.com' },
            { strategy: 'phone_code', phoneNumberId: 'phone_number_1', safe_identifier: '+301234567890' },
          ],
        };

        const firstFactorPreparedJSON = {};

        BaseResource._fetch = vi.fn().mockImplementation(({ method, path, body }) => {
          if (method === 'POST' && path === '/client/sign_ins') {
            return Promise.resolve({
              client: null,
              response: { ...signInCreatedJSON, identifier: body.identifier },
            });
          }

          if (method === 'POST' && path === '/client/sign_ins/test_id/prepare_first_factor') {
            return Promise.resolve({
              client: null,
              response: firstFactorPreparedJSON,
            });
          }

          throw new Error('Unexpected call to BaseResource._fetch');
        });
      });

      it('should select correct first factor by email address', async () => {
        const signIn = new SignIn();
        await signIn.__internal_future.emailCode.sendCode({ emailAddress: 'test@clerk.com' });
        expect(BaseResource._fetch).toHaveBeenLastCalledWith({
          method: 'POST',
          path: '/client/sign_ins/test_id/prepare_first_factor',
          body: {
            emailAddressId: 'email_address_1',
            strategy: 'email_code',
          },
        });
      });

      it('should select correct first factor by email address ID', async () => {
        const signIn = new SignIn();
        await signIn.__internal_future.create({ identifier: 'test@clerk.com' });
        await signIn.__internal_future.emailCode.sendCode({ emailAddressId: 'email_address_1' });
        expect(BaseResource._fetch).toHaveBeenLastCalledWith({
          method: 'POST',
          path: '/client/sign_ins/test_id/prepare_first_factor',
          body: {
            emailAddressId: 'email_address_1',
            strategy: 'email_code',
          },
        });
      });

      it('should select correct first factor matching identifier when nothing is provided', async () => {
        const signIn = new SignIn();
        await signIn.__internal_future.create({ identifier: 'test@clerk.com' });
        await signIn.__internal_future.emailCode.sendCode();
        expect(BaseResource._fetch).toHaveBeenLastCalledWith({
          method: 'POST',
          path: '/client/sign_ins/test_id/prepare_first_factor',
          body: {
            emailAddressId: 'email_address_1',
            strategy: 'email_code',
          },
        });
      });

      it('should select correct first factor when nothing is provided', async () => {
        const signIn = new SignIn();
        await signIn.__internal_future.create({ identifier: '+12255550000' });
        await signIn.__internal_future.emailCode.sendCode();
        expect(BaseResource._fetch).toHaveBeenLastCalledWith({
          method: 'POST',
          path: '/client/sign_ins/test_id/prepare_first_factor',
          body: {
            emailAddressId: 'email_address_0',
            strategy: 'email_code',
          },
        });
      });
    });

    describe('create', () => {
      afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
      });

      it('includes locale in request body when navigator.language is available', async () => {
        vi.stubGlobal('navigator', { language: 'es-ES' });

        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: { id: 'signin_123', status: 'needs_first_factor' },
        });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn();
        await signIn.__internal_future.create({ identifier: 'user@example.com' });

        expect(mockFetch).toHaveBeenCalledWith({
          method: 'POST',
          path: '/client/sign_ins',
          body: {
            identifier: 'user@example.com',
            locale: 'es-ES',
          },
        });
      });

      it('excludes locale from request body when navigator.language is empty', async () => {
        vi.stubGlobal('navigator', { language: '' });

        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: { id: 'signin_123', status: 'needs_first_factor' },
        });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn();
        await signIn.__internal_future.create({ identifier: 'user@example.com' });

        expect(mockFetch).toHaveBeenCalledWith({
          method: 'POST',
          path: '/client/sign_ins',
          body: {
            identifier: 'user@example.com',
          },
        });
      });

      it('returns error property on success', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: { id: 'signin_123', status: 'needs_first_factor' },
        });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn();
        const result = await signIn.__internal_future.create({ identifier: 'user@example.com' });

        expect(result).toHaveProperty('error', null);
      });

      it('returns error property on failure', async () => {
        const mockError = new Error('Test error');
        const mockFetch = vi.fn().mockRejectedValue(mockError);
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn();
        const result = await signIn.__internal_future.create({ identifier: 'user@example.com' });

        expect(result).toHaveProperty('error', mockError);
      });

      it('includes captcha params when sign_up_if_missing is true', async () => {
        vi.stubGlobal('__BUILD_DISABLE_RHC__', false);

        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: { id: 'signin_123', status: 'needs_first_factor' },
        });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn();
        SignIn.clerk = {
          client: {
            captchaBypass: false,
          },
          isStandardBrowser: true,
          __internal_environment: {
            displayConfig: {
              captchaOauthBypass: [],
              captchaPublicKey: 'test-site-key',
              captchaPublicKeyInvisible: 'test-invisible-key',
              captchaProvider: 'turnstile',
              captchaWidgetType: 'invisible',
            },
            userSettings: {
              signUp: {
                captcha_enabled: true,
              },
            },
          },
        } as any;

        await signIn.__internal_future.create({ identifier: 'user@example.com', sign_up_if_missing: true });

        expect(mockFetch).toHaveBeenCalledWith({
          method: 'POST',
          path: '/client/sign_ins',
          body: {
            identifier: 'user@example.com',
            sign_up_if_missing: true,
            captchaToken: 'mock_captcha_token',
            captchaWidgetType: 'invisible',
          },
        });
      });

      it('excludes captcha params when sign_up_if_missing is false', async () => {
        vi.stubGlobal('__BUILD_DISABLE_RHC__', false);

        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: { id: 'signin_123', status: 'needs_first_factor' },
        });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn();
        SignIn.clerk = {
          client: {
            captchaBypass: false,
          },
          isStandardBrowser: true,
          __internal_environment: {
            displayConfig: {
              captchaOauthBypass: [],
              captchaPublicKey: 'test-site-key',
              captchaPublicKeyInvisible: 'test-invisible-key',
              captchaProvider: 'turnstile',
              captchaWidgetType: 'invisible',
            },
            userSettings: {
              signUp: {
                captcha_enabled: true,
              },
            },
          },
        } as any;

        await signIn.__internal_future.create({ identifier: 'user@example.com', sign_up_if_missing: false });

        expect(mockFetch).toHaveBeenCalledWith({
          method: 'POST',
          path: '/client/sign_ins',
          body: {
            identifier: 'user@example.com',
            sign_up_if_missing: false,
          },
        });
      });

      it('excludes captcha params when sign_up_if_missing is not provided', async () => {
        vi.stubGlobal('__BUILD_DISABLE_RHC__', false);

        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: { id: 'signin_123', status: 'needs_first_factor' },
        });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn();
        SignIn.clerk = {
          client: {
            captchaBypass: false,
          },
          isStandardBrowser: true,
          __internal_environment: {
            displayConfig: {
              captchaOauthBypass: [],
              captchaPublicKey: 'test-site-key',
              captchaPublicKeyInvisible: 'test-invisible-key',
              captchaProvider: 'turnstile',
              captchaWidgetType: 'invisible',
            },
            userSettings: {
              signUp: {
                captcha_enabled: true,
              },
            },
          },
        } as any;

        await signIn.__internal_future.create({ identifier: 'user@example.com' });

        expect(mockFetch).toHaveBeenCalledWith({
          method: 'POST',
          path: '/client/sign_ins',
          body: {
            identifier: 'user@example.com',
          },
        });
      });
    });

    describe('password', () => {
      afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
      });

      it('uses identifier parameter when provided', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: { id: 'signin_123', status: 'needs_first_factor' },
        });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn();
        await signIn.__internal_future.password({ identifier: 'user@example.com', password: 'password123' });

        expect(mockFetch).toHaveBeenCalledWith({
          method: 'POST',
          path: '/client/sign_ins',
          body: {
            identifier: 'user@example.com',
            password: 'password123',
          },
        });
      });

      it('uses emailAddress parameter when provided', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: { id: 'signin_123', status: 'needs_first_factor' },
        });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn();
        await signIn.__internal_future.password({ emailAddress: 'user@example.com', password: 'password123' });

        expect(mockFetch).toHaveBeenCalledWith({
          method: 'POST',
          path: '/client/sign_ins',
          body: {
            identifier: 'user@example.com',
            password: 'password123',
          },
        });
      });

      it('uses phoneNumber parameter when provided', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: { id: 'signin_123', status: 'needs_first_factor' },
        });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn();
        await signIn.__internal_future.password({ phoneNumber: '+15551234567', password: 'password123' });

        expect(mockFetch).toHaveBeenCalledWith({
          method: 'POST',
          path: '/client/sign_ins',
          body: {
            identifier: '+15551234567',
            password: 'password123',
          },
        });
      });

      it('includes locale in request body when navigator.language is available', async () => {
        vi.stubGlobal('navigator', { language: 'de-DE' });

        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: { id: 'signin_123', status: 'needs_first_factor' },
        });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn();
        await signIn.__internal_future.password({ identifier: 'user@example.com', password: 'password123' });

        expect(mockFetch).toHaveBeenCalledWith({
          method: 'POST',
          path: '/client/sign_ins',
          body: {
            identifier: 'user@example.com',
            password: 'password123',
            locale: 'de-DE',
          },
        });
      });

      it('uses previous identifier when no identifier parameter is provided', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: { id: 'signin_123', status: 'needs_first_factor', identifier: 'user@example.com' },
        });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn();
        await signIn.__internal_future.create({ identifier: 'user@example.com' });

        mockFetch.mockClear();
        await signIn.__internal_future.password({ password: 'password123' });

        expect(mockFetch).toHaveBeenCalledWith({
          method: 'POST',
          path: '/client/sign_ins',
          body: {
            identifier: 'user@example.com',
            password: 'password123',
          },
        });
      });

      it('throws error when multiple identifier types are provided', async () => {
        const signIn = new SignIn();

        await expect(
          signIn.__internal_future.password({
            identifier: 'user@example.com',
            emailAddress: 'other@example.com',
            password: 'password123',
          } as any),
        ).rejects.toThrow();
      });
    });

    describe('sendEmailCode', () => {
      afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
      });

      it('creates signIn with emailAddress when no existing signIn', async () => {
        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signin_123',
              identifier: 'user@example.com',
              supported_first_factors: [{ strategy: 'email_code', emailAddressId: 'email_123' }],
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: { id: 'signin_123' },
          });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn();
        await signIn.__internal_future.emailCode.sendCode({ emailAddress: 'user@example.com' });

        expect(mockFetch).toHaveBeenNthCalledWith(1, {
          method: 'POST',
          path: '/client/sign_ins',
          body: { identifier: 'user@example.com' },
        });

        expect(mockFetch).toHaveBeenNthCalledWith(2, {
          method: 'POST',
          path: '/client/sign_ins/signin_123/prepare_first_factor',
          body: {
            emailAddressId: 'email_123',
            strategy: 'email_code',
          },
        });
      });

      it('uses emailAddressId when provided with existing signIn', async () => {
        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signin_123',
              identifier: 'user@example.com',
              supported_first_factors: [
                { strategy: 'email_code', emailAddressId: 'email_123' },
                { strategy: 'email_code', emailAddressId: 'email_456' },
              ],
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: { id: 'signin_123' },
          });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn();
        await signIn.__internal_future.create({ identifier: 'user@example.com' });
        await signIn.__internal_future.emailCode.sendCode({ emailAddressId: 'email_456' });

        expect(mockFetch).toHaveBeenLastCalledWith({
          method: 'POST',
          path: '/client/sign_ins/signin_123/prepare_first_factor',
          body: {
            emailAddressId: 'email_456',
            strategy: 'email_code',
          },
        });
      });

      it('throws error when emailAddressId is provided without existing signIn', async () => {
        const signIn = new SignIn();

        await expect(signIn.__internal_future.emailCode.sendCode({ emailAddressId: 'email_123' })).rejects.toThrow();
      });

      it('throws error when no emailAddress and no existing signIn', async () => {
        const signIn = new SignIn();

        await expect(signIn.__internal_future.emailCode.sendCode()).rejects.toThrow();
      });

      it('throws error when email code factor not found', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: {
            id: 'signin_123',
            identifier: 'user@example.com',
            supported_first_factors: [{ strategy: 'password' }],
          },
        });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn();
        const result = await signIn.__internal_future.emailCode.sendCode({ emailAddress: 'user@example.com' });

        expect(result.error).toBeTruthy();
        expect(result.error?.code).toBe('factor_not_found');
      });
    });

    describe('sendEmailLink', () => {
      afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
      });

      it('creates signIn with emailAddress when no existing signIn', async () => {
        vi.stubGlobal('window', { location: { origin: 'https://example.com' } });

        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signin_123',
              identifier: 'user@example.com',
              supported_first_factors: [{ strategy: 'email_link', emailAddressId: 'email_123' }],
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: { id: 'signin_123' },
          });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn();
        await signIn.__internal_future.emailLink.sendLink({
          emailAddress: 'user@example.com',
          verificationUrl: '/verify',
        });

        expect(mockFetch).toHaveBeenNthCalledWith(2, {
          method: 'POST',
          path: '/client/sign_ins/signin_123/prepare_first_factor',
          body: {
            emailAddressId: 'email_123',
            redirectUrl: 'https://example.com/verify',
            strategy: 'email_link',
          },
        });
      });

      it('handles absolute verificationUrl', async () => {
        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signin_123',
              identifier: 'user@example.com',
              supported_first_factors: [{ strategy: 'email_link', emailAddressId: 'email_123' }],
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: { id: 'signin_123' },
          });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn();
        await signIn.__internal_future.emailLink.sendLink({
          emailAddress: 'user@example.com',
          verificationUrl: 'https://other.com/verify',
        });

        expect(mockFetch).toHaveBeenNthCalledWith(2, {
          method: 'POST',
          path: '/client/sign_ins/signin_123/prepare_first_factor',
          body: {
            emailAddressId: 'email_123',
            redirectUrl: 'https://other.com/verify',
            strategy: 'email_link',
          },
        });
      });

      it('uses emailAddressId when provided with existing signIn', async () => {
        vi.stubGlobal('window', { location: { origin: 'https://example.com' } });

        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signin_123',
              identifier: 'user@example.com',
              supported_first_factors: [
                { strategy: 'email_link', emailAddressId: 'email_123' },
                { strategy: 'email_link', emailAddressId: 'email_456' },
              ],
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: { id: 'signin_123' },
          });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn();
        await signIn.__internal_future.create({ identifier: 'user@example.com' });
        await signIn.__internal_future.emailLink.sendLink({ emailAddressId: 'email_456', verificationUrl: '/verify' });

        expect(mockFetch).toHaveBeenLastCalledWith({
          method: 'POST',
          path: '/client/sign_ins/signin_123/prepare_first_factor',
          body: {
            emailAddressId: 'email_456',
            redirectUrl: 'https://example.com/verify',
            strategy: 'email_link',
          },
        });
      });

      it('throws error when emailAddressId is provided without existing signIn', async () => {
        const signIn = new SignIn();

        await expect(
          signIn.__internal_future.emailLink.sendLink({ emailAddressId: 'email_123', verificationUrl: '/verify' }),
        ).rejects.toThrow();
      });

      it('throws error when no emailAddress and no existing signIn', async () => {
        const signIn = new SignIn();

        await expect(signIn.__internal_future.emailLink.sendLink({ verificationUrl: '/verify' })).rejects.toThrow();
      });

      it('returns error when email link factor not found', async () => {
        vi.stubGlobal('window', { location: { origin: 'https://example.com' } });

        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: {
            id: 'signin_123',
            identifier: 'user@example.com',
            supported_first_factors: [{ strategy: 'password' }],
          },
        });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn();
        const result = await signIn.__internal_future.emailLink.sendLink({
          emailAddress: 'user@example.com',
          verificationUrl: '/verify',
        });

        expect(result.error).toBeTruthy();
        expect(result.error?.code).toBe('factor_not_found');
      });
    });

    describe('waitForEmailLinkVerification', () => {
      afterEach(() => {
        vi.clearAllMocks();
      });

      it('polls until firstFactorVerification status is verified', async () => {
        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signin_123',
              first_factor_verification: { status: 'unverified' },
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signin_123',
              first_factor_verification: { status: 'verified' },
            },
          });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn({ id: 'signin_123' } as any);
        await signIn.__internal_future.emailLink.waitForVerification();

        expect(mockFetch).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'GET',
            path: '/client/sign_ins/signin_123',
          }),
          expect.anything(),
        );
      });

      it('polls until firstFactorVerification status is expired', async () => {
        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signin_123',
              first_factor_verification: { status: 'unverified' },
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signin_123',
              first_factor_verification: { status: 'expired' },
            },
          });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn({ id: 'signin_123' } as any);
        await signIn.__internal_future.emailLink.waitForVerification();

        expect(mockFetch).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'GET',
            path: '/client/sign_ins/signin_123',
          }),
          expect.anything(),
        );
      });
    });

    describe('sendPhoneCode', () => {
      afterEach(() => {
        vi.clearAllMocks();
      });

      it('creates signIn with phoneNumber when no existing signIn', async () => {
        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signin_123',
              identifier: '+15551234567',
              supported_first_factors: [{ strategy: 'phone_code', phoneNumberId: 'phone_123' }],
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: { id: 'signin_123' },
          });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn();
        await signIn.__internal_future.phoneCode.sendCode({ phoneNumber: '+15551234567' });

        expect(mockFetch).toHaveBeenNthCalledWith(1, {
          method: 'POST',
          path: '/client/sign_ins',
          body: { identifier: '+15551234567' },
        });

        expect(mockFetch).toHaveBeenNthCalledWith(2, {
          method: 'POST',
          path: '/client/sign_ins/signin_123/prepare_first_factor',
          body: {
            phoneNumberId: 'phone_123',
            strategy: 'phone_code',
            channel: 'sms',
          },
        });
      });

      it('uses whatsapp channel when specified', async () => {
        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signin_123',
              identifier: '+15551234567',
              supported_first_factors: [{ strategy: 'phone_code', phoneNumberId: 'phone_123' }],
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: { id: 'signin_123' },
          });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn();
        await signIn.__internal_future.phoneCode.sendCode({ phoneNumber: '+15551234567', channel: 'whatsapp' });

        expect(mockFetch).toHaveBeenNthCalledWith(2, {
          method: 'POST',
          path: '/client/sign_ins/signin_123/prepare_first_factor',
          body: {
            phoneNumberId: 'phone_123',
            strategy: 'phone_code',
            channel: 'whatsapp',
          },
        });
      });

      it('uses phoneNumberId when provided with existing signIn', async () => {
        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signin_123',
              identifier: '+15551234567',
              supported_first_factors: [
                { strategy: 'phone_code', phoneNumberId: 'phone_123' },
                { strategy: 'phone_code', phoneNumberId: 'phone_456' },
              ],
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: { id: 'signin_123' },
          });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn();
        await signIn.__internal_future.create({ identifier: '+15551234567' });
        await signIn.__internal_future.phoneCode.sendCode({ phoneNumberId: 'phone_456' });

        expect(mockFetch).toHaveBeenLastCalledWith({
          method: 'POST',
          path: '/client/sign_ins/signin_123/prepare_first_factor',
          body: {
            phoneNumberId: 'phone_456',
            strategy: 'phone_code',
            channel: 'sms',
          },
        });
      });

      it('throws error when phoneNumberId is provided without existing signIn', async () => {
        const signIn = new SignIn();

        await expect(signIn.__internal_future.phoneCode.sendCode({ phoneNumberId: 'phone_123' })).rejects.toThrow();
      });

      it('throws error when no phoneNumber and no existing signIn', async () => {
        const signIn = new SignIn();

        await expect(signIn.__internal_future.phoneCode.sendCode()).rejects.toThrow();
      });

      it('returns error when phone code factor not found', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: {
            id: 'signin_123',
            identifier: '+15551234567',
            supported_first_factors: [{ strategy: 'password' }],
          },
        });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn();
        const result = await signIn.__internal_future.phoneCode.sendCode({ phoneNumber: '+15551234567' });

        expect(result.error).toBeTruthy();
        expect(result.error?.code).toBe('factor_not_found');
      });
    });

    describe('sendResetPasswordEmailCode', () => {
      afterEach(() => {
        vi.clearAllMocks();
      });

      it('prepares first factor with reset password email code', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: { id: 'signin_123' },
        });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn({
          id: 'signin_123',
          supported_first_factors: [
            {
              strategy: 'reset_password_email_code',
              email_address_id: 'email_123',
              safe_identifier: 'test@example.com',
            },
          ],
        } as any);
        await signIn.__internal_future.resetPasswordEmailCode.sendCode();

        expect(mockFetch).toHaveBeenCalledWith({
          method: 'POST',
          path: '/client/sign_ins/signin_123/prepare_first_factor',
          body: {
            emailAddressId: 'email_123',
            strategy: 'reset_password_email_code',
          },
        });
      });

      it('throws error when no signIn ID', async () => {
        const signIn = new SignIn();

        await expect(signIn.__internal_future.resetPasswordEmailCode.sendCode()).rejects.toThrow();
      });

      it('returns error when reset password email code factor not found', async () => {
        const signIn = new SignIn({
          id: 'signin_123',
          supported_first_factors: [{ strategy: 'password' }],
        } as any);
        const result = await signIn.__internal_future.resetPasswordEmailCode.sendCode();

        expect(result.error).toBeTruthy();
        expect(result.error?.code).toBe('factor_not_found');
      });
    });

    describe('submitResetPassword', () => {
      afterEach(() => {
        vi.clearAllMocks();
      });

      it('resets password with default signOutOfOtherSessions', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: { id: 'signin_123' },
        });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn({ id: 'signin_123' } as any);
        await signIn.__internal_future.resetPasswordEmailCode.submitPassword({ password: 'newPassword123' });

        expect(mockFetch).toHaveBeenCalledWith({
          method: 'POST',
          path: '/client/sign_ins/signin_123/reset_password',
          body: {
            password: 'newPassword123',
            signOutOfOtherSessions: true,
          },
        });
      });

      it('resets password with signOutOfOtherSessions false', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: { id: 'signin_123' },
        });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn({ id: 'signin_123' } as any);
        await signIn.__internal_future.resetPasswordEmailCode.submitPassword({
          password: 'newPassword123',
          signOutOfOtherSessions: false,
        });

        expect(mockFetch).toHaveBeenCalledWith({
          method: 'POST',
          path: '/client/sign_ins/signin_123/reset_password',
          body: {
            password: 'newPassword123',
            signOutOfOtherSessions: false,
          },
        });
      });
    });

    describe('sendMFAPhoneCode', () => {
      afterEach(() => {
        vi.clearAllMocks();
      });

      it('prepares second factor with phone code', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: { id: 'signin_123' },
        });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn({
          id: 'signin_123',
          supported_second_factors: [
            { strategy: 'phone_code', phone_number_id: 'phone_123', safe_identifier: '+15551234567' },
          ],
        } as any);
        await signIn.__internal_future.mfa.sendPhoneCode();

        expect(mockFetch).toHaveBeenCalledWith({
          method: 'POST',
          path: '/client/sign_ins/signin_123/prepare_second_factor',
          body: {
            phoneNumberId: 'phone_123',
            strategy: 'phone_code',
          },
        });
      });

      it('returns error when phone code factor not found', async () => {
        const signIn = new SignIn({
          id: 'signin_123',
          supported_second_factors: [{ strategy: 'totp' }],
        } as any);
        const result = await signIn.__internal_future.mfa.sendPhoneCode();

        expect(result.error).toBeTruthy();
        expect(result.error?.code).toBe('factor_not_found');
      });
    });

    describe('sendMFAEmailCode', () => {
      afterEach(() => {
        vi.clearAllMocks();
      });

      it('prepares second factor with email code', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: { id: 'signin_123' },
        });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn({
          id: 'signin_123',
          supported_second_factors: [
            { strategy: 'email_code', email_address_id: 'email_123', safe_identifier: 'user@example.com' },
          ],
        } as any);
        await signIn.__internal_future.mfa.sendEmailCode();

        expect(mockFetch).toHaveBeenCalledWith({
          method: 'POST',
          path: '/client/sign_ins/signin_123/prepare_second_factor',
          body: {
            emailAddressId: 'email_123',
            strategy: 'email_code',
          },
        });
      });

      it('returns error when email code factor not found', async () => {
        const signIn = new SignIn({
          id: 'signin_123',
          supported_second_factors: [{ strategy: 'totp' }],
        } as any);
        const result = await signIn.__internal_future.mfa.sendEmailCode();

        expect(result.error).toBeTruthy();
        expect(result.error?.code).toBe('factor_not_found');
      });
    });

    describe('passkey', () => {
      afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
      });

      it('prepares first factor for passkey in standard flow', async () => {
        const mockIsWebAuthnSupported = vi.fn().mockReturnValue(true);
        const mockWebAuthnGetCredential = vi.fn().mockResolvedValue({
          publicKeyCredential: {
            id: 'credential_123',
            rawId: new ArrayBuffer(32),
            response: {
              authenticatorData: new ArrayBuffer(37),
              clientDataJSON: new ArrayBuffer(121),
              signature: new ArrayBuffer(64),
              userHandle: null,
            },
            type: 'public-key',
          },
          error: null,
        });

        SignIn.clerk = {
          __internal_isWebAuthnSupported: mockIsWebAuthnSupported,
          __internal_getPublicCredentials: mockWebAuthnGetCredential,
        } as any;

        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signin_123',
              supported_first_factors: [{ strategy: 'passkey' }],
              first_factor_verification: {
                nonce: JSON.stringify({ challenge: 'Y2hhbGxlbmdl' }),
              },
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: { id: 'signin_123', status: 'complete' },
          });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn({
          id: 'signin_123',
          supported_first_factors: [{ strategy: 'passkey' }],
        } as any);
        await signIn.__internal_future.passkey();

        expect(mockFetch).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({
            method: 'POST',
            path: '/client/sign_ins/signin_123/prepare_first_factor',
            body: { strategy: 'passkey' },
          }),
        );

        expect(mockWebAuthnGetCredential).toHaveBeenCalled();
      });

      it('creates signIn with passkey for autofill flow', async () => {
        const mockIsWebAuthnSupported = vi.fn().mockReturnValue(true);
        const mockIsWebAuthnAutofillSupported = vi.fn().mockResolvedValue(true);
        const mockWebAuthnGetCredential = vi.fn().mockResolvedValue({
          publicKeyCredential: {
            id: 'credential_123',
            rawId: new ArrayBuffer(32),
            response: {
              authenticatorData: new ArrayBuffer(37),
              clientDataJSON: new ArrayBuffer(121),
              signature: new ArrayBuffer(64),
              userHandle: null,
            },
            type: 'public-key',
          },
          error: null,
        });

        SignIn.clerk = {
          __internal_isWebAuthnSupported: mockIsWebAuthnSupported,
          __internal_isWebAuthnAutofillSupported: mockIsWebAuthnAutofillSupported,
          __internal_getPublicCredentials: mockWebAuthnGetCredential,
          __internal_environment: {
            displayConfig: {
              captchaOauthBypass: [],
            },
          },
        } as any;

        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signin_123',
              first_factor_verification: {
                nonce: JSON.stringify({ challenge: 'Y2hhbGxlbmdl' }),
              },
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: { id: 'signin_123', status: 'complete' },
          });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn();
        await signIn.__internal_future.passkey({ flow: 'autofill' });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'POST',
            path: '/client/sign_ins',
            body: { strategy: 'passkey' },
          }),
        );

        expect(mockIsWebAuthnAutofillSupported).toHaveBeenCalled();
        expect(mockWebAuthnGetCredential).toHaveBeenCalled();
      });

      it('creates signIn with passkey for discoverable flow', async () => {
        const mockIsWebAuthnSupported = vi.fn().mockReturnValue(true);
        const mockWebAuthnGetCredential = vi.fn().mockResolvedValue({
          publicKeyCredential: {
            id: 'credential_123',
            rawId: new ArrayBuffer(32),
            response: {
              authenticatorData: new ArrayBuffer(37),
              clientDataJSON: new ArrayBuffer(121),
              signature: new ArrayBuffer(64),
              userHandle: null,
            },
            type: 'public-key',
          },
          error: null,
        });

        SignIn.clerk = {
          __internal_isWebAuthnSupported: mockIsWebAuthnSupported,
          __internal_getPublicCredentials: mockWebAuthnGetCredential,
          __internal_environment: {
            displayConfig: {
              captchaOauthBypass: [],
            },
          },
        } as any;

        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signin_123',
              first_factor_verification: {
                nonce: JSON.stringify({ challenge: 'Y2hhbGxlbmdl' }),
              },
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: { id: 'signin_123', status: 'complete' },
          });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn();
        await signIn.__internal_future.passkey({ flow: 'discoverable' });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'POST',
            path: '/client/sign_ins',
            body: { strategy: 'passkey' },
          }),
        );

        expect(mockWebAuthnGetCredential).toHaveBeenCalled();
      });

      it('throws error when WebAuthn is not supported', async () => {
        const mockIsWebAuthnSupported = vi.fn().mockReturnValue(false);

        SignIn.clerk = {
          __internal_isWebAuthnSupported: mockIsWebAuthnSupported,
        } as any;

        const signIn = new SignIn({ id: 'signin_123' } as any);

        await expect(signIn.__internal_future.passkey()).rejects.toThrow('Passkeys are not supported');
      });

      it('throws error when passkey factor not found in standard flow', async () => {
        const mockIsWebAuthnSupported = vi.fn().mockReturnValue(true);

        SignIn.clerk = {
          __internal_isWebAuthnSupported: mockIsWebAuthnSupported,
        } as any;

        const signIn = new SignIn({
          id: 'signin_123',
          supported_first_factors: [{ strategy: 'password' }],
        } as any);

        const result = await signIn.__internal_future.passkey();

        expect(result.error).toBeTruthy();
        expect(result.error?.code).toBe('factor_not_found');
      });

      it('throws error when public key credential is null', async () => {
        const mockIsWebAuthnSupported = vi.fn().mockReturnValue(true);
        const mockWebAuthnGetCredential = vi.fn().mockResolvedValue({
          publicKeyCredential: null,
          error: new Error('User cancelled'),
        });

        SignIn.clerk = {
          __internal_isWebAuthnSupported: mockIsWebAuthnSupported,
          __internal_getPublicCredentials: mockWebAuthnGetCredential,
          __internal_environment: {
            displayConfig: {
              captchaOauthBypass: [],
            },
          },
        } as any;

        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: {
            id: 'signin_123',
            first_factor_verification: {
              nonce: null,
            },
          },
        });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn();
        const result = await signIn.__internal_future.passkey({ flow: 'autofill' });

        expect(result.error).toBeTruthy();
        expect(result.error?.code).toBe('missing_public_key_options');
      });

      it('attempts first factor with serialized public key credential', async () => {
        const mockIsWebAuthnSupported = vi.fn().mockReturnValue(true);
        const mockWebAuthnGetCredential = vi.fn().mockResolvedValue({
          publicKeyCredential: {
            id: 'credential_123',
            rawId: new ArrayBuffer(32),
            response: {
              authenticatorData: new ArrayBuffer(37),
              clientDataJSON: new ArrayBuffer(121),
              signature: new ArrayBuffer(64),
              userHandle: null,
            },
            type: 'public-key',
          },
          error: null,
        });

        SignIn.clerk = {
          __internal_isWebAuthnSupported: mockIsWebAuthnSupported,
          __internal_getPublicCredentials: mockWebAuthnGetCredential,
        } as any;

        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signin_123',
              supported_first_factors: [{ strategy: 'passkey' }],
              first_factor_verification: {
                nonce: JSON.stringify({ challenge: 'Y2hhbGxlbmdl' }),
              },
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: { id: 'signin_123', status: 'complete' },
          });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn({
          id: 'signin_123',
          supported_first_factors: [{ strategy: 'passkey' }],
        } as any);
        await signIn.__internal_future.passkey();

        // Check that two calls were made
        expect(mockFetch).toHaveBeenCalledTimes(2);
        // Check that the second call includes passkey strategy
        expect(mockFetch).toHaveBeenNthCalledWith(
          2,
          expect.objectContaining({
            body: expect.objectContaining({
              strategy: 'passkey',
            }),
          }),
        );
      });
    });

    describe('web3', () => {
      afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
      });

      it('authenticates with metamask strategy', async () => {
        SignIn.clerk = {
          __internal_environment: {
            displayConfig: {
              captchaOauthBypass: [],
            },
          },
        } as any;

        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signin_123',
              identifier: '0x1234567890123456789012345678901234567890',
              supported_first_factors: [{ strategy: 'web3_metamask_signature', web3WalletId: 'wallet_123' }],
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signin_123',
              first_factor_verification: { message: 'nonce_123' },
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: { id: 'signin_123', status: 'complete' },
          });
        BaseResource._fetch = mockFetch;

        const utilsModule = await import('../../../utils');
        vi.spyOn(utilsModule, 'web3').mockReturnValue({
          getMetamaskIdentifier: vi.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
          generateSignatureWithMetamask: vi.fn().mockResolvedValue('signature_123'),
        } as any);

        const signIn = new SignIn();
        await signIn.__internal_future.web3({ strategy: 'web3_metamask_signature' });

        expect(mockFetch).toHaveBeenNthCalledWith(1, {
          method: 'POST',
          path: '/client/sign_ins',
          body: { identifier: '0x1234567890123456789012345678901234567890' },
        });

        expect(mockFetch).toHaveBeenNthCalledWith(2, {
          method: 'POST',
          path: '/client/sign_ins/signin_123/prepare_first_factor',
          body: {
            web3WalletId: 'wallet_123',
            strategy: 'web3_metamask_signature',
          },
        });

        expect(mockFetch).toHaveBeenNthCalledWith(3, {
          method: 'POST',
          path: '/client/sign_ins/signin_123/attempt_first_factor',
          body: {
            signature: 'signature_123',
            strategy: 'web3_metamask_signature',
          },
        });
      });

      it('authenticates with coinbase_wallet strategy', async () => {
        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signin_123',
              identifier: '0x1234567890123456789012345678901234567890',
              supported_first_factors: [{ strategy: 'web3_coinbase_wallet_signature', web3WalletId: 'wallet_123' }],
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signin_123',
              first_factor_verification: { message: 'nonce_123' },
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: { id: 'signin_123', status: 'complete' },
          });
        BaseResource._fetch = mockFetch;

        const utilsModule = await import('../../../utils');
        vi.spyOn(utilsModule, 'web3').mockReturnValue({
          getCoinbaseWalletIdentifier: vi.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
          generateSignatureWithCoinbaseWallet: vi.fn().mockResolvedValue('signature_123'),
        } as any);

        const signIn = new SignIn();
        await signIn.__internal_future.web3({ strategy: 'web3_coinbase_wallet_signature' });

        expect(mockFetch).toHaveBeenNthCalledWith(3, {
          method: 'POST',
          path: '/client/sign_ins/signin_123/attempt_first_factor',
          body: {
            signature: 'signature_123',
            strategy: 'web3_coinbase_wallet_signature',
          },
        });
      });

      it('retries coinbase_wallet signature on error code 4001', async () => {
        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signin_123',
              identifier: '0x1234567890123456789012345678901234567890',
              supported_first_factors: [{ strategy: 'web3_coinbase_wallet_signature', web3WalletId: 'wallet_123' }],
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signin_123',
              first_factor_verification: { message: 'nonce_123' },
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: { id: 'signin_123', status: 'complete' },
          });
        BaseResource._fetch = mockFetch;

        const utilsModule = await import('../../../utils');
        const mockGenerateSignature = vi
          .fn()
          .mockRejectedValueOnce({ code: 4001, message: 'User rejected' })
          .mockResolvedValueOnce('signature_123');

        vi.spyOn(utilsModule, 'web3').mockReturnValue({
          getCoinbaseWalletIdentifier: vi.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
          generateSignatureWithCoinbaseWallet: mockGenerateSignature,
        } as any);

        const signIn = new SignIn();
        await signIn.__internal_future.web3({ strategy: 'web3_coinbase_wallet_signature' });

        expect(mockGenerateSignature).toHaveBeenCalledTimes(2);
        expect(mockFetch).toHaveBeenNthCalledWith(3, {
          method: 'POST',
          path: '/client/sign_ins/signin_123/attempt_first_factor',
          body: {
            signature: 'signature_123',
            strategy: 'web3_coinbase_wallet_signature',
          },
        });
      });

      it('does not retry coinbase_wallet signature on non-4001 error', async () => {
        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signin_123',
              identifier: '0x1234567890123456789012345678901234567890',
              supported_first_factors: [{ strategy: 'web3_coinbase_wallet_signature', web3WalletId: 'wallet_123' }],
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signin_123',
              first_factor_verification: { message: 'nonce_123' },
            },
          });
        BaseResource._fetch = mockFetch;

        const utilsModule = await import('../../../utils');
        const mockError = { code: 5000, message: 'Other error' };
        vi.spyOn(utilsModule, 'web3').mockReturnValue({
          getCoinbaseWalletIdentifier: vi.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
          generateSignatureWithCoinbaseWallet: vi.fn().mockRejectedValue(mockError),
        } as any);

        const signIn = new SignIn();
        const result = await signIn.__internal_future.web3({ strategy: 'web3_coinbase_wallet_signature' });

        expect(result.error).toEqual(mockError);
      });

      it('authenticates with base strategy', async () => {
        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signin_123',
              identifier: '0x1234567890123456789012345678901234567890',
              supported_first_factors: [{ strategy: 'web3_base_signature', web3WalletId: 'wallet_123' }],
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signin_123',
              first_factor_verification: { message: 'nonce_123' },
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: { id: 'signin_123', status: 'complete' },
          });
        BaseResource._fetch = mockFetch;

        const utilsModule = await import('../../../utils');
        vi.spyOn(utilsModule, 'web3').mockReturnValue({
          getBaseIdentifier: vi.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
          generateSignatureWithBase: vi.fn().mockResolvedValue('signature_123'),
        } as any);

        const signIn = new SignIn();
        await signIn.__internal_future.web3({ strategy: 'web3_base_signature' });

        expect(mockFetch).toHaveBeenNthCalledWith(3, {
          method: 'POST',
          path: '/client/sign_ins/signin_123/attempt_first_factor',
          body: {
            signature: 'signature_123',
            strategy: 'web3_base_signature',
          },
        });
      });

      it('authenticates with okx_wallet strategy', async () => {
        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signin_123',
              identifier: '0x1234567890123456789012345678901234567890',
              supported_first_factors: [{ strategy: 'web3_okx_wallet_signature', web3WalletId: 'wallet_123' }],
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signin_123',
              first_factor_verification: { message: 'nonce_123' },
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: { id: 'signin_123', status: 'complete' },
          });
        BaseResource._fetch = mockFetch;

        const utilsModule = await import('../../../utils');
        vi.spyOn(utilsModule, 'web3').mockReturnValue({
          getOKXWalletIdentifier: vi.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
          generateSignatureWithOKXWallet: vi.fn().mockResolvedValue('signature_123'),
        } as any);

        const signIn = new SignIn();
        await signIn.__internal_future.web3({ strategy: 'web3_okx_wallet_signature' });

        expect(mockFetch).toHaveBeenNthCalledWith(3, {
          method: 'POST',
          path: '/client/sign_ins/signin_123/attempt_first_factor',
          body: {
            signature: 'signature_123',
            strategy: 'web3_okx_wallet_signature',
          },
        });
      });

      it('returns error when web3 first factor not found', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: {
            id: 'signin_123',
            identifier: '0x1234567890123456789012345678901234567890',
            supported_first_factors: [{ strategy: 'password' }],
          },
        });
        BaseResource._fetch = mockFetch;

        const utilsModule = await import('../../../utils');
        vi.spyOn(utilsModule, 'web3').mockReturnValue({
          getMetamaskIdentifier: vi.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
        } as any);

        const signIn = new SignIn();
        const result = await signIn.__internal_future.web3({ strategy: 'web3_metamask_signature' });

        expect(result.error).toBeTruthy();
        expect(result.error?.code).toBe('factor_not_found');
      });

      it('returns error when nonce not found', async () => {
        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signin_123',
              identifier: '0x1234567890123456789012345678901234567890',
              supported_first_factors: [{ strategy: 'web3_metamask_signature', web3WalletId: 'wallet_123' }],
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signin_123',
              first_factor_verification: {},
            },
          });
        BaseResource._fetch = mockFetch;

        const utilsModule = await import('../../../utils');
        vi.spyOn(utilsModule, 'web3').mockReturnValue({
          getMetamaskIdentifier: vi.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
        } as any);

        const signIn = new SignIn();
        const result = await signIn.__internal_future.web3({ strategy: 'web3_metamask_signature' });

        expect(result.error).toBeTruthy();
        expect(result.error?.code).toBe('web3_nonce_not_found');
      });
    });

    describe('sso', () => {
      afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
      });

      it('creates signIn with enterprise_sso strategy and prepares first factor', async () => {
        vi.stubGlobal('window', { location: { origin: 'https://example.com' } });

        const mockBuildUrlWithAuth = vi.fn().mockReturnValue('https://example.com/sso-callback');
        SignIn.clerk = {
          buildUrlWithAuth: mockBuildUrlWithAuth,
          __internal_environment: {
            displayConfig: {
              captchaOauthBypass: [],
            },
          },
        } as any;

        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({
            client: null,
            response: { id: 'signin_123' },
          })
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signin_123',
              first_factor_verification: {
                status: 'unverified',
                external_verification_redirect_url: 'https://sso.example.com/auth',
              },
            },
          });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn();
        await signIn.__internal_future.sso({
          strategy: 'enterprise_sso',
          redirectUrl: 'https://complete.example.com',
          redirectCallbackUrl: '/sso-callback',
          oidcPrompt: 'login',
          enterpriseConnectionId: 'conn_123',
        });

        expect(mockFetch).toHaveBeenNthCalledWith(2, {
          method: 'POST',
          path: '/client/sign_ins/signin_123/prepare_first_factor',
          body: {
            strategy: 'enterprise_sso',
            redirectUrl: 'https://example.com/sso-callback',
            actionCompleteRedirectUrl: 'https://complete.example.com',
            oidcPrompt: 'login',
            enterpriseConnectionId: 'conn_123',
          },
        });
      });

      it('handles relative redirectUrl by converting to absolute', async () => {
        vi.stubGlobal('window', { location: { origin: 'https://example.com' } });

        const mockBuildUrlWithAuth = vi.fn().mockReturnValue('https://example.com/sso-callback');
        SignIn.clerk = {
          buildUrlWithAuth: mockBuildUrlWithAuth,
          __internal_environment: {
            displayConfig: {
              captchaOauthBypass: [],
            },
          },
        } as any;

        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: {
            id: 'signin_123',
            first_factor_verification: {
              status: 'unverified',
              external_verification_redirect_url: 'https://sso.example.com/auth',
            },
          },
        });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn();
        await signIn.__internal_future.sso({
          strategy: 'oauth_google',
          redirectUrl: '/complete',
          redirectCallbackUrl: '/sso-callback',
        });

        expect(mockFetch).toHaveBeenCalledWith({
          method: 'POST',
          path: '/client/sign_ins',
          body: {
            strategy: 'oauth_google',
            redirectUrl: 'https://example.com/sso-callback',
            actionCompleteRedirectUrl: 'https://example.com/complete',
          },
        });
      });

      it('uses popup when provided', async () => {
        vi.stubGlobal('window', { location: { origin: 'https://example.com' } });

        const mockPopup = { location: { href: '' } } as Window;
        const mockBuildUrlWithAuth = vi.fn().mockImplementation(url => {
          // Convert relative URLs to absolute
          if (url.startsWith('/')) {
            return 'https://example.com' + url;
          }
          return url;
        });

        SignIn.clerk = {
          buildUrlWithAuth: mockBuildUrlWithAuth,
          buildUrl: vi.fn().mockImplementation(path => 'https://example.com' + path),
          frontendApi: 'clerk.example.com',
          __internal_environment: {
            displayConfig: {
              captchaOauthBypass: [],
            },
          },
        } as any;

        const mockFetch = vi.fn();
        // First call: create signIn - returns with first_factor_verification
        mockFetch.mockResolvedValueOnce({
          client: null,
          response: {
            id: 'signin_123',
            first_factor_verification: {
              status: 'unverified',
              external_verification_redirect_url: 'https://sso.example.com/auth',
            },
          },
        });
        // Second call: reload after popup
        mockFetch.mockResolvedValueOnce({
          client: null,
          response: {
            id: 'signin_123',
            status: 'complete',
          },
        });
        BaseResource._fetch = mockFetch;

        vi.mocked(_futureAuthenticateWithPopup).mockImplementation(async (_clerk, params) => {
          // Simulate the actual behavior of setting popup href
          params.popup.location.href = params.externalVerificationRedirectURL.toString();
        });

        const signIn = new SignIn();
        const result = await signIn.__internal_future.sso({
          strategy: 'oauth_google',
          redirectUrl: 'https://complete.example.com',
          redirectCallbackUrl: '/sso-callback',
          popup: mockPopup,
        });

        expect(result.error).toBeNull();
        expect(_futureAuthenticateWithPopup).toHaveBeenCalledWith(
          SignIn.clerk,
          expect.objectContaining({
            popup: mockPopup,
            externalVerificationRedirectURL: expect.any(URL),
          }),
        );
        expect(mockPopup.location.href).toBe('https://sso.example.com/auth');

        // Verify that wrapWithPopupRoutes was used by checking the fetch body contains popup-callback URLs
        expect(mockFetch).toHaveBeenCalledWith(
          expect.objectContaining({
            body: expect.objectContaining({
              redirectUrl: expect.stringContaining('/popup-callback'),
              actionCompleteRedirectUrl: expect.stringContaining('/popup-callback'),
            }),
          }),
        );
      });
    });

    describe('ticket', () => {
      afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
      });

      it('uses ticket from query param when not provided', async () => {
        const mockSearchParams = new URLSearchParams('?__clerk_ticket=ticket_from_query');
        vi.stubGlobal('window', {
          location: {
            search: '?__clerk_ticket=ticket_from_query',
            href: 'https://example.com?__clerk_ticket=ticket_from_query',
          },
        });
        vi.stubGlobal('URLSearchParams', vi.fn().mockReturnValue(mockSearchParams));

        SignIn.clerk = {
          __internal_environment: {
            displayConfig: {
              captchaOauthBypass: [],
            },
          },
        } as any;

        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: { id: 'signin_123' },
        });
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn();
        await signIn.__internal_future.ticket();

        expect(mockFetch).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'POST',
            path: '/client/sign_ins',
            body: { ticket: 'ticket_from_query' },
          }),
        );
      });
    });

    describe('finalize', () => {
      afterEach(() => {
        vi.clearAllMocks();
      });

      it('reloads client and sets active session', async () => {
        const mockReload = vi.fn().mockResolvedValue({});
        const mockSetActive = vi.fn().mockResolvedValue({});

        SignIn.clerk = {
          client: { reload: mockReload, sessions: [] },
          setActive: mockSetActive,
        } as any;

        const signIn = new SignIn({ id: 'signin_123', created_session_id: 'session_123' } as any);
        await signIn.__internal_future.finalize();

        expect(mockReload).toHaveBeenCalled();
        expect(mockSetActive).toHaveBeenCalledWith({ session: 'session_123', navigate: undefined });
      });

      it('passes navigate parameter to setActive', async () => {
        const mockReload = vi.fn().mockResolvedValue({});
        const mockSetActive = vi.fn().mockResolvedValue({});
        const mockNavigate = vi.fn();

        SignIn.clerk = {
          client: { reload: mockReload, sessions: [] },
          setActive: mockSetActive,
        } as any;

        const signIn = new SignIn({ id: 'signin_123', created_session_id: 'session_123' } as any);
        await signIn.__internal_future.finalize({ navigate: mockNavigate });

        expect(mockSetActive).toHaveBeenCalledWith({ session: 'session_123', navigate: mockNavigate });
      });

      it('throws error when no created session ID', async () => {
        const signIn = new SignIn({ id: 'signin_123' } as any);

        await expect(signIn.__internal_future.finalize()).rejects.toThrow();
      });
    });

    describe('reset', () => {
      let mockClient: { signIn: SignIn; resetSignIn: ReturnType<typeof vi.fn> };

      beforeEach(() => {
        // Set up mock client with resetSignIn method that simulates what the real
        // Client.resetSignIn does: creates a new SignIn, updates signals via events,
        // and the State class responds by updating the actual signal values
        mockClient = {
          signIn: new SignIn(null),
          resetSignIn: vi.fn().mockImplementation(function (this: typeof mockClient) {
            const newSignIn = new SignIn(null);
            this.signIn = newSignIn;
            // Emit events like the real implementation
            eventBus.emit('resource:error', { resource: newSignIn, error: null });
            // Also update signals directly since State isn't set up in tests
            signInResourceSignal({ resource: newSignIn });
            signInErrorSignal({ error: null });
          }),
        };
        SignIn.clerk = {
          client: mockClient,
        } as any;
      });

      afterEach(() => {
        vi.clearAllMocks();
        vi.restoreAllMocks();
        // Reset signals to initial state
        signInResourceSignal({ resource: null });
        signInErrorSignal({ error: null });
      });

      it('does NOT emit resource:fetch with status fetching', async () => {
        const emitSpy = vi.spyOn(eventBus, 'emit');
        const mockFetch = vi.fn();
        BaseResource._fetch = mockFetch;

        const signIn = new SignIn({ id: 'signin_123', status: 'needs_first_factor' } as any);
        await signIn.__internal_future.reset();

        // Verify that resource:fetch was NOT called with status: 'fetching'
        const fetchingCalls = emitSpy.mock.calls.filter(
          call => call[0] === 'resource:fetch' && call[1]?.status === 'fetching',
        );
        expect(fetchingCalls).toHaveLength(0);
        // Verify no API calls were made
        expect(mockFetch).not.toHaveBeenCalled();
      });

      it('clears any previous errors by updating signInErrorSignal', async () => {
        // Set an initial error
        signInErrorSignal({ error: new Error('Previous error') });
        expect(signInErrorSignal().error).toBeTruthy();

        const signIn = new SignIn({ id: 'signin_123', status: 'needs_first_factor' } as any);
        await signIn.__internal_future.reset();

        // Verify that error signal was cleared
        expect(signInErrorSignal().error).toBeNull();
      });

      it('returns error: null on success', async () => {
        const signIn = new SignIn({ id: 'signin_123', status: 'needs_first_factor' } as any);
        const result = await signIn.__internal_future.reset();

        expect(result).toHaveProperty('error', null);
      });

      it('resets an existing signin with data to a fresh null state', async () => {
        const signIn = new SignIn({
          id: 'signin_123',
          status: 'needs_first_factor',
          identifier: 'user@example.com',
        } as any);

        // Verify initial state
        expect(signIn.id).toBe('signin_123');
        expect(signIn.status).toBe('needs_first_factor');
        expect(signIn.identifier).toBe('user@example.com');

        await signIn.__internal_future.reset();

        // Verify that signInResourceSignal was updated with a new SignIn(null) instance
        const updatedSignIn = signInResourceSignal().resource;
        expect(updatedSignIn).toBeInstanceOf(SignIn);
        expect(updatedSignIn?.id).toBeUndefined();
        expect(updatedSignIn?.status).toBeNull();
        expect(updatedSignIn?.identifier).toBeNull();
      });

      it('updates clerk.client.signIn with the fresh null instance', async () => {
        const originalSignIn = new SignIn({
          id: 'signin_123',
          status: 'needs_first_factor',
          identifier: 'user@example.com',
        } as any);
        mockClient.signIn = originalSignIn;

        // Verify initial state
        expect(mockClient.signIn.id).toBe('signin_123');
        expect(mockClient.signIn.status).toBe('needs_first_factor');

        await originalSignIn.__internal_future.reset();

        // Verify that clerk.client.signIn was updated with a new SignIn(null) instance
        expect(mockClient.signIn).toBeInstanceOf(SignIn);
        expect(mockClient.signIn.id).toBeUndefined();
        expect(mockClient.signIn.status).toBeNull();
        expect(mockClient.signIn.identifier).toBeNull();
      });
    });
  });
});
