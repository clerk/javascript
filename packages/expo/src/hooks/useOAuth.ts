import { useSignIn, useSignUp } from '@clerk/react/legacy';
import type { OAuthStrategy, SelectSessionHook, SetActive, SignInResource, SignUpResource } from '@clerk/shared/types';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

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
  selectSession?: SelectSessionHook;
  /** @deprecated Use `selectSession` instead. */
  setActive?: SetActive;
  signIn?: SignInResource;
  signUp?: SignUpResource;
  authSessionResult?: WebBrowser.WebBrowserAuthSessionResult;
};

/**
 * @deprecated Use `useSSO()` instead.
 */
export function useOAuth(useOAuthParams: UseOAuthFlowParams) {
  const { strategy } = useOAuthParams || {};
  if (!strategy) {
    return errorThrower.throw('Missing oauth strategy');
  }

  const { signIn, selectSession, setActive, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, isLoaded: isSignUpLoaded } = useSignUp();

  async function startOAuthFlow(startOAuthFlowParams?: StartOAuthFlowParams): Promise<StartOAuthFlowReturnType> {
    if (!isSignInLoaded || !isSignUpLoaded) {
      return {
        createdSessionId: '',
        signIn,
        signUp,
        selectSession,
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
      startOAuthFlowParams?.redirectUrl ||
      useOAuthParams.redirectUrl ||
      AuthSession.makeRedirectUri({
        path: 'oauth-native-callback',
      });

    await signIn.create({ strategy, redirectUrl: oauthRedirectUrl });

    const { externalVerificationRedirectURL } = signIn.firstFactorVerification;

    const authSessionResult = await WebBrowser.openAuthSessionAsync(
      // @ts-ignore
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
        selectSession,
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
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      createdSessionId = signIn.createdSessionId!;
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
      selectSession,
      setActive,
      signIn,
      signUp,
    };
  }

  return {
    startOAuthFlow,
  };
}
