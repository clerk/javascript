import { useClerk, useSignIn, useSignUp } from '@clerk/react';
import type {
  EnterpriseSSOStrategy,
  OAuthStrategy,
  SignInFutureResource,
  SignUpFutureResource,
} from '@clerk/shared/types';
import type * as WebBrowser from 'expo-web-browser';

import { errorThrower } from '../utils/errors';
import { loadSSODependencies } from './ssoDependencies';

/**
 * Options for starting an OAuth or enterprise SSO flow.
 */
export type StartSSOFlowParams = {
  /**
   * Native URL that Clerk redirects to after the browser authentication session completes.
   * Defaults to an Expo AuthSession URL with the `sso-callback` path.
   */
  redirectUrl?: string;
  /**
   * Metadata to attach to the user when the SSO flow creates a new account.
   */
  unsafeMetadata?: SignUpUnsafeMetadata;
  /**
   * Options forwarded to `expo-web-browser` when opening the authentication session.
   */
  authSessionOptions?: Pick<WebBrowser.AuthSessionOpenOptions, 'showInRecents'>;
} & (
  | {
      /**
       * OAuth strategy to use for the SSO flow.
       */
      strategy: OAuthStrategy;
    }
  | {
      /**
       * Enterprise SSO strategy.
       */
      strategy: EnterpriseSSOStrategy;
      /**
       * Identifier used to discover the enterprise connection.
       */
      identifier: string;
    }
);

/**
 * Result returned after an SSO attempt finishes.
 */
export type StartSSOFlowReturnType = {
  /**
   * ID of the newly created session, or `null` when no new session was created.
   */
  createdSessionId: string | null;
  /**
   * Result returned by the browser authentication session, or `null` when the flow did not start.
   */
  authSessionResult: WebBrowser.WebBrowserAuthSessionResult | null;
  /**
   * Current future sign-in resource.
   */
  signIn?: SignInFutureResource | null;
  /**
   * Current future sign-up resource.
   */
  signUp?: SignUpFutureResource | null;
};

/**
 * Helpers returned by {@link useSSO}.
 */
export type UseSSOReturn = {
  /**
   * Starts an OAuth or enterprise SSO flow and activates the completed session.
   *
   * @param params - Options for the SSO flow.
   * @returns The SSO result and current future resources.
   * @throws A structured Clerk error when a future resource operation fails.
   */
  startSSOFlow: (params: StartSSOFlowParams) => Promise<StartSSOFlowReturnType>;
};

/**
 * Returns a helper for authenticating users with OAuth or enterprise SSO in an Expo app.
 *
 * @returns An object containing `startSSOFlow`.
 * @throws The returned `startSSOFlow` function throws when an SSO dependency cannot be loaded, the redirect response
 * is invalid, or a Clerk future resource operation fails.
 *
 * @example
 * ### Start a Google OAuth flow
 *
 * ```tsx
 * const { startSSOFlow } = useSSO();
 * const { createdSessionId } = await startSSOFlow({
 *   strategy: 'oauth_google',
 * });
 * ```
 */
export function useSSO(): UseSSOReturn {
  const { client, setActive } = useClerk();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();

  async function startSSOFlow(startSSOFlowParams: StartSSOFlowParams): Promise<StartSSOFlowReturnType> {
    if (!client || !signIn || !signUp) {
      return {
        createdSessionId: null,
        authSessionResult: null,
        signIn,
        signUp,
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

    const { error: signInError } = await signIn.create({
      strategy,
      redirectUrl,
      ...(startSSOFlowParams.strategy === 'enterprise_sso' ? { identifier: startSSOFlowParams.identifier } : {}),
    });
    if (signInError) {
      throw signInError;
    }

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
      const { error: signUpError } = await signUp.create({
        transfer: true,
        unsafeMetadata,
      });
      if (signUpError) {
        throw signUpError;
      }
    }

    const createdSessionId = signUp.createdSessionId ?? signIn.createdSessionId;
    if (signUp.createdSessionId) {
      const { error } = await signUp.finalize();
      if (error) {
        throw error;
      }
    } else if (signIn.createdSessionId) {
      const { error } = await signIn.finalize();
      if (error) {
        throw error;
      }
    } else {
      const existingSessionId = signIn.existingSession?.sessionId ?? signUp.existingSession?.sessionId;
      if (existingSessionId) {
        await setActive({ session: existingSessionId });
      }
    }

    return {
      createdSessionId,
      signIn,
      signUp,
      authSessionResult,
    };
  }

  return {
    startSSOFlow,
  };
}
