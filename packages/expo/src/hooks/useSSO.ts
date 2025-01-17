import { useSignIn, useSignUp } from '@clerk/clerk-react';
import type { EnterpriseSSOStrategy, OAuthStrategy, SetActive, SignInResource, SignUpResource } from '@clerk/types';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { errorThrower } from '../utils/errors';

export type StartSSOFlowParams = {
  unsafeMetadata?: SignUpUnsafeMetadata;
} & (
  | {
      strategy: OAuthStrategy;
    }
  | {
      strategy: EnterpriseSSOStrategy;
      identifier: string;
    }
);

export type StartSSOFlowReturnType = {
  createdSessionId: string | null;
  setActive?: SetActive;
  signIn?: SignInResource;
  signUp?: SignUpResource;
};

export function useSSO() {
  const { signIn, setActive, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, isLoaded: isSignUpLoaded } = useSignUp();

  async function startSSOFlow(startSSOFlowParams: StartSSOFlowParams): Promise<StartSSOFlowReturnType> {
    if (!isSignInLoaded || !isSignUpLoaded) {
      return {
        createdSessionId: null,
        signIn,
        signUp,
        setActive,
      };
    }

    const { strategy, unsafeMetadata } = startSSOFlowParams ?? {};
    let createdSessionId = signIn.createdSessionId;

    // Used to handle redirection back to the mobile application, however deep linking it not applied
    // We only leverage it to extract the `rotating_token_nonce` query param
    // It's up to the consumer to navigate once `createdSessionId` gets defined
    const redirectUrl = AuthSession.makeRedirectUri({
      path: 'sso-callback',
    });

    await signIn.create({
      strategy,
      redirectUrl,
      ...(startSSOFlowParams.strategy === 'enterprise_sso' ? { identifier: startSSOFlowParams.identifier } : {}),
    });

    const { externalVerificationRedirectURL } = signIn.firstFactorVerification;
    if (!externalVerificationRedirectURL) {
      return errorThrower.throw('Missing external verification redirect URL for SSO flow');
    }

    const authSessionResult = await WebBrowser.openAuthSessionAsync(externalVerificationRedirectURL.toString());
    if (authSessionResult.type !== 'success' || !authSessionResult.url) {
      return {
        createdSessionId,
        setActive,
        signIn,
        signUp,
      };
    }

    const params = new URL(authSessionResult.url).searchParams;
    const rotatingTokenNonce = params.get('rotating_token_nonce') ?? '';
    await signIn.reload({ rotatingTokenNonce });

    if (signIn.firstFactorVerification.status === 'transferable') {
      await signUp.create({
        transfer: true,
        unsafeMetadata,
      });
      createdSessionId = signUp.createdSessionId;
    }

    return {
      createdSessionId,
      setActive,
      signIn,
      signUp,
    };
  }

  return {
    startSSOFlow,
  };
}
