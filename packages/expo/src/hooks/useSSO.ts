import { useClerk, useSignIn } from '@clerk/react';
import { isClerkAPIResponseError } from '@clerk/shared/error';
import type { OAuthStrategy, EnterpriseSSOStrategy } from '@clerk/shared/types';
import * as SecureStore from 'expo-secure-store';
import type * as WebBrowser from 'expo-web-browser';

import { CLERK_CLIENT_JWT_KEY } from '../constants';
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
};

export function useSSO() {
  const clerk = useClerk();
  const { signIn } = useSignIn();

  async function startSSOFlow(startSSOFlowParams: StartSSOFlowParams): Promise<StartSSOFlowReturnType> {
    if (!signIn || !clerk.client) {
      return {
        createdSessionId: null,
        authSessionResult: null,
      };
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-imports -- dynamic import of optional dependency
    let AuthSession: typeof import('expo-auth-session');
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports -- dynamic import of optional dependency
    let WebBrowserModule: typeof import('expo-web-browser');
    try {
      [AuthSession, WebBrowserModule] = await Promise.all([import('expo-auth-session'), import('expo-web-browser')]);
    } catch {
      return errorThrower.throw(
        'expo-auth-session and expo-web-browser are required for SSO. ' +
          'Install them: npx expo install expo-auth-session expo-web-browser',
      );
    }

    const { strategy, authSessionOptions } = startSSOFlowParams ?? {};

    const redirectUrl =
      startSSOFlowParams.redirectUrl ??
      AuthSession.makeRedirectUri({
        path: 'sso-callback',
      });

    const createParams = {
      strategy,
      redirectUrl,
      ...(startSSOFlowParams.strategy === 'enterprise_sso' ? { identifier: startSSOFlowParams.identifier } : {}),
    };

    // Create the sign-in attempt. If a stale session exists (e.g. JWT persisted
    // in SecureStore after an incomplete sign-out), clear the token and retry.
    // The error can surface as either a thrown exception (client-side "already signed in"
    // guard) or a returned { error } (FAPI "session_exists" response).
    try {
      const createResult = await signIn.create(createParams);
      if (createResult.error) {
        throw createResult.error;
      }
    } catch (err) {
      const isSessionExists = isClerkAPIResponseError(err) && err.errors.some(e => e.code === 'session_exists');
      const isAlreadySignedIn = err instanceof Error && err.message?.includes('already signed in');

      if (isSessionExists || isAlreadySignedIn) {
        await SecureStore.deleteItemAsync(CLERK_CLIENT_JWT_KEY);
        const retryResult = await signIn.create(createParams);
        if (retryResult.error) {
          throw retryResult.error;
        }
      } else {
        throw err;
      }
    }

    const { externalVerificationRedirectURL } = signIn.firstFactorVerification;
    if (!externalVerificationRedirectURL) {
      return errorThrower.throw('Missing external verification redirect URL for SSO flow');
    }

    // Open the in-app browser for the OAuth/SSO provider.
    let authSessionResult: WebBrowser.WebBrowserAuthSessionResult;
    try {
      authSessionResult = await WebBrowserModule.openAuthSessionAsync(
        externalVerificationRedirectURL.toString(),
        redirectUrl,
        authSessionOptions,
      );
    } finally {
      // Dismiss the browser to prevent it from lingering in the background,
      // which can cause subsequent SSO attempts to fail or appear frozen.
      try {
        await WebBrowserModule.dismissBrowser();
      } catch {
        // Already dismissed (e.g. iOS ASWebAuthenticationSession auto-dismisses on success)
      }
    }

    if (authSessionResult.type !== 'success' || !authSessionResult.url) {
      return {
        createdSessionId: null,
        authSessionResult,
      };
    }

    const callbackParams = new URL(authSessionResult.url).searchParams;
    const createdSessionId = callbackParams.get('created_session_id');
    const rotatingTokenNonce = callbackParams.get('rotating_token_nonce') ?? '';

    // Pass the nonce to FAPI to verify the OAuth callback and update the client
    // with the newly created session. The FAPI response populates the client's
    // session list as a side effect, which is required for setActive to work.
    await clerk.client.signIn.reload({ rotatingTokenNonce });

    if (createdSessionId) {
      await clerk.setActive({ session: createdSessionId });
    }

    return {
      createdSessionId,
      authSessionResult,
    };
  }

  return {
    startSSOFlow,
  };
}
