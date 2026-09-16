import { useSignIn, useSignUp } from '@clerk/react/legacy';
import type {
  EnterpriseSSOStrategy,
  OAuthStrategy,
  SetActive,
  SignInResource,
  SignUpResource,
} from '@clerk/shared/types';
import type * as WebBrowser from 'expo-web-browser';

import { errorThrower } from '../utils/errors';
import { loadSSODependencies } from './ssoDependencies';

export type StartSSOFlowParams = {
  redirectUrl?: string;
  oidcPrompt?: string;
  oidcLoginHint?: string;
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

/**
 * Returns a helper for authenticating users with OAuth or enterprise SSO in an Expo app.
 *
 * For Core 3 custom flows, use the experimental `useSSO()` hook from `@clerk/expo/experimental`. It uses future auth
 * resources and activates completed sessions automatically.
 *
 * @example
 * ### Start a Google OAuth flow using Core 3
 *
 * ```tsx
 * import { useSSO } from '@clerk/expo/experimental';
 *
 * const { startSSOFlow } = useSSO();
 *
 * await startSSOFlow({
 *   strategy: 'oauth_google',
 * });
 * ```
 */
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

    const { AuthSession, WebBrowser: WebBrowserModule } = loadSSODependencies();

    const { strategy, oidcPrompt, oidcLoginHint, unsafeMetadata, authSessionOptions } = startSSOFlowParams ?? {};

    /**
     * Creates a redirect URL based on the application platform
     * It must be whitelisted, either via Clerk Dashboard, or BAPI, in order
     * to include the `rotating_token_nonce` on SSO callback
     * @ref https://clerk.com/docs/reference/backend-api/tag/redirect-urls/POST/redirect_urls
     */
    const redirectUrl =
      startSSOFlowParams.redirectUrl ??
      AuthSession.makeRedirectUri({
        path: 'sso-callback',
      });

    await signIn.create({
      strategy,
      redirectUrl,
      oidcPrompt,
      oidcLoginHint,
      ...(startSSOFlowParams.strategy === 'enterprise_sso' ? { identifier: startSSOFlowParams.identifier } : {}),
    });

    const { externalVerificationRedirectURL } = signIn.firstFactorVerification;
    if (!externalVerificationRedirectURL) {
      return errorThrower.throw('Missing external verification redirect URL for SSO flow');
    }

    const authSessionResult = await WebBrowserModule.openAuthSessionAsync(
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
