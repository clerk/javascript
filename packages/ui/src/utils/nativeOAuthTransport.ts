import type {
  ClerkAPIError,
  EnterpriseSSOStrategy,
  HandleOAuthCallbackParams,
  LoadedClerk,
  NativeOAuthHandler,
  OAuthStrategy,
  SignInResource,
  SignUpResource,
} from '@clerk/shared/types';

import {
  createNativeRedirectResourceError,
  getRotatingTokenNonceFromNativeRedirectCallback,
  throwIfNativeRedirectCallbackHasError,
} from './nativeRedirectCallback';

type ClerkForNativeOAuth = Pick<LoadedClerk, '__internal_handleNativeOAuthCallback'>;

type CompleteNativeOAuthCallbackOpts = {
  callbackUrl: string;
  reloadWithNonce: (nonce: string) => Promise<unknown>;
  reload: () => Promise<unknown>;
  getError: () => ClerkAPIError | null | undefined;
  reset: () => Promise<unknown>;
  handleCallback: () => Promise<unknown>;
};

async function completeNativeOAuthCallback(opts: CompleteNativeOAuthCallbackOpts): Promise<void> {
  throwIfNativeRedirectCallbackHasError(opts.callbackUrl);

  const nonce = getRotatingTokenNonceFromNativeRedirectCallback(opts.callbackUrl);
  if (nonce) {
    await opts.reloadWithNonce(nonce);
    await opts.handleCallback();
    return;
  }

  await opts.reload();
  const error = opts.getError();
  if (error) {
    const nativeRedirectError = createNativeRedirectResourceError(error);
    await opts.reset();
    throw nativeRedirectError;
  }

  await opts.handleCallback();
}

type NativeSignInTransportOpts = {
  transport: NativeOAuthHandler;
  signIn: SignInResource;
  clerk: ClerkForNativeOAuth;
  strategy: OAuthStrategy | EnterpriseSSOStrategy;
  identifier?: string;
  oidcPrompt?: string;
  continueSignIn?: boolean;
  enterpriseConnectionId?: string;
  callbackParams: HandleOAuthCallbackParams;
};

export async function authenticateSignInWithNativeTransport(opts: NativeSignInTransportOpts): Promise<void> {
  const redirectUrl = String(await opts.transport.getRedirectUrl());

  if (!opts.signIn.id || !opts.continueSignIn) {
    await opts.signIn.create({
      strategy: opts.strategy,
      identifier: opts.identifier,
      redirectUrl,
      actionCompleteRedirectUrl: redirectUrl,
    });
  }

  if (opts.strategy === 'enterprise_sso') {
    await opts.signIn.prepareFirstFactor({
      strategy: 'enterprise_sso',
      redirectUrl,
      actionCompleteRedirectUrl: redirectUrl,
      oidcPrompt: opts.oidcPrompt,
      enterpriseConnectionId: opts.enterpriseConnectionId,
    });
  }

  const verificationUrl = opts.signIn.firstFactorVerification.externalVerificationRedirectURL;
  if (!verificationUrl) {
    return;
  }

  const { callbackUrl } = await opts.transport.open(verificationUrl);
  await completeNativeOAuthCallback({
    callbackUrl,
    reloadWithNonce: nonce => opts.signIn.reload({ rotatingTokenNonce: nonce }),
    reload: () => opts.signIn.reload(),
    getError: () => opts.signIn.firstFactorVerification.error,
    reset: () => opts.signIn.create({}),
    handleCallback: () => opts.clerk.__internal_handleNativeOAuthCallback(opts.signIn, opts.callbackParams),
  });
}

type NativeSignUpTransportOpts = {
  transport: NativeOAuthHandler;
  signUp: SignUpResource;
  clerk: ClerkForNativeOAuth;
  strategy: OAuthStrategy | EnterpriseSSOStrategy;
  continueSignUp?: boolean;
  unsafeMetadata?: SignUpResource['unsafeMetadata'];
  emailAddress?: string;
  legalAccepted?: boolean;
  oidcPrompt?: string;
  enterpriseConnectionId?: string;
  callbackParams: HandleOAuthCallbackParams;
};

export async function authenticateSignUpWithNativeTransport(opts: NativeSignUpTransportOpts): Promise<void> {
  const redirectUrl = String(await opts.transport.getRedirectUrl());

  const authParams = {
    strategy: opts.strategy,
    redirectUrl,
    actionCompleteRedirectUrl: redirectUrl,
    unsafeMetadata: opts.unsafeMetadata,
    emailAddress: opts.emailAddress,
    legalAccepted: opts.legalAccepted,
    oidcPrompt: opts.oidcPrompt,
    enterpriseConnectionId: opts.enterpriseConnectionId,
  };

  if (opts.continueSignUp && opts.signUp.id) {
    await opts.signUp.update(authParams);
  } else {
    await opts.signUp.create(authParams);
  }

  const verificationUrl = opts.signUp.verifications.externalAccount.externalVerificationRedirectURL;
  if (!verificationUrl) {
    return;
  }

  const { callbackUrl } = await opts.transport.open(verificationUrl);
  await completeNativeOAuthCallback({
    callbackUrl,
    reloadWithNonce: nonce => opts.signUp.reload({ rotatingTokenNonce: nonce }),
    reload: () => opts.signUp.reload(),
    getError: () => opts.signUp.verifications.externalAccount.error,
    reset: () => opts.signUp.create({}),
    handleCallback: () => opts.clerk.__internal_handleNativeOAuthCallback(opts.signUp, opts.callbackParams),
  });
}
