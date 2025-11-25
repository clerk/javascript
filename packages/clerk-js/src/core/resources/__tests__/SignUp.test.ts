import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

// Mock the CaptchaChallenge module
vi.mock('../../../utils/captcha/CaptchaChallenge', () => ({
  CaptchaChallenge: vi.fn().mockImplementation(() => ({
    managedOrInvisible: vi.fn().mockResolvedValue({
      captchaToken: 'mock_token',
      captchaWidgetType: 'invisible',
    }),
  })),
}));

describe('SignUp', () => {
  describe('SignUpFuture', () => {
    describe('create', () => {
      afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
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
    });

    describe('sendPhoneCode', () => {
      afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
      });

      it('creates signup with phoneNumber when no existing signup', async () => {
        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({
            client: null,
            response: { id: 'signup_123', status: 'missing_requirements' },
          })
          .mockResolvedValueOnce({
            client: null,
            response: { id: 'signup_123' },
          });
        BaseResource._fetch = mockFetch;

        const signUp = new SignUp();
        await signUp.__internal_future.verifications.sendPhoneCode({ phoneNumber: '+15551234567' });

        // First call should create signup with phoneNumber
        expect(mockFetch).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({
            method: 'POST',
            path: '/client/sign_ups',
            body: expect.objectContaining({
              phoneNumber: '+15551234567',
            }),
          }),
        );

        // Second call should prepare verification
        expect(mockFetch).toHaveBeenNthCalledWith(
          2,
          expect.objectContaining({
            method: 'POST',
            path: '/client/sign_ups/signup_123/prepare_verification',
            body: expect.objectContaining({
              strategy: 'phone_code',
            }),
          }),
        );
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

    describe('sso', () => {
      afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
      });

      it('handles relative redirectUrl by converting to absolute', async () => {
        vi.stubGlobal('window', { location: { origin: 'https://example.com' } });

        const mockBuildUrlWithAuth = vi.fn().mockReturnValue('https://example.com/sso-callback');
        SignUp.clerk = {
          buildUrlWithAuth: mockBuildUrlWithAuth,
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
          __unstable__environment: {
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

        const getMetamaskIdentifierModule = await import('../../../utils');
        vi.spyOn(getMetamaskIdentifierModule, 'getMetamaskIdentifier').mockResolvedValue(
          '0x1234567890123456789012345678901234567890',
        );
        vi.spyOn(getMetamaskIdentifierModule, 'generateSignatureWithMetamask').mockResolvedValue('signature_123');

        const signUp = new SignUp();
        await signUp.__internal_future.web3({ strategy: 'web3_metamask_signature' });

        // Verify signature generation was called
        expect(getMetamaskIdentifierModule.generateSignatureWithMetamask).toHaveBeenCalled();
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

        const getCoinbaseWalletIdentifierModule = await import('../../../utils');
        vi.spyOn(getCoinbaseWalletIdentifierModule, 'getCoinbaseWalletIdentifier').mockResolvedValue(
          '0x1234567890123456789012345678901234567890',
        );
        vi.spyOn(getCoinbaseWalletIdentifierModule, 'generateSignatureWithCoinbaseWallet').mockResolvedValue(
          'signature_123',
        );

        const signUp = new SignUp();
        await signUp.__internal_future.web3({ strategy: 'web3_coinbase_wallet_signature' });

        // Verify signature generation was called
        expect(getCoinbaseWalletIdentifierModule.generateSignatureWithCoinbaseWallet).toHaveBeenCalled();
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

        const getBaseIdentifierModule = await import('../../../utils');
        vi.spyOn(getBaseIdentifierModule, 'getBaseIdentifier').mockResolvedValue(
          '0x1234567890123456789012345678901234567890',
        );
        vi.spyOn(getBaseIdentifierModule, 'generateSignatureWithBase').mockResolvedValue('signature_123');

        const signUp = new SignUp();
        await signUp.__internal_future.web3({ strategy: 'web3_base_signature' });

        // Verify signature generation was called
        expect(getBaseIdentifierModule.generateSignatureWithBase).toHaveBeenCalled();
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

        const getOKXWalletIdentifierModule = await import('../../../utils');
        vi.spyOn(getOKXWalletIdentifierModule, 'getOKXWalletIdentifier').mockResolvedValue(
          '0x1234567890123456789012345678901234567890',
        );
        vi.spyOn(getOKXWalletIdentifierModule, 'generateSignatureWithOKXWallet').mockResolvedValue('signature_123');

        const signUp = new SignUp();
        await signUp.__internal_future.web3({ strategy: 'web3_okx_wallet_signature' });

        // Verify signature generation was called
        expect(getOKXWalletIdentifierModule.generateSignatureWithOKXWallet).toHaveBeenCalled();
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

        const getCoinbaseWalletIdentifierModule = await import('../../../utils');
        vi.spyOn(getCoinbaseWalletIdentifierModule, 'getCoinbaseWalletIdentifier').mockResolvedValue(
          '0x1234567890123456789012345678901234567890',
        );

        const mockGenerateSignature = vi
          .fn()
          .mockRejectedValueOnce({ code: 4001, message: 'User rejected' })
          .mockResolvedValueOnce('signature_123');

        vi.spyOn(getCoinbaseWalletIdentifierModule, 'generateSignatureWithCoinbaseWallet').mockImplementation(
          mockGenerateSignature,
        );

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

        const getCoinbaseWalletIdentifierModule = await import('../../../utils');
        vi.spyOn(getCoinbaseWalletIdentifierModule, 'getCoinbaseWalletIdentifier').mockResolvedValue(
          '0x1234567890123456789012345678901234567890',
        );

        const mockError = { code: 5000, message: 'Other error' };
        vi.spyOn(getCoinbaseWalletIdentifierModule, 'generateSignatureWithCoinbaseWallet').mockRejectedValue(mockError);

        const signUp = new SignUp();
        const result = await signUp.__internal_future.web3({ strategy: 'web3_coinbase_wallet_signature' });

        // Verify error is returned without retry
        expect(result.error).toBeTruthy();
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
  });
});
