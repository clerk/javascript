import { useSignIn, useSignUp } from '@clerk/react/legacy';
import type {
  EnterpriseSSOStrategy,
  OAuthStrategy,
  SetActive,
  SignInResource,
  SignUpResource,
} from '@clerk/shared/types';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { errorThrower } from '../utils/errors';

export type StartSSOFlowParams = {
  redirectUrl?: string;
  unsafeMetadata?: SignUpUnsafeMetadata;
  authSessionOptions?: Pick<WebBrowser.AuthSessionOpenOptions, 'showInRecents'>;
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
  authSessionResult: WebBrowser.WebBrowserAuthSessionResult | null;
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

    const { strategy, unsafeMetadata, authSessionOptions } = startSSOFlowParams ?? {};

    /**
     * Creates a redirect URL based on the application platform
     * It must be whitelisted, either via Clerk Dashboard, or BAPI, in order
     * to include the `rotating_token_nonce` on SSO callback
     * @ref https://clerk.com/docs/reference/backend-api/tag/Redirect-URLs#operation/CreateRedirectURL
     */
    const redirectUrl =
      startSSOFlowParams.redirectUrl ??
      AuthSession.makeRedirectUri({
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

    const authSessionResult = await WebBrowser.openAuthSessionAsync(
      externalVerificationRedirectURL.toString(),
      redirectUrl,
      authSessionOptions,
    );
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
