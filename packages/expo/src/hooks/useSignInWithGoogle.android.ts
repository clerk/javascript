import { useSignIn, useSignUp } from '@clerk/clerk-react';
import type { SetActive, SignInResource, SignUpResource } from '@clerk/types';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

export type StartGoogleAuthenticationFlowParams = {
  unsafeMetadata?: SignUpUnsafeMetadata;
  redirectUrl?: string;
};

export type StartGoogleAuthenticationFlowReturnType = {
  createdSessionId: string | null;
  setActive?: SetActive;
  signIn?: SignInResource;
  signUp?: SignUpResource;
};

/**
 * Hook for Google Authentication on Android using web-based OAuth flow.
 *
 * This hook provides a simplified way to authenticate users with their Google account
 * using Clerk's OAuth flow through a web browser. The authentication flow automatically
 * handles the OAuth redirect with Clerk's backend and manages the transfer flow
 * between sign-in and sign-up.
 *
 * @example
 * ```tsx
 * import { useSignInWithGoogle } from '@clerk/clerk-expo';
 * import { Button } from 'react-native';
 *
 * function GoogleSignInButton() {
 *   const { startGoogleAuthenticationFlow } = useSignInWithGoogle();
 *
 *   const onPress = async () => {
 *     try {
 *       const { createdSessionId, setActive } = await startGoogleAuthenticationFlow();
 *
 *       if (createdSessionId && setActive) {
 *         await setActive({ session: createdSessionId });
 *       }
 *     } catch (err) {
 *       console.error('Google Authentication error:', err);
 *     }
 *   };
 *
 *   return <Button title="Sign in with Google" onPress={onPress} />;
 * }
 * ```
 *
 * @platform Android - This is the Android-specific implementation using web-based OAuth
 *
 * @returns An object containing the `startGoogleAuthenticationFlow` function
 */
export function useSignInWithGoogle() {
  const { signIn, setActive, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, isLoaded: isSignUpLoaded } = useSignUp();

  async function startGoogleAuthenticationFlow(
    startGoogleAuthenticationFlowParams?: StartGoogleAuthenticationFlowParams,
  ): Promise<StartGoogleAuthenticationFlowReturnType> {
    if (!isSignInLoaded || !isSignUpLoaded) {
      return {
        createdSessionId: null,
        signIn,
        signUp,
        setActive,
      };
    }

    // Create a redirect url for the current platform and environment.
    // This redirect URL needs to be whitelisted for your Clerk production instance.
    // For more information: https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionmakeredirecturi
    const oauthRedirectUrl =
      startGoogleAuthenticationFlowParams?.redirectUrl ||
      AuthSession.makeRedirectUri({
        path: 'oauth-native-callback',
      });

    console.log('[useSignInWithGoogle] Android: Starting OAuth flow');
    console.log('[useSignInWithGoogle] Android: Redirect URL:', oauthRedirectUrl);

    // Create a sign-in attempt with the Google OAuth strategy
    await signIn.create({
      strategy: 'oauth_google',
      redirectUrl: oauthRedirectUrl,
    });

    const { externalVerificationRedirectURL } = signIn.firstFactorVerification;

    if (!externalVerificationRedirectURL) {
      throw new Error('No external verification redirect URL received from Clerk');
    }

    console.log('[useSignInWithGoogle] Android: Opening browser for OAuth');

    // Open the OAuth flow in a web browser
    const authSessionResult = await WebBrowser.openAuthSessionAsync(
      externalVerificationRedirectURL.toString(),
      oauthRedirectUrl,
    );

    console.log('[useSignInWithGoogle] Android: Auth session result:', authSessionResult.type);

    // Handle different auth session results
    if (authSessionResult.type !== 'success') {
      // User canceled or something else happened
      return {
        createdSessionId: null,
        setActive,
        signIn,
        signUp,
      };
    }

    // Extract the rotating token nonce from the callback URL
    const { url } = authSessionResult;
    const params = new URL(url).searchParams;
    const rotatingTokenNonce = params.get('rotating_token_nonce') || '';

    console.log('[useSignInWithGoogle] Android: Got rotating token nonce');

    // Reload the sign-in with the nonce to complete the flow
    await signIn.reload({ rotatingTokenNonce });

    const { status, firstFactorVerification } = signIn;

    let createdSessionId: string | null = null;

    if (status === 'complete') {
      // Sign-in complete - user exists
      createdSessionId = signIn.createdSessionId ?? null;
    } else if (firstFactorVerification.status === 'transferable') {
      // User doesn't exist - create a new SignUp with transfer
      await signUp.create({
        transfer: true,
        unsafeMetadata: startGoogleAuthenticationFlowParams?.unsafeMetadata,
      });
      createdSessionId = signUp.createdSessionId ?? null;
    }

    return {
      createdSessionId,
      setActive,
      signIn,
      signUp,
    };
  }

  return {
    startGoogleAuthenticationFlow,
  };
}
