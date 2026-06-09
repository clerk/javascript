import { isClerkAPIResponseError, isClerkRuntimeError } from '@clerk/shared/error';
import { describe, expect, it, vi } from 'vitest';

import { authenticateSignInWithNativeTransport, authenticateSignUpWithNativeTransport } from '../nativeOAuthTransport';

function makeMockClerk(overrides?: object) {
  return {
    __internal_handleNativeOAuthCallback: vi.fn().mockResolvedValue(undefined),
    client: {
      resetSignIn: vi.fn(),
      resetSignUp: vi.fn(),
    },
    ...overrides,
  } as any;
}

function makeMockTransport(callbackUrl: string) {
  return {
    getRedirectUrl: vi.fn().mockResolvedValue('myapp://sso-callback'),
    open: vi.fn().mockResolvedValue({ callbackUrl }),
  };
}

describe('authenticateSignInWithNativeTransport', () => {
  it('creates signIn with transport URL, opens transport, and handles successful nonce callback', async () => {
    const externalVerificationRedirectURL = new URL('https://accounts.example.com/oauth');
    const transport = makeMockTransport('myapp://sso-callback?rotating_token_nonce=test-nonce');
    const clerk = makeMockClerk();
    const callbackParams = { signInUrl: '/sign-in', signUpUrl: '/sign-up' };

    const signIn = { id: undefined, firstFactorVerification: {} } as any;
    signIn.create = vi.fn().mockImplementation(async () => {
      signIn.firstFactorVerification = { externalVerificationRedirectURL };
      return signIn;
    });
    signIn.reload = vi.fn().mockImplementation(async () => signIn);

    await authenticateSignInWithNativeTransport({
      transport,
      signIn,
      clerk,
      strategy: 'oauth_google',
      callbackParams,
    });

    expect(signIn.create).toHaveBeenCalledWith({
      strategy: 'oauth_google',
      identifier: undefined,
      redirectUrl: 'myapp://sso-callback',
      actionCompleteRedirectUrl: 'myapp://sso-callback',
    });
    expect(transport.open).toHaveBeenCalledWith(externalVerificationRedirectURL);
    expect(signIn.reload).toHaveBeenCalledWith({ rotatingTokenNonce: 'test-nonce' });
    expect(clerk.__internal_handleNativeOAuthCallback).toHaveBeenCalledWith(signIn, callbackParams);
  });

  it('skips create and calls prepareFirstFactor for enterprise_sso with continueSignIn', async () => {
    const externalVerificationRedirectURL = new URL('https://sso.example.com/auth');
    const transport = makeMockTransport('myapp://sso-callback?rotating_token_nonce=test-nonce');
    const clerk = makeMockClerk();

    const signIn = { id: 'signin_123', firstFactorVerification: {} } as any;
    signIn.create = vi.fn();
    signIn.prepareFirstFactor = vi.fn().mockImplementation(async () => {
      signIn.firstFactorVerification = { externalVerificationRedirectURL };
      return signIn;
    });
    signIn.reload = vi.fn().mockImplementation(async () => signIn);

    await authenticateSignInWithNativeTransport({
      transport,
      signIn,
      clerk,
      strategy: 'enterprise_sso',
      continueSignIn: true,
      enterpriseConnectionId: 'ec_123',
      callbackParams: {},
    });

    expect(signIn.create).not.toHaveBeenCalled();
    expect(signIn.prepareFirstFactor).toHaveBeenCalledWith({
      strategy: 'enterprise_sso',
      redirectUrl: 'myapp://sso-callback',
      actionCompleteRedirectUrl: 'myapp://sso-callback',
      oidcPrompt: undefined,
      enterpriseConnectionId: 'ec_123',
    });
    expect(transport.open).toHaveBeenCalledWith(externalVerificationRedirectURL);
    expect(clerk.__internal_handleNativeOAuthCallback).toHaveBeenCalledWith(signIn, {});
  });

  it('resets signIn and throws when callback URL has no nonce', async () => {
    const externalVerificationRedirectURL = new URL('https://accounts.example.com/oauth');
    const transport = makeMockTransport('myapp://sso-callback');
    const resetSignIn = vi.fn();
    const clerk = makeMockClerk({ client: { resetSignIn } });

    const signIn = { id: undefined, firstFactorVerification: {} } as any;
    signIn.create = vi.fn().mockImplementation(async () => {
      signIn.firstFactorVerification = { externalVerificationRedirectURL };
      return signIn;
    });

    await expect(
      authenticateSignInWithNativeTransport({
        transport,
        signIn,
        clerk,
        strategy: 'oauth_google',
        callbackParams: {},
      }),
    ).rejects.toSatisfy(isClerkRuntimeError);

    expect(resetSignIn).toHaveBeenCalled();
  });

  it('propagates errors from callback URL error params', async () => {
    const externalVerificationRedirectURL = new URL('https://accounts.example.com/oauth');
    const transport = makeMockTransport(
      'myapp://sso-callback?error_code=oauth_access_denied&error_message=Access%20denied',
    );
    const clerk = makeMockClerk();

    const signIn = { id: undefined, firstFactorVerification: {} } as any;
    signIn.create = vi.fn().mockImplementation(async () => {
      signIn.firstFactorVerification = { externalVerificationRedirectURL };
      return signIn;
    });

    await expect(
      authenticateSignInWithNativeTransport({
        transport,
        signIn,
        clerk,
        strategy: 'oauth_google',
        callbackParams: {},
      }),
    ).rejects.toSatisfy(isClerkAPIResponseError);
  });
});

