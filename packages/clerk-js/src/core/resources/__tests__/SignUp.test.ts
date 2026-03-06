import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { eventBus } from '../../events';
import { signUpErrorSignal, signUpResourceSignal } from '../../signals';
import { BaseResource } from '../internal';
import { SignUp } from '../SignUp';

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
import { CaptchaChallenge } from '../../../utils/captcha/CaptchaChallenge';

// Mock the CaptchaChallenge module
vi.mock('../../../utils/captcha/CaptchaChallenge', () => ({
  CaptchaChallenge: vi.fn().mockImplementation(() => ({
    managedOrInvisible: vi.fn().mockResolvedValue({
      captchaToken: 'mock_token',
      captchaWidgetType: 'invisible',
    }),
  })),
}));

// Mock the protectCheck module
const mockExecuteProtectCheck = vi.fn();
vi.mock('../../../utils/protectCheck', () => ({
  executeProtectCheck: (...args: any[]) => mockExecuteProtectCheck(...args),
}));

describe('SignUp', () => {
  it('can be serialized with JSON.stringify', () => {
    const signUp = new SignUp();
    const snapshot = JSON.stringify(signUp);
    expect(snapshot).toBeDefined();
  });

  describe('SignUpFuture', () => {
    it('can be serialized with JSON.stringify', () => {
      const signUp = new SignUp();
      const snapshot = JSON.stringify(signUp.__internal_future);
      expect(snapshot).toBeDefined();
    });

    describe('create', () => {
      beforeEach(() => {
        SignUp.clerk = {} as any;
      });

      afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
        SignUp.clerk = {} as any;
      });

      it('includes locale in request when navigator.language is available', async () => {
        vi.stubGlobal('navigator', { language: 'fr-FR' });

        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: { id: 'signup_123', status: 'missing_requirements' },
        });
        BaseResource._fetch = mockFetch;

        const signUp = new SignUp();
        await signUp.__internal_future.create({ emailAddress: 'user@example.com' });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'POST',
            path: '/client/sign_ups',
            body: expect.objectContaining({
              emailAddress: 'user@example.com',
              locale: 'fr-FR',
            }),
          }),
        );
      });

      it('excludes locale from request when navigator.language is empty', async () => {
        vi.stubGlobal('navigator', { language: '' });

        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: { id: 'signup_123', status: 'missing_requirements' },
        });
        BaseResource._fetch = mockFetch;

        const signUp = new SignUp();
        await signUp.__internal_future.create({ emailAddress: 'user@example.com' });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'POST',
            path: '/client/sign_ups',
            body: expect.not.objectContaining({
              locale: expect.anything(),
            }),
          }),
        );
      });

      it('returns error property on success', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: { id: 'signup_123', status: 'missing_requirements' },
        });
        BaseResource._fetch = mockFetch;

        const signUp = new SignUp();
        const result = await signUp.__internal_future.create({ emailAddress: 'user@example.com' });

        expect(result).toHaveProperty('error', null);
      });

      it('runs captcha challenge when bypass is not enabled', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: { id: 'signup_123', status: 'missing_requirements' },
        });
        BaseResource._fetch = mockFetch;

        const signUp = new SignUp();
        await signUp.__internal_future.create({ emailAddress: 'user@example.com' });

        expect(CaptchaChallenge).toHaveBeenCalledWith(SignUp.clerk);
        const challengeInstance = vi.mocked(CaptchaChallenge).mock.results[0]?.value as {
          managedOrInvisible: ReturnType<typeof vi.fn>;
        };
        expect(challengeInstance.managedOrInvisible).toHaveBeenCalledWith({ action: 'signup' });
        expect(mockFetch.mock.calls[0]?.[0].body).toHaveProperty('captchaToken', 'mock_token');
        expect(mockFetch.mock.calls[0]?.[0].body).toHaveProperty('captchaWidgetType', 'invisible');
      });

      it('skips captcha challenge when client captcha bypass is enabled', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: { id: 'signup_123', status: 'missing_requirements' },
        });
        BaseResource._fetch = mockFetch;
        SignUp.clerk = {
          client: {
            captchaBypass: true,
          },
        } as any;

        const signUp = new SignUp();
        await signUp.__internal_future.create({ emailAddress: 'user@example.com' });

        expect(CaptchaChallenge).not.toHaveBeenCalled();
        expect(mockFetch.mock.calls[0]?.[0].body).toHaveProperty('captchaToken', undefined);
        expect(mockFetch.mock.calls[0]?.[0].body).toHaveProperty('captchaWidgetType', undefined);
        expect(mockFetch.mock.calls[0]?.[0].body).toHaveProperty('captchaError', undefined);
      });
    });

    describe('sendPhoneCode', () => {
      afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
      });

      it('uses existing signup when already created', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: { id: 'signup_123' },
        });
        BaseResource._fetch = mockFetch;

        const signUp = new SignUp({ id: 'signup_123' } as any);
        await signUp.__internal_future.verifications.sendPhoneCode({ phoneNumber: '+15551234567' });

        // Should only call prepare verification, not create signup
        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(mockFetch).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'POST',
            path: '/client/sign_ups/signup_123/prepare_verification',
            body: expect.objectContaining({
              strategy: 'phone_code',
            }),
          }),
        );
      });
    });

    describe('sendEmailLink', () => {
      afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
      });

      it('prepares email link verification with absolute redirectUrl', async () => {
        vi.stubGlobal('window', { location: { origin: 'https://example.com' } });

        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: { id: 'signup_123' },
        });
        BaseResource._fetch = mockFetch;

        const signUp = new SignUp({ id: 'signup_123' } as any);
        await signUp.__internal_future.verifications.sendEmailLink({ verificationUrl: '/verify' });

        expect(mockFetch).toHaveBeenCalledWith({
          method: 'POST',
          path: '/client/sign_ups/signup_123/prepare_verification',
          body: {
            strategy: 'email_link',
            redirectUrl: 'https://example.com/verify',
          },
        });
      });

      it('keeps absolute verificationUrl unchanged', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: { id: 'signup_123' },
        });
        BaseResource._fetch = mockFetch;

        const signUp = new SignUp({ id: 'signup_123' } as any);
        await signUp.__internal_future.verifications.sendEmailLink({
          verificationUrl: 'https://other.com/verify',
        });

        expect(mockFetch).toHaveBeenCalledWith({
          method: 'POST',
          path: '/client/sign_ups/signup_123/prepare_verification',
          body: {
            strategy: 'email_link',
            redirectUrl: 'https://other.com/verify',
          },
        });
      });
    });

    describe('waitForEmailLinkVerification', () => {
      afterEach(() => {
        vi.clearAllMocks();
      });

      it('polls until email verification status is verified', async () => {
        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signup_123',
              verifications: { email_address: { status: 'unverified' } },
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signup_123',
              verifications: { email_address: { status: 'verified' } },
            },
          });
        BaseResource._fetch = mockFetch;

        const signUp = new SignUp({ id: 'signup_123' } as any);
        await signUp.__internal_future.verifications.waitForEmailLinkVerification();

        expect(mockFetch).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'GET',
            path: '/client/sign_ups/signup_123',
          }),
          expect.anything(),
        );
      });

      it('polls until email verification status is expired', async () => {
        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signup_123',
              verifications: { email_address: { status: 'unverified' } },
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signup_123',
              verifications: { email_address: { status: 'expired' } },
            },
          });
        BaseResource._fetch = mockFetch;

        const signUp = new SignUp({ id: 'signup_123' } as any);
        await signUp.__internal_future.verifications.waitForEmailLinkVerification();

        expect(mockFetch).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'GET',
            path: '/client/sign_ups/signup_123',
          }),
          expect.anything(),
        );
      });
    });

    describe('emailLinkVerification', () => {
      afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
        SignUp.clerk = {} as any;
      });

      it('returns verification data when query params are present', () => {
        vi.stubGlobal('window', {
          location: {
            href: 'https://example.com?__clerk_status=verified&__clerk_created_session=sess_123',
          },
        });

        SignUp.clerk = {
          client: {
            sessions: [{ id: 'sess_123' }],
          },
        } as any;

        const signUp = new SignUp();
        const verification = signUp.__internal_future.verifications.emailLinkVerification;

        expect(verification).toEqual({
          status: 'verified',
          createdSessionId: 'sess_123',
          verifiedFromTheSameClient: true,
        });
      });
    });

    describe('sso', () => {
      afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
        SignUp.clerk = {} as any;
      });

      it('handles relative redirectUrl by converting to absolute', async () => {
        vi.stubGlobal('window', { location: { origin: 'https://example.com' } });

        const mockBuildUrlWithAuth = vi.fn().mockReturnValue('https://example.com/sso-callback');
        SignUp.clerk = {
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
            id: 'signup_123',
            verifications: {
              externalAccount: {
                status: 'unverified',
                externalVerificationRedirectURL: 'https://sso.example.com/auth',
              },
            },
          },
        });
        BaseResource._fetch = mockFetch;

        const signUp = new SignUp();
        await signUp.__internal_future.sso({
          strategy: 'oauth_google',
          redirectUrl: '/complete',
          redirectCallbackUrl: '/sso-callback',
        });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'POST',
            path: '/client/sign_ups',
            body: expect.objectContaining({
              strategy: 'oauth_google',
              redirectUrl: 'https://example.com/sso-callback',
              actionCompleteRedirectUrl: 'https://example.com/complete',
            }),
          }),
        );
      });

      it('handles absolute redirectUrl without modification', async () => {
        vi.stubGlobal('window', { location: { origin: 'https://example.com' } });

        const mockBuildUrlWithAuth = vi.fn().mockReturnValue('https://example.com/sso-callback');
        SignUp.clerk = {
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
            id: 'signup_123',
            verifications: {
              externalAccount: {
                status: 'unverified',
                externalVerificationRedirectURL: 'https://sso.example.com/auth',
              },
            },
          },
        });
        BaseResource._fetch = mockFetch;

        const signUp = new SignUp();
        await signUp.__internal_future.sso({
          strategy: 'oauth_google',
          redirectUrl: 'https://other.com/complete',
          redirectCallbackUrl: '/sso-callback',
        });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'POST',
            path: '/client/sign_ups',
            body: expect.objectContaining({
              strategy: 'oauth_google',
              redirectUrl: 'https://example.com/sso-callback',
              actionCompleteRedirectUrl: 'https://other.com/complete',
            }),
          }),
        );
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

        SignUp.clerk = {
          buildUrlWithAuth: mockBuildUrlWithAuth,
          buildUrl: vi.fn().mockImplementation(path => 'https://example.com' + path),
          frontendApi: 'clerk.example.com',
          __internal_environment: {
            displayConfig: {
              captchaOauthBypass: [],
            },
            reload: vi.fn().mockResolvedValue({}),
          },
        } as any;

        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: {
            id: 'signup_123',
            verifications: {
              external_account: {
                status: 'unverified',
                external_verification_redirect_url: 'https://sso.example.com/auth',
              },
            },
          },
        });
        BaseResource._fetch = mockFetch;

        vi.mocked(_futureAuthenticateWithPopup).mockImplementation(async (_clerk, params) => {
          // Simulate the actual behavior of setting popup href
          params.popup.location.href = params.externalVerificationRedirectURL.toString();
        });

        const signUp = new SignUp();
        const result = await signUp.__internal_future.sso({
          strategy: 'oauth_google',
          redirectUrl: 'https://complete.example.com',
          redirectCallbackUrl: '/sso-callback',
          popup: mockPopup,
        });

        expect(result.error).toBeNull();
        expect(_futureAuthenticateWithPopup).toHaveBeenCalledWith(
          SignUp.clerk,
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

      it('skips captcha challenge for strategies configured in captcha oauth bypass', async () => {
        vi.stubGlobal('window', { location: { origin: 'https://example.com' } });

        const mockBuildUrlWithAuth = vi.fn().mockReturnValue('https://example.com/sso-callback');
        SignUp.clerk = {
          buildUrlWithAuth: mockBuildUrlWithAuth,
          __internal_environment: {
            displayConfig: {
              captchaOauthBypass: ['oauth_google'],
            },
          },
        } as any;

        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: {
            id: 'signup_123',
            verifications: {
              externalAccount: {
                status: 'complete',
              },
            },
          },
        });
        BaseResource._fetch = mockFetch;

        const signUp = new SignUp();
        await signUp.__internal_future.sso({
          strategy: 'oauth_google',
          redirectUrl: '/complete',
          redirectCallbackUrl: '/sso-callback',
        });

        expect(CaptchaChallenge).not.toHaveBeenCalled();
        expect(mockFetch.mock.calls[0]?.[0].body).toHaveProperty('captchaToken', undefined);
        expect(mockFetch.mock.calls[0]?.[0].body).toHaveProperty('captchaWidgetType', undefined);
        expect(mockFetch.mock.calls[0]?.[0].body).toHaveProperty('captchaError', undefined);
      });
    });

    describe('web3', () => {
      beforeEach(() => {
        SignUp.clerk = {} as any;
      });

      afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
      });

      it('authenticates with metamask strategy', async () => {
        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signup_123',
              verifications: {
                web3_wallet: { status: 'unverified' },
              },
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signup_123',
              verifications: {
                web3_wallet: { status: 'unverified', message: 'nonce_123' },
              },
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: { id: 'signup_123', status: 'complete' },
          });
        BaseResource._fetch = mockFetch;

        const utilsModule = await import('../../../utils');
        const mockGenerateSignature = vi.fn().mockResolvedValue('signature_123');
        vi.spyOn(utilsModule, 'web3').mockReturnValue({
          getMetamaskIdentifier: vi.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
          generateSignatureWithMetamask: mockGenerateSignature,
        } as any);

        const signUp = new SignUp();
        await signUp.__internal_future.web3({ strategy: 'web3_metamask_signature' });

        // Verify signature generation was called
        expect(mockGenerateSignature).toHaveBeenCalled();
      });

      it('authenticates with coinbase_wallet strategy', async () => {
        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signup_123',
              verifications: {
                web3_wallet: { status: 'unverified' },
              },
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signup_123',
              verifications: {
                web3_wallet: { status: 'unverified', message: 'nonce_123' },
              },
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: { id: 'signup_123', status: 'complete' },
          });
        BaseResource._fetch = mockFetch;

        const utilsModule = await import('../../../utils');
        const mockGenerateSignature = vi.fn().mockResolvedValue('signature_123');
        vi.spyOn(utilsModule, 'web3').mockReturnValue({
          getCoinbaseWalletIdentifier: vi.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
          generateSignatureWithCoinbaseWallet: mockGenerateSignature,
        } as any);

        const signUp = new SignUp();
        await signUp.__internal_future.web3({ strategy: 'web3_coinbase_wallet_signature' });

        // Verify signature generation was called
        expect(mockGenerateSignature).toHaveBeenCalled();
      });

      it('authenticates with base strategy', async () => {
        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signup_123',
              verifications: {
                web3_wallet: { status: 'unverified' },
              },
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signup_123',
              verifications: {
                web3_wallet: { status: 'unverified', message: 'nonce_123' },
              },
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: { id: 'signup_123', status: 'complete' },
          });
        BaseResource._fetch = mockFetch;

        const utilsModule = await import('../../../utils');
        const mockGenerateSignature = vi.fn().mockResolvedValue('signature_123');
        vi.spyOn(utilsModule, 'web3').mockReturnValue({
          getBaseIdentifier: vi.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
          generateSignatureWithBase: mockGenerateSignature,
        } as any);

        const signUp = new SignUp();
        await signUp.__internal_future.web3({ strategy: 'web3_base_signature' });

        // Verify signature generation was called
        expect(mockGenerateSignature).toHaveBeenCalled();
      });

      it('authenticates with okx_wallet strategy', async () => {
        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signup_123',
              verifications: {
                web3_wallet: { status: 'unverified' },
              },
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signup_123',
              verifications: {
                web3_wallet: { status: 'unverified', message: 'nonce_123' },
              },
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: { id: 'signup_123', status: 'complete' },
          });
        BaseResource._fetch = mockFetch;

        const utilsModule = await import('../../../utils');
        const mockGenerateSignature = vi.fn().mockResolvedValue('signature_123');
        vi.spyOn(utilsModule, 'web3').mockReturnValue({
          getOKXWalletIdentifier: vi.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
          generateSignatureWithOKXWallet: mockGenerateSignature,
        } as any);

        const signUp = new SignUp();
        await signUp.__internal_future.web3({ strategy: 'web3_okx_wallet_signature' });

        // Verify signature generation was called
        expect(mockGenerateSignature).toHaveBeenCalled();
      });

      it('retries coinbase_wallet signature on error code 4001', async () => {
        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signup_123',
              verifications: {
                web3_wallet: { status: 'unverified' },
              },
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signup_123',
              verifications: {
                web3_wallet: { status: 'unverified', message: 'nonce_123' },
              },
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: { id: 'signup_123', status: 'complete' },
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

        const signUp = new SignUp();
        await signUp.__internal_future.web3({ strategy: 'web3_coinbase_wallet_signature' });

        // Verify signature generation was called twice (initial + retry)
        expect(mockGenerateSignature).toHaveBeenCalledTimes(2);
      });

      it('does not retry coinbase_wallet signature on non-4001 error', async () => {
        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signup_123',
              verifications: {
                web3_wallet: { status: 'unverified' },
              },
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signup_123',
              verifications: {
                web3_wallet: { status: 'unverified', message: 'nonce_123' },
              },
            },
          });
        BaseResource._fetch = mockFetch;

        const utilsModule = await import('../../../utils');
        const mockError = { code: 5000, message: 'Other error' };
        vi.spyOn(utilsModule, 'web3').mockReturnValue({
          getCoinbaseWalletIdentifier: vi.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
          generateSignatureWithCoinbaseWallet: vi.fn().mockRejectedValue(mockError),
        } as any);

        const signUp = new SignUp();
        const result = await signUp.__internal_future.web3({ strategy: 'web3_coinbase_wallet_signature' });

        // Verify error is returned without retry
        expect(result.error).toBeTruthy();
      });
    });

    describe('password', () => {
      afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
      });

      it('creates signup with password when no existing signup', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: { id: 'signup_123', status: 'missing_requirements' },
        });
        BaseResource._fetch = mockFetch;

        const signUp = new SignUp();
        await signUp.__internal_future.password({ password: 'test-password-123' });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'POST',
            path: '/client/sign_ups',
            body: expect.objectContaining({
              strategy: 'password',
              password: 'test-password-123',
            }),
          }),
        );
      });

      it('updates existing signup when already created', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: { id: 'signup_123', status: 'missing_requirements' },
        });
        BaseResource._fetch = mockFetch;

        const signUp = new SignUp({ id: 'signup_123' } as any);
        await signUp.__internal_future.password({ password: 'test-password-123' });

        // Should use PATCH to update existing signup, not POST to create a new one
        expect(mockFetch).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'PATCH',
            path: '/client/sign_ups/signup_123',
            body: expect.objectContaining({
              strategy: 'password',
              password: 'test-password-123',
            }),
          }),
        );
      });

      it('returns error property on success', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: { id: 'signup_123', status: 'missing_requirements' },
        });
        BaseResource._fetch = mockFetch;

        const signUp = new SignUp();
        const result = await signUp.__internal_future.password({ password: 'test-password-123' });

        expect(result).toHaveProperty('error', null);
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

        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: { id: 'signup_123' },
        });
        BaseResource._fetch = mockFetch;

        const signUp = new SignUp();
        await signUp.__internal_future.ticket();

        expect(mockFetch).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'POST',
            path: '/client/sign_ups',
            body: expect.objectContaining({
              ticket: 'ticket_from_query',
            }),
          }),
        );
      });

      it('uses provided ticket parameter', async () => {
        const mockSearchParams = new URLSearchParams('?__clerk_ticket=ticket_from_query');
        vi.stubGlobal('window', {
          location: {
            search: '?__clerk_ticket=ticket_from_query',
            href: 'https://example.com?__clerk_ticket=ticket_from_query',
          },
        });
        vi.stubGlobal('URLSearchParams', vi.fn().mockReturnValue(mockSearchParams));

        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: { id: 'signup_123' },
        });
        BaseResource._fetch = mockFetch;

        const signUp = new SignUp();
        await signUp.__internal_future.ticket({ ticket: 'provided_ticket' });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'POST',
            path: '/client/sign_ups',
            body: expect.objectContaining({
              ticket: 'provided_ticket',
            }),
          }),
        );
      });
    });

    describe('finalize', () => {
      afterEach(() => {
        vi.clearAllMocks();
      });

      it('calls setActive with created session ID', async () => {
        const mockSetActive = vi.fn().mockResolvedValue({});

        SignUp.clerk = {
          setActive: mockSetActive,
        } as any;

        const signUp = new SignUp({ id: 'signup_123', created_session_id: 'session_123' } as any);
        await signUp.__internal_future.finalize();

        expect(mockSetActive).toHaveBeenCalledWith({ session: 'session_123', navigate: undefined });
      });

      it('passes navigate parameter to setActive', async () => {
        const mockSetActive = vi.fn().mockResolvedValue({});
        const mockNavigate = vi.fn();

        SignUp.clerk = {
          setActive: mockSetActive,
        } as any;

        const signUp = new SignUp({ id: 'signup_123', created_session_id: 'session_123' } as any);
        await signUp.__internal_future.finalize({ navigate: mockNavigate });

        expect(mockSetActive).toHaveBeenCalledWith({ session: 'session_123', navigate: mockNavigate });
      });

      it('returns error when no created session ID', async () => {
        const signUp = new SignUp({ id: 'signup_123' } as any);

        const result = await signUp.__internal_future.finalize();

        expect(result.error).toBeInstanceOf(Error);
      });
    });

    describe('reset', () => {
      let mockClient: { signUp: SignUp; resetSignUp: ReturnType<typeof vi.fn> };

      beforeEach(() => {
        // Set up mock client with resetSignUp method that simulates what the real
        // Client.resetSignUp does: creates a new SignUp, updates signals via events,
        // and the State class responds by updating the actual signal values
        mockClient = {
          signUp: new SignUp(null),
          resetSignUp: vi.fn().mockImplementation(function (this: typeof mockClient) {
            const newSignUp = new SignUp(null);
            this.signUp = newSignUp;
            // Emit events like the real implementation
            eventBus.emit('resource:error', { resource: newSignUp, error: null });
            // Also update signals directly since State isn't set up in tests
            signUpResourceSignal({ resource: newSignUp });
            signUpErrorSignal({ error: null });
          }),
        };
        SignUp.clerk = {
          client: mockClient,
        } as any;
      });

      afterEach(() => {
        vi.clearAllMocks();
        vi.restoreAllMocks();
        // Reset signals to initial state
        signUpResourceSignal({ resource: null });
        signUpErrorSignal({ error: null });
      });

      it('does NOT emit resource:fetch with status fetching', async () => {
        const emitSpy = vi.spyOn(eventBus, 'emit');
        const mockFetch = vi.fn();
        BaseResource._fetch = mockFetch;

        const signUp = new SignUp({ id: 'signup_123', status: 'missing_requirements' } as any);
        await signUp.__internal_future.reset();

        // Verify that resource:fetch was NOT called with status: 'fetching'
        const fetchingCalls = emitSpy.mock.calls.filter(
          call => call[0] === 'resource:fetch' && call[1]?.status === 'fetching',
        );
        expect(fetchingCalls).toHaveLength(0);
        // Verify no API calls were made
        expect(mockFetch).not.toHaveBeenCalled();
      });

      it('clears any previous errors by updating signUpErrorSignal', async () => {
        // Set an initial error
        signUpErrorSignal({ error: new Error('Previous error') });
        expect(signUpErrorSignal().error).toBeTruthy();

        const signUp = new SignUp({ id: 'signup_123', status: 'missing_requirements' } as any);
        await signUp.__internal_future.reset();

        // Verify that error signal was cleared
        expect(signUpErrorSignal().error).toBeNull();
      });

      it('returns error: null on success', async () => {
        const signUp = new SignUp({ id: 'signup_123', status: 'missing_requirements' } as any);
        const result = await signUp.__internal_future.reset();

        expect(result).toHaveProperty('error', null);
      });

      it('resets an existing signup with data to a fresh null state', async () => {
        const signUp = new SignUp({
          id: 'signup_123',
          status: 'missing_requirements',
          email_address: 'user@example.com',
          first_name: 'John',
        } as any);

        // Verify initial state
        expect(signUp.id).toBe('signup_123');
        expect(signUp.emailAddress).toBe('user@example.com');
        expect(signUp.firstName).toBe('John');

        await signUp.__internal_future.reset();

        // Verify that signUpResourceSignal was updated with a new SignUp(null) instance
        const updatedSignUp = signUpResourceSignal().resource;
        expect(updatedSignUp).toBeInstanceOf(SignUp);
        expect(updatedSignUp?.id).toBeUndefined();
        expect(updatedSignUp?.status).toBeNull();
        expect(updatedSignUp?.emailAddress).toBeNull();
        expect(updatedSignUp?.firstName).toBeNull();
        expect(updatedSignUp?.lastName).toBeNull();
        expect(updatedSignUp?.phoneNumber).toBeNull();
      });

      it('updates clerk.client.signUp with the fresh null instance', async () => {
        const originalSignUp = new SignUp({
          id: 'signup_123',
          status: 'missing_requirements',
          email_address: 'user@example.com',
          first_name: 'John',
        } as any);
        mockClient.signUp = originalSignUp;

        // Verify initial state
        expect(mockClient.signUp.id).toBe('signup_123');
        expect(mockClient.signUp.status).toBe('missing_requirements');
        expect(mockClient.signUp.emailAddress).toBe('user@example.com');

        await originalSignUp.__internal_future.reset();

        // Verify that clerk.client.signUp was updated with a new SignUp(null) instance
        expect(mockClient.signUp).toBeInstanceOf(SignUp);
        expect(mockClient.signUp.id).toBeUndefined();
        expect(mockClient.signUp.status).toBeNull();
        expect(mockClient.signUp.emailAddress).toBeNull();
        expect(mockClient.signUp.firstName).toBeNull();
      });
    });
  });

  describe('protect check', () => {
    describe('fromJSON and toSnapshot', () => {
      it('deserializes protect_check from verifications JSON', () => {
        const signUp = new SignUp({
          id: 'signup_123',
          status: 'missing_requirements',
          verifications: {
            protect_check: { url: 'https://cdn.example.com/check.mjs' },
          },
        } as any);

        expect(signUp.verifications.protectCheck).toEqual({ url: 'https://cdn.example.com/check.mjs' });
      });

      it('deserializes protect_check as null when not present', () => {
        const signUp = new SignUp({
          id: 'signup_123',
          status: 'missing_requirements',
        } as any);

        expect(signUp.verifications.protectCheck).toBeNull();
      });

      it('deserializes protect_check as null when explicitly null', () => {
        const signUp = new SignUp({
          id: 'signup_123',
          status: 'missing_requirements',
          verifications: {
            protect_check: null,
          },
        } as any);

        expect(signUp.verifications.protectCheck).toBeNull();
      });

      it('serializes protect_check in toSnapshot', () => {
        const signUp = new SignUp({
          id: 'signup_123',
          status: 'missing_requirements',
          verifications: {
            protect_check: { url: 'https://cdn.example.com/check.mjs' },
          },
        } as any);

        const snapshot = signUp.__internal_toSnapshot();
        expect(snapshot.verifications.protect_check).toEqual({ url: 'https://cdn.example.com/check.mjs' });
      });

      it('serializes protect_check as null in toSnapshot when not set', () => {
        const signUp = new SignUp({
          id: 'signup_123',
          status: 'missing_requirements',
        } as any);

        const snapshot = signUp.__internal_toSnapshot();
        expect(snapshot.verifications.protect_check).toBeNull();
      });
    });

    describe('SignUpFuture.verifications.protectCheck getter', () => {
      it('exposes protectCheck from the underlying resource verifications', () => {
        const signUp = new SignUp({
          id: 'signup_123',
          verifications: {
            protect_check: { url: 'https://cdn.example.com/check.mjs' },
          },
        } as any);

        expect(signUp.__internal_future.verifications.protectCheck).toEqual({
          url: 'https://cdn.example.com/check.mjs',
        });
      });

      it('returns null when no protect check', () => {
        const signUp = new SignUp({ id: 'signup_123' } as any);
        expect(signUp.__internal_future.verifications.protectCheck).toBeNull();
      });
    });

    describe('SignUp.runProtectCheck', () => {
      beforeEach(() => {
        SignUp.clerk = {
          __internal_environment: {
            displayConfig: { captchaOauthBypass: [] },
          },
          client: { captchaBypass: true },
        } as any;
        mockExecuteProtectCheck.mockReset();
      });

      afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
        SignUp.clerk = {} as any;
      });

      it('calls prepare_protect_check, executes script, and calls attempt_protect_check', async () => {
        mockExecuteProtectCheck.mockResolvedValue({ token: 'solved_abc' });

        const mockFetch = vi
          .fn()
          // prepare_protect_check response
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signup_123',
              status: 'missing_requirements',
              missing_fields: ['protect_check'],
              verifications: { protect_check: { url: 'https://cdn.example.com/check.mjs' } },
            },
          })
          // attempt_protect_check response
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signup_123',
              status: 'missing_requirements',
              missing_fields: [],
              verifications: { protect_check: null },
            },
          });
        BaseResource._fetch = mockFetch;

        const signUp = new SignUp({
          id: 'signup_123',
          status: 'missing_requirements',
          missing_fields: ['protect_check'],
        } as any);
        await signUp.runProtectCheck();

        // executeProtectCheck was called with the URL, the signUp resource, and a container div
        expect(mockExecuteProtectCheck).toHaveBeenCalledTimes(1);
        expect(mockExecuteProtectCheck).toHaveBeenCalledWith(
          'https://cdn.example.com/check.mjs',
          signUp,
          expect.any(HTMLDivElement),
        );

        // First call: prepare_protect_check
        expect(mockFetch).toHaveBeenCalledTimes(2);
        expect(mockFetch.mock.calls[0][0]).toEqual(
          expect.objectContaining({
            method: 'POST',
            path: '/client/sign_ups/signup_123/prepare_protect_check',
          }),
        );

        // Second call: attempt_protect_check with result
        expect(mockFetch.mock.calls[1][0]).toEqual(
          expect.objectContaining({
            method: 'POST',
            path: '/client/sign_ups/signup_123/attempt_protect_check',
            body: { token: 'solved_abc' },
          }),
        );
      });

      it('cleans up the protect check container after execution', async () => {
        mockExecuteProtectCheck.mockResolvedValue({ token: 'solved' });

        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signup_123',
              status: 'missing_requirements',
              verifications: { protect_check: { url: 'https://cdn.example.com/check.mjs' } },
            },
          })
          .mockResolvedValueOnce({
            client: null,
            response: { id: 'signup_123', status: 'missing_requirements', verifications: { protect_check: null } },
          });
        BaseResource._fetch = mockFetch;

        const signUp = new SignUp({ id: 'signup_123' } as any);
        await signUp.runProtectCheck();

        const container = mockExecuteProtectCheck.mock.calls[0][2] as HTMLDivElement;
        expect(container.innerHTML).toBe('');
      });

      it('cleans up container even when executeProtectCheck throws', async () => {
        mockExecuteProtectCheck.mockRejectedValue(new Error('script failed'));

        const mockFetch = vi.fn().mockResolvedValueOnce({
          client: null,
          response: {
            id: 'signup_123',
            status: 'missing_requirements',
            verifications: { protect_check: { url: 'https://cdn.example.com/check.mjs' } },
          },
        });
        BaseResource._fetch = mockFetch;

        const signUp = new SignUp({ id: 'signup_123' } as any);
        await expect(signUp.runProtectCheck()).rejects.toThrow('script failed');

        const container = mockExecuteProtectCheck.mock.calls[0][2] as HTMLDivElement;
        expect(container.innerHTML).toBe('');
      });

      it('throws when prepare returns no protect_check URL', async () => {
        const mockFetch = vi.fn().mockResolvedValueOnce({
          client: null,
          response: {
            id: 'signup_123',
            status: 'missing_requirements',
            verifications: { protect_check: null },
          },
        });
        BaseResource._fetch = mockFetch;

        const signUp = new SignUp({ id: 'signup_123' } as any);
        await expect(signUp.runProtectCheck()).rejects.toThrow('No protect check script URL returned');

        expect(mockExecuteProtectCheck).not.toHaveBeenCalled();
      });
    });

    describe('SignUp.create does not auto-execute protect check', () => {
      beforeEach(() => {
        SignUp.clerk = {
          __internal_environment: {
            displayConfig: { captchaOauthBypass: [] },
          },
          client: { captchaBypass: true },
        } as any;
        mockExecuteProtectCheck.mockReset();
      });

      afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
        SignUp.clerk = {} as any;
      });

      it('does not auto-execute protect check even when protect_check is in response', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: {
            id: 'signup_123',
            status: 'missing_requirements',
            missing_fields: ['protect_check'],
            verifications: { protect_check: { url: 'https://cdn.example.com/check.mjs' } },
          },
        });
        BaseResource._fetch = mockFetch;

        const signUp = new SignUp();
        await signUp.create({ emailAddress: 'user@example.com' });

        expect(mockExecuteProtectCheck).not.toHaveBeenCalled();
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
    });

    describe('SignUpFuture.verifications.runProtectCheck', () => {
      beforeEach(() => {
        SignUp.clerk = {
          client: { captchaBypass: true },
        } as any;
        mockExecuteProtectCheck.mockReset();
      });

      afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
        SignUp.clerk = {} as any;
      });

      it('runs prepare → execute → attempt flow', async () => {
        mockExecuteProtectCheck.mockResolvedValue({ token: 'solved_xyz' });

        const mockFetch = vi
          .fn()
          // prepare_protect_check response
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signup_123',
              status: 'missing_requirements',
              verifications: { protect_check: { url: 'https://cdn.example.com/check.mjs' } },
            },
          })
          // attempt_protect_check response
          .mockResolvedValueOnce({
            client: null,
            response: {
              id: 'signup_123',
              status: 'missing_requirements',
              verifications: { protect_check: null },
            },
          });
        BaseResource._fetch = mockFetch;

        const signUp = new SignUp({
          id: 'signup_123',
          status: 'missing_requirements',
          missing_fields: ['protect_check'],
        } as any);
        const result = await signUp.__internal_future.verifications.runProtectCheck();

        expect(result).toHaveProperty('error', null);
        expect(mockExecuteProtectCheck).toHaveBeenCalledTimes(1);
        expect(mockFetch).toHaveBeenCalledTimes(2);

        // First call: prepare_protect_check
        expect(mockFetch.mock.calls[0][0]).toEqual(
          expect.objectContaining({
            method: 'POST',
            path: '/client/sign_ups/signup_123/prepare_protect_check',
          }),
        );

        // Second call: attempt_protect_check with result
        expect(mockFetch.mock.calls[1][0]).toEqual(
          expect.objectContaining({
            method: 'POST',
            path: '/client/sign_ups/signup_123/attempt_protect_check',
            body: { token: 'solved_xyz' },
          }),
        );
      });

      it('returns error when prepare returns no URL', async () => {
        const mockFetch = vi.fn().mockResolvedValueOnce({
          client: null,
          response: {
            id: 'signup_123',
            status: 'missing_requirements',
            verifications: { protect_check: null },
          },
        });
        BaseResource._fetch = mockFetch;

        const signUp = new SignUp({ id: 'signup_123' } as any);
        const result = await signUp.__internal_future.verifications.runProtectCheck();

        expect(result.error).toBeTruthy();
        expect(mockExecuteProtectCheck).not.toHaveBeenCalled();
      });

      it('does not auto-execute protect check from create', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: {
            id: 'signup_123',
            status: 'missing_requirements',
            missing_fields: ['protect_check'],
            verifications: { protect_check: { url: 'https://cdn.example.com/check.mjs' } },
          },
        });
        BaseResource._fetch = mockFetch;

        const signUp = new SignUp();
        await signUp.__internal_future.create({ emailAddress: 'user@example.com' });

        expect(mockExecuteProtectCheck).not.toHaveBeenCalled();
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      it('does not auto-execute protect check from password', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: {
            id: 'signup_123',
            status: 'missing_requirements',
            missing_fields: ['protect_check'],
            verifications: { protect_check: { url: 'https://cdn.example.com/check.mjs' } },
          },
        });
        BaseResource._fetch = mockFetch;

        const signUp = new SignUp();
        await signUp.__internal_future.password({
          password: 'secure-password',
          emailAddress: 'user@example.com',
        });

        expect(mockExecuteProtectCheck).not.toHaveBeenCalled();
      });

      it('does not auto-execute protect check from sso', async () => {
        vi.stubGlobal('window', { location: { origin: 'https://example.com' } });
        SignUp.clerk = {
          buildUrlWithAuth: vi.fn().mockReturnValue('https://example.com/sso-callback'),
          __internal_environment: {
            displayConfig: { captchaOauthBypass: [] },
          },
          client: { captchaBypass: true },
        } as any;

        const mockFetch = vi.fn().mockResolvedValue({
          client: null,
          response: {
            id: 'signup_123',
            verifications: {
              externalAccount: { status: 'complete' },
              protect_check: { url: 'https://cdn.example.com/check.mjs' },
            },
          },
        });
        BaseResource._fetch = mockFetch;

        const signUp = new SignUp();
        await signUp.__internal_future.sso({
          strategy: 'oauth_google',
          redirectUrl: '/complete',
          redirectCallbackUrl: '/sso-callback',
        });

        expect(mockExecuteProtectCheck).not.toHaveBeenCalled();
      });
    });
  });
});
