import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BaseResource } from '../internal';
import { SignUp } from '../SignUp';

/**
 * Covers the native (system-browser) OAuth transport branch of `SignUp.authenticateWithRedirect`.
 * The default web redirect path is exercised elsewhere and must stay unchanged when no transport is
 * registered.
 */
describe('SignUp native OAuth transport', () => {
  let getRedirectUrl: ReturnType<typeof vi.fn>;
  let open: ReturnType<typeof vi.fn>;
  let handleRedirectCallback: ReturnType<typeof vi.fn>;

  const NATIVE_REDIRECT_URL = 'clerk://sso-callback';

  const setupClerk = () => {
    getRedirectUrl = vi.fn().mockResolvedValue(NATIVE_REDIRECT_URL);
    open = vi.fn();
    handleRedirectCallback = vi.fn().mockResolvedValue(undefined);
    SignUp.clerk = {
      buildUrlWithAuth: vi.fn().mockImplementation((url: string) => url),
      handleRedirectCallback,
      __internal_nativeOAuthHandler: { getRedirectUrl, open },
      client: {
        signIn: { firstFactorVerification: { status: 'unverified' } },
        signUp: {},
      },
      __internal_environment: {
        displayConfig: { captchaOauthBypass: ['oauth_google'] },
      },
    } as any;
  };

  const mockCreateReturnsExternalRedirect = () => {
    BaseResource._fetch = vi.fn().mockResolvedValue({
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
  };

  beforeEach(() => {
    vi.stubGlobal('window', { location: { origin: 'https://example.com' } });
    setupClerk();
    mockCreateReturnsExternalRedirect();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('creates the OAuth flow with the native redirect URL, then resumes via handleRedirectCallback', async () => {
    open.mockResolvedValue({
      type: 'success',
      callbackUrl: 'clerk://sso-callback?rotating_token_nonce=nonce_abc',
    });

    const signUp = new SignUp();
    await signUp.authenticateWithRedirect({
      strategy: 'oauth_google',
      redirectUrl: 'https://example.com/sso-callback',
      redirectUrlComplete: 'https://complete.example.com',
    });

    // The native callback URL (not the web sso-callback route) is baked into the create call.
    expect(getRedirectUrl).toHaveBeenCalledTimes(1);
    expect((BaseResource._fetch as any).mock.calls[0][0].body.redirectUrl).toBe(NATIVE_REDIRECT_URL);
    // FAPI may redirect to actionCompleteRedirectUrl on immediate completion, so it must be native too.
    expect((BaseResource._fetch as any).mock.calls[0][0].body.actionCompleteRedirectUrl).toBe(NATIVE_REDIRECT_URL);

    expect(open).toHaveBeenCalledTimes(1);
    expect(open.mock.calls[0][0].href).toBe('https://sso.example.com/auth');

    expect(handleRedirectCallback).toHaveBeenCalledTimes(1);
    expect(handleRedirectCallback).toHaveBeenCalledWith({
      rotatingTokenNonce: 'nonce_abc',
      reloadResource: 'signUp',
      signInForceRedirectUrl: 'https://complete.example.com',
      signUpForceRedirectUrl: 'https://complete.example.com',
    });
  });

  it('resolves without resuming when the handler reports a cancellation', async () => {
    open.mockResolvedValue({ type: 'cancelled' });

    const signUp = new SignUp();
    await expect(
      signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: 'https://example.com/sso-callback',
        redirectUrlComplete: 'https://complete.example.com',
      }),
    ).resolves.toBeUndefined();

    expect(open).toHaveBeenCalledTimes(1);
    expect(handleRedirectCallback).not.toHaveBeenCalled();
  });

  it('rejects without resuming when the callback carries an error param', async () => {
    open.mockResolvedValue({
      type: 'success',
      callbackUrl: 'clerk://sso-callback?error=access_denied',
    });

    const signUp = new SignUp();
    await expect(
      signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: 'https://example.com/sso-callback',
        redirectUrlComplete: 'https://complete.example.com',
      }),
    ).rejects.toMatchObject({ code: 'native_oauth_error' });

    expect(handleRedirectCallback).not.toHaveBeenCalled();
  });
});
