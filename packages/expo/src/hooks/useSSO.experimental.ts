import { useClerk, useSignIn, useSignUp } from '@clerk/react';
import type {
  EnterpriseSSOStrategy,
  OAuthStrategy,
  SetActive,
  SignInFutureResource,
  SignUpFutureResource,
} from '@clerk/shared/types';
import type * as WebBrowser from 'expo-web-browser';

import { errorThrower } from '../utils/errors';
import { loadSSODependencies } from './ssoDependencies';

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
  signIn?: SignInFutureResource | null;
  signUp?: SignUpFutureResource | null;
};

function getSSOErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }

  return 'An unknown SSO error occurred';
}

function assertNoSSOError(result: { error: unknown }): void {
  if (result.error) {
    return errorThrower.throw(getSSOErrorMessage(result.error));
  }
}

export function useSSO() {
  const { client, loaded, setActive } = useClerk();
  const { signIn, fetchStatus: signInFetchStatus } = useSignIn();
  const { signUp, fetchStatus: signUpFetchStatus } = useSignUp();

  async function startSSOFlow(startSSOFlowParams: StartSSOFlowParams): Promise<StartSSOFlowReturnType> {
    if (
      !loaded ||
      !client ||
      !signIn ||
      !signUp ||
      signInFetchStatus === 'fetching' ||
      signUpFetchStatus === 'fetching'
    ) {
      return {
        createdSessionId: null,
        authSessionResult: null,
        signIn,
        signUp,
        setActive,
      };
    }

    const { AuthSession, WebBrowser: WebBrowserModule } = loadSSODependencies();

    const { strategy, unsafeMetadata, authSessionOptions } = startSSOFlowParams ?? {};

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

    assertNoSSOError(
      await signIn.create({
        strategy,
        redirectUrl,
        ...(startSSOFlowParams.strategy === 'enterprise_sso' ? { identifier: startSSOFlowParams.identifier } : {}),
      }),
    );

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
    await client.signIn.reload({ rotatingTokenNonce });

    const userNeedsToBeCreated = signIn.firstFactorVerification.status === 'transferable';
    if (userNeedsToBeCreated) {
      assertNoSSOError(
        await signUp.create({
          transfer: true,
          unsafeMetadata,
        }),
      );
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
