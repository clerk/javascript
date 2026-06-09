import type {
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
  throwIfNativeRedirectCallbackHasError(callbackUrl);

  const nonce = getRotatingTokenNonceFromNativeRedirectCallback(callbackUrl);
  if (nonce) {
    await opts.signIn.reload({ rotatingTokenNonce: nonce });
    await opts.clerk.__internal_handleNativeOAuthCallback(opts.signIn, opts.callbackParams);
    return;
  }

  await opts.signIn.reload();
  const error = opts.signIn.firstFactorVerification.error;
  if (error) {
    const nativeRedirectError = createNativeRedirectResourceError(error);
    await opts.signIn.create({});
    throw nativeRedirectError;
  }

  await opts.clerk.__internal_handleNativeOAuthCallback(opts.signIn, opts.callbackParams);
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
  throwIfNativeRedirectCallbackHasError(callbackUrl);

  const nonce = getRotatingTokenNonceFromNativeRedirectCallback(callbackUrl);
  if (nonce) {
    await opts.signUp.reload({ rotatingTokenNonce: nonce });
    await opts.clerk.__internal_handleNativeOAuthCallback(opts.signUp, opts.callbackParams);
    return;
  }

  await opts.signUp.reload();
  const error = opts.signUp.verifications.externalAccount.error;
  if (error) {
    const nativeRedirectError = createNativeRedirectResourceError(error);
    await opts.signUp.create({});
    throw nativeRedirectError;
  }

  await opts.clerk.__internal_handleNativeOAuthCallback(opts.signUp, opts.callbackParams);
}
