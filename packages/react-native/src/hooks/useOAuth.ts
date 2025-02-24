import { useSignIn, useSignUp } from '@clerk/clerk-react';
import type { OAuthStrategy, SetActive, SignInResource, SignUpResource } from '@clerk/types';
import { Linking } from 'react-native';

import { errorThrower } from '../utils/errors';

export type UseOAuthFlowParams = {
  strategy: OAuthStrategy;
  redirectUrl?: string;
  unsafeMetadata?: SignUpUnsafeMetadata;
};

export type StartOAuthFlowParams = {
  redirectUrl?: string;
  unsafeMetadata?: SignUpUnsafeMetadata;
};

export type StartOAuthFlowReturnType = {
  createdSessionId: string;
  setActive?: SetActive;
  signIn?: SignInResource;
  signUp?: SignUpResource;
  authSessionResult?: { type: 'success' | 'cancel' | 'dismiss'; url?: string };
};

/**
 * @deprecated Use `useSSO` instead
 */
export function useOAuth(useOAuthParams: UseOAuthFlowParams) {
  const { strategy } = useOAuthParams || {};
  const { signIn, setActive, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, isLoaded: isSignUpLoaded } = useSignUp();

  if (!strategy) {
    return errorThrower.throw('Missing oauth strategy');
  }

  async function startOAuthFlow(startOAuthFlowParams?: StartOAuthFlowParams): Promise<StartOAuthFlowReturnType> {
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
    const oauthRedirectUrl = startOAuthFlowParams?.redirectUrl || useOAuthParams.redirectUrl || '';

    await signIn.create({ strategy, redirectUrl: oauthRedirectUrl });

    const { externalVerificationRedirectURL } = signIn.firstFactorVerification;

    const authSessionResult = await new Promise<{ type: 'success' | 'cancel' | 'dismiss'; url?: string }>(resolve => {
      const subscription = Linking.addEventListener('url', (event: { url: string }) => {
        subscription.remove();
        resolve({
          type: 'success',
          url: event.url,
        });
      });

      // Use the system browser instead of WebView for better security and UX
      Linking.openURL((externalVerificationRedirectURL || '').toString()).catch(() => {
        subscription.remove();
        resolve({
          type: 'cancel',
        });
      });
    });

    const { type, url } = authSessionResult;

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

    const params = new URL(url || '').searchParams;

    const rotatingTokenNonce = params.get('rotating_token_nonce') || '';
    await signIn.reload({ rotatingTokenNonce });

    const { status, firstFactorVerification } = signIn;

    let createdSessionId = '';

    if (status === 'complete') {
      createdSessionId = signIn.createdSessionId || '';
    } else if (firstFactorVerification.status === 'transferable') {
      await signUp.create({
        transfer: true,
        unsafeMetadata: startOAuthFlowParams?.unsafeMetadata || useOAuthParams.unsafeMetadata,
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
    startOAuthFlow,
  };
}
