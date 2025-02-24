import { useSignIn, useSignUp } from '@clerk/clerk-react';
import type { EnterpriseSSOStrategy, OAuthStrategy, SetActive, SignInResource, SignUpResource } from '@clerk/types';
import { Linking } from 'react-native';

import { errorThrower } from '../utils/errors';

export type StartSSOFlowParams = {
  redirectUrl?: string;
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
  authSessionResult: { type: 'success' | 'cancel' | 'dismiss'; url?: string } | null;
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
        authSessionResult: null,
        signIn,
        signUp,
        setActive,
      };
    }

    const { strategy, unsafeMetadata } = startSSOFlowParams ?? {};

    /**
     * Creates a redirect URL based on the application platform
     * It must be whitelisted, either via Clerk Dashboard, or BAPI, in order
     * to include the `rotating_token_nonce` on SSO callback
     * @ref https://clerk.com/docs/reference/backend-api/tag/Redirect-URLs#operation/CreateRedirectURL
     */
    const redirectUrl = startSSOFlowParams.redirectUrl ?? '';

    await signIn.create({
      strategy,
      redirectUrl,
      ...(startSSOFlowParams.strategy === 'enterprise_sso' ? { identifier: startSSOFlowParams.identifier } : {}),
    });

    const { externalVerificationRedirectURL } = signIn.firstFactorVerification;
    if (!externalVerificationRedirectURL) {
      return errorThrower.throw('Missing external verification redirect URL for SSO flow');
    }

    const authSessionResult = await new Promise<{ type: 'success' | 'cancel' | 'dismiss'; url?: string }>(resolve => {
      const subscription = Linking.addEventListener('url', (event: { url: string }) => {
        subscription.remove();
        resolve({
          type: 'success',
          url: event.url,
        });
      });

      Linking.openURL(externalVerificationRedirectURL.toString()).catch(() => {
        subscription.remove();
        resolve({
          type: 'cancel',
        });
      });
    });
    if (authSessionResult.type !== 'success' || !authSessionResult.url) {
      return {
        createdSessionId: null,
        setActive,
        signIn,
        signUp,
        authSessionResult,
      };
    }

    const params = new URL(authSessionResult.url).searchParams;
    const rotatingTokenNonce = params.get('rotating_token_nonce') ?? '';
    await signIn.reload({ rotatingTokenNonce });

    const userNeedsToBeCreated = signIn.firstFactorVerification.status === 'transferable';
    if (userNeedsToBeCreated) {
      await signUp.create({
        transfer: true,
        unsafeMetadata,
      });
    }

    return {
      createdSessionId: signUp.createdSessionId ?? signIn.createdSessionId,
      setActive,
      signIn,
      signUp,
      authSessionResult,
    };
  }

  return {
    startSSOFlow,
  };
}
