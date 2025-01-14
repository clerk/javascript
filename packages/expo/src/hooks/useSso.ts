import { useSignIn, useSignUp } from '@clerk/clerk-react';
import type { EnterpriseSSOStrategy, OAuthStrategy, SetActive, SignInResource, SignUpResource } from '@clerk/types';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { errorThrower } from '../utils/errors';

export type UseSSOParams = {
  strategy: OAuthStrategy | EnterpriseSSOStrategy;
  redirectUrl?: string;
  unsafeMetadata?: SignUpUnsafeMetadata;
};

export type StartSSOParams = {
  redirectUrl?: string;
  unsafeMetadata?: SignUpUnsafeMetadata;
  identifier?: string;
};

export type StartSSOFlowReturnType = {
  createdSessionId: string;
  setActive?: SetActive;
  signIn?: SignInResource;
  signUp?: SignUpResource;
  authSessionResult?: WebBrowser.WebBrowserAuthSessionResult;
};

export function useSSO(useSSOParams: UseSSOParams) {
  const { strategy } = useSSOParams || {};
  if (!strategy) {
    return errorThrower.throw('Missing strategy');
  }

  const { signIn, setActive, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, isLoaded: isSignUpLoaded } = useSignUp();

  async function startFlow(startSSOFlowParams?: StartSSOParams): Promise<StartSSOFlowReturnType> {
    if (!isSignInLoaded || !isSignUpLoaded) {
      return {
        createdSessionId: '',
        signIn,
        signUp,
        setActive,
      };
    }

    // Create a redirect url for the current platform and environment.
    //
    // This redirect URL needs to be whitelisted for your Clerk production instance via
    // https://clerk.com/docs/reference/backend-api/tag/Redirect-URLs#operation/CreateRedirectURL
    //
    // For more information go to:
    // https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionmakeredirecturi
    const oauthRedirectUrl =
      startSSOFlowParams?.redirectUrl ||
      useSSOParams.redirectUrl ||
      AuthSession.makeRedirectUri({
        path: 'sso-native-callback',
      });

    await signIn.create({ strategy, redirectUrl: oauthRedirectUrl, identifier: startSSOFlowParams?.identifier });

    const { externalVerificationRedirectURL } = signIn.firstFactorVerification;

    if (!externalVerificationRedirectURL) {
      return errorThrower.throw('Missing external verification redirect URL for SSO flow');
    }

    const authSessionResult = await WebBrowser.openAuthSessionAsync(
      externalVerificationRedirectURL.toString(),
      oauthRedirectUrl,
    );

    // @ts-expect-error
    const { type, url } = authSessionResult || {};

    // TODO: Check all the possible AuthSession results
    // https://docs.expo.dev/versions/latest/sdk/auth-session/#returns-7
    if (type !== 'success') {
      return {
        authSessionResult,
        createdSessionId: '',
        setActive,
        signIn,
        signUp,
      };
    }

    const params = new URL(url).searchParams;

    const rotatingTokenNonce = params.get('rotating_token_nonce') || '';
    await signIn.reload({ rotatingTokenNonce });

    const { status, firstFactorVerification } = signIn;

    let createdSessionId = '';

    if (status === 'complete') {
      createdSessionId = signIn.createdSessionId!;
    } else if (firstFactorVerification.status === 'transferable') {
      await signUp.create({
        transfer: true,
        unsafeMetadata: startSSOFlowParams?.unsafeMetadata || useSSOParams.unsafeMetadata,
      });
      createdSessionId = signUp.createdSessionId || '';
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
    startFlow,
  };
}
