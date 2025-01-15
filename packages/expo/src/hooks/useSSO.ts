import { useSignIn, useSignUp } from '@clerk/clerk-react';
import type { EnterpriseSSOStrategy, OAuthStrategy, SetActive, SignInResource, SignUpResource } from '@clerk/types';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { errorThrower } from '../utils/errors';

export type UseSSOParams = {
  strategy: OAuthStrategy | EnterpriseSSOStrategy;
  unsafeMetadata?: SignUpUnsafeMetadata;
  redirectUrl?: string;
};

export type StartSSOFlowParams = {
  identifier?: string;
  unsafeMetadata?: SignUpUnsafeMetadata;
  redirectUrl?: string;
};

export type StartSSOFlowReturnType = {
  /**
   * Session ID created upon sign-in completion, or null if incomplete.
   * If incomplete, use signIn or signUp for next steps like MFA.
   */
  createdSessionId: string | null;
  setActive?: SetActive;
  signIn?: SignInResource;
  signUp?: SignUpResource;
  authSessionResult?: WebBrowser.WebBrowserAuthSessionResult;
};

export function useSSO(useSSOParams: UseSSOParams) {
  const { signIn, setActive, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, isLoaded: isSignUpLoaded } = useSignUp();

  async function startSSOFlow(startSSOFlowParams: StartSSOFlowParams = {}): Promise<StartSSOFlowReturnType> {
    if (!isSignInLoaded || !isSignUpLoaded) {
      return {
        createdSessionId: null,
        signIn,
        signUp,
        setActive,
      };
    }

    let createdSessionId = signIn.createdSessionId;

    const redirectUrl =
      startSSOFlowParams?.redirectUrl ||
      useSSOParams.redirectUrl ||
      AuthSession.makeRedirectUri({
        path: 'sso-native-callback',
      });

    await signIn.create({
      strategy: useSSOParams.strategy,
      redirectUrl,
      identifier: startSSOFlowParams.identifier,
    });

    const { externalVerificationRedirectURL } = signIn.firstFactorVerification;
    if (!externalVerificationRedirectURL) {
      return errorThrower.throw('Missing external verification redirect URL for SSO flow');
    }

    const authSessionResult = await WebBrowser.openAuthSessionAsync(externalVerificationRedirectURL.toString());
    if (authSessionResult.type !== 'success' || !authSessionResult.url) {
      return {
        authSessionResult,
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
        unsafeMetadata: startSSOFlowParams?.unsafeMetadata || useSSOParams.unsafeMetadata,
      });
      createdSessionId = signUp.createdSessionId;
    }

    return {
      authSessionResult,
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