describe('authenticateSignUpWithNativeTransport', () => {
  it('creates signUp with transport URL, opens transport, and handles successful nonce callback', async () => {
    const externalVerificationRedirectURL = new URL('https://accounts.example.com/oauth');
    const transport = makeMockTransport('myapp://sso-callback?rotating_token_nonce=test-nonce');
    const clerk = makeMockClerk();
    const callbackParams = { signInUrl: '/sign-in', signUpUrl: '/sign-up' };

    const signUp = { id: undefined, verifications: { externalAccount: {} } } as any;
    signUp.create = vi.fn().mockImplementation(async () => {
      signUp.verifications.externalAccount = { externalVerificationRedirectURL };
      return signUp;
    });
    signUp.reload = vi.fn().mockImplementation(async () => signUp);

    await authenticateSignUpWithNativeTransport({
      transport,
      signUp,
      clerk,
      strategy: 'oauth_google',
      unsafeMetadata: { plan: 'pro' },
      legalAccepted: true,
      callbackParams,
    });

    expect(signUp.create).toHaveBeenCalledWith(
      expect.objectContaining({
        strategy: 'oauth_google',
        redirectUrl: 'myapp://sso-callback',
        actionCompleteRedirectUrl: 'myapp://sso-callback',
        unsafeMetadata: { plan: 'pro' },
        legalAccepted: true,
      }),
    );
    expect(transport.open).toHaveBeenCalledWith(externalVerificationRedirectURL);
    expect(signUp.reload).toHaveBeenCalledWith({ rotatingTokenNonce: 'test-nonce' });
    expect(clerk.__internal_handleNativeOAuthCallback).toHaveBeenCalledWith(signUp, callbackParams);
  });

  it('uses update instead of create when continueSignUp is true and signUp has an id', async () => {
    const externalVerificationRedirectURL = new URL('https://accounts.example.com/oauth');
    const transport = makeMockTransport('myapp://sso-callback?rotating_token_nonce=test-nonce');
    const clerk = makeMockClerk();

    const signUp = { id: 'signup_123', verifications: { externalAccount: {} } } as any;
    signUp.create = vi.fn();
    signUp.update = vi.fn().mockImplementation(async () => {
      signUp.verifications.externalAccount = { externalVerificationRedirectURL };
      return signUp;
    });
    signUp.reload = vi.fn().mockImplementation(async () => signUp);

    await authenticateSignUpWithNativeTransport({
      transport,
      signUp,
      clerk,
      strategy: 'oauth_google',
      continueSignUp: true,
      callbackParams: {},
    });

    expect(signUp.create).not.toHaveBeenCalled();
    expect(signUp.update).toHaveBeenCalledWith(
      expect.objectContaining({
        strategy: 'oauth_google',
        redirectUrl: 'myapp://sso-callback',
        actionCompleteRedirectUrl: 'myapp://sso-callback',
      }),
    );
    expect(clerk.__internal_handleNativeOAuthCallback).toHaveBeenCalledWith(signUp, {});
  });

  it('resets signUp and throws when callback URL has no nonce', async () => {
    const externalVerificationRedirectURL = new URL('https://accounts.example.com/oauth');
    const transport = makeMockTransport('myapp://sso-callback');
    const resetSignUp = vi.fn();
    const clerk = makeMockClerk({ client: { resetSignUp } });

    const signUp = { id: undefined, verifications: { externalAccount: {} } } as any;
    signUp.create = vi.fn().mockImplementation(async () => {
      signUp.verifications.externalAccount = { externalVerificationRedirectURL };
      return signUp;
    });

    await expect(
      authenticateSignUpWithNativeTransport({
        transport,
        signUp,
        clerk,
        strategy: 'oauth_google',
        callbackParams: {},
      }),
    ).rejects.toSatisfy(isClerkRuntimeError);

    expect(resetSignUp).toHaveBeenCalled();
  });
});
