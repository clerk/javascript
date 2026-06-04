import type {
  EnterpriseSSOStrategy,
  ExternalAuthFlow,
  HandleOAuthCallbackParams,
  LoadedClerk,
  OAuthStrategy,
  SignInResource,
  SignUpResource,
} from '@clerk/shared/types';

import type { RouteContextValue } from '../router/RouteContext';

type ExternalAuthStrategy = OAuthStrategy | EnterpriseSSOStrategy;

type RunExternalAuthFlowBaseParams = {
  clerk: LoadedClerk;
  externalAuth: ExternalAuthFlow;
  strategy: ExternalAuthStrategy;
  redirectUrl: string;
  redirectUrlComplete: string;
  navigate: RouteContextValue['navigate'];
  handleRedirectCallbackParams: HandleOAuthCallbackParams;
  oidcPrompt?: string;
  enterpriseConnectionId?: string;
};

type RunExternalSignInFlowParams = RunExternalAuthFlowBaseParams & {
  signIn: SignInResource;
  continueSignIn?: boolean;
  identifier?: string;
};

type RunExternalSignUpFlowParams = RunExternalAuthFlowBaseParams & {
  signUp: SignUpResource;
  continueSignUp?: boolean;
  emailAddress?: string;
  legalAccepted?: boolean;
  unsafeMetadata?: SignUpUnsafeMetadata;
};

function getRotatingTokenNonce(callbackUrl: string): string {
  return new URL(callbackUrl).searchParams.get('rotating_token_nonce') || '';
}

async function prepareRedirectUrl(
  externalAuth: ExternalAuthFlow,
  params: {
    strategy: ExternalAuthStrategy;
    intent: 'sign-in' | 'sign-up';
    redirectUrl: string;
    redirectUrlComplete: string;
  },
): Promise<string> {
  return externalAuth.getRedirectUrl(params);
}

async function completeExternalAuthFlow({
  clerk,
  externalAuth,
  externalVerificationRedirectURL,
  handleRedirectCallbackParams,
  intent,
  navigate,
  redirectUrl,
  reload,
  strategy,
}: {
  clerk: LoadedClerk;
  externalAuth: ExternalAuthFlow;
  externalVerificationRedirectURL: URL;
  handleRedirectCallbackParams: HandleOAuthCallbackParams;
  intent: 'sign-in' | 'sign-up';
  navigate: RouteContextValue['navigate'];
  redirectUrl: string;
  reload: (rotatingTokenNonce: string) => Promise<unknown>;
  strategy: ExternalAuthStrategy;
}) {
  await externalAuth.openExternal(externalVerificationRedirectURL);

  const callbackUrl = await externalAuth.waitForCallback({ strategy, intent, redirectUrl });
  await reload(getRotatingTokenNonce(callbackUrl));

  return clerk.handleRedirectCallback(handleRedirectCallbackParams, navigate);
}

export async function runExternalSignInFlow({
  clerk,
  continueSignIn,
  enterpriseConnectionId,
  externalAuth,
  handleRedirectCallbackParams,
  identifier,
  navigate,
  oidcPrompt,
  redirectUrl,
  redirectUrlComplete,
  signIn,
  strategy,
}: RunExternalSignInFlowParams) {
  const externalRedirectUrl = await prepareRedirectUrl(externalAuth, {
    strategy,
    intent: 'sign-in',
    redirectUrl,
    redirectUrlComplete,
  });

  if (!signIn.id || !continueSignIn) {
    await signIn.create({
      strategy,
      identifier,
      redirectUrl: externalRedirectUrl,
      actionCompleteRedirectUrl: externalRedirectUrl,
      oidcPrompt,
    });
  }

  if (strategy === 'enterprise_sso') {
    await signIn.prepareFirstFactor({
      strategy,
      redirectUrl: externalRedirectUrl,
      actionCompleteRedirectUrl: externalRedirectUrl,
      oidcPrompt,
      enterpriseConnectionId,
    });
  }

  const { status, externalVerificationRedirectURL } = signIn.firstFactorVerification;
  if (status !== 'unverified' || !externalVerificationRedirectURL) {
    throw new Error(`External sign-in did not produce a verification redirect URL.`);
  }

  return completeExternalAuthFlow({
    clerk,
    externalAuth,
    externalVerificationRedirectURL,
    handleRedirectCallbackParams,
    intent: 'sign-in',
    navigate,
    redirectUrl: externalRedirectUrl,
    reload: rotatingTokenNonce => signIn.reload({ rotatingTokenNonce }),
    strategy,
  });
}

export async function runExternalSignUpFlow({
  clerk,
  continueSignUp,
  emailAddress,
  enterpriseConnectionId,
  externalAuth,
  handleRedirectCallbackParams,
  legalAccepted,
  navigate,
  oidcPrompt,
  redirectUrl,
  redirectUrlComplete,
  signUp,
  strategy,
  unsafeMetadata,
}: RunExternalSignUpFlowParams) {
  const externalRedirectUrl = await prepareRedirectUrl(externalAuth, {
    strategy,
    intent: 'sign-up',
    redirectUrl,
    redirectUrlComplete,
  });

  const authParams = {
    strategy,
    redirectUrl: externalRedirectUrl,
    actionCompleteRedirectUrl: externalRedirectUrl,
    unsafeMetadata,
    emailAddress,
    legalAccepted,
    oidcPrompt,
    enterpriseConnectionId,
  };

  await (continueSignUp && signUp.id ? signUp.update(authParams) : signUp.create(authParams));

  const { status, externalVerificationRedirectURL } = signUp.verifications.externalAccount;
  if (status !== 'unverified' || !externalVerificationRedirectURL) {
    throw new Error(`External sign-up did not produce a verification redirect URL.`);
  }

  return completeExternalAuthFlow({
    clerk,
    externalAuth,
    externalVerificationRedirectURL,
    handleRedirectCallbackParams,
    intent: 'sign-up',
    navigate,
    redirectUrl: externalRedirectUrl,
    reload: rotatingTokenNonce => signUp.reload({ rotatingTokenNonce }),
    strategy,
  });
}
