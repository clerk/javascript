import { useSignIn, useSignUp } from '@clerk/clerk-react';
import type { SetActive, SignInResource, SignUpResource } from '@clerk/types';
import { Platform } from 'react-native';

import { errorThrower } from '../utils/errors';

export type StartAppleSignInFlowParams = {
  unsafeMetadata?: SignUpUnsafeMetadata;
};

export type StartAppleSignInFlowReturnType = {
  createdSessionId: string | null;
  setActive?: SetActive;
  signIn?: SignInResource;
  signUp?: SignUpResource;
};

/**
 * Hook for native Apple Sign-In on iOS using expo-apple-authentication.
 *
 * This hook provides a simplified way to authenticate users with their Apple ID
 * using the native iOS Sign in with Apple UI. The authentication flow automatically
 * handles the ID token exchange with Clerk's backend and manages the transfer flow
 * between sign-in and sign-up.
 *
 * @example
 * ```tsx
 * import { useAppleSignIn } from '@clerk/clerk-expo';
 * import { Button } from 'react-native';
 *
 * function AppleSignInButton() {
 *   const { startAppleSignInFlow } = useAppleSignIn();
 *
 *   const onPress = async () => {
 *     try {
 *       const { createdSessionId, setActive } = await startAppleSignInFlow();
 *
 *       if (createdSessionId && setActive) {
 *         await setActive({ session: createdSessionId });
 *       }
 *     } catch (err) {
 *       console.error('Apple Sign-In error:', err);
 *     }
 *   };
 *
 *   return <Button title="Sign in with Apple" onPress={onPress} />;
 * }
 * ```
 *
 * @requires expo-apple-authentication - Must be installed as a peer dependency
 * @platform iOS - This hook only works on iOS. On other platforms, it will throw an error.
 *
 * @returns An object containing the `startAppleSignInFlow` function
 */
export function useAppleSignIn() {
  const { signIn, setActive, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, isLoaded: isSignUpLoaded } = useSignUp();

  async function startAppleSignInFlow(
    startAppleSignInFlowParams?: StartAppleSignInFlowParams,
  ): Promise<StartAppleSignInFlowReturnType> {
    // Check platform compatibility
    if (Platform.OS !== 'ios') {
      return errorThrower.throw(
        'Apple Sign-In is only available on iOS. Please use the web-based OAuth flow (useSSO with strategy: "oauth_apple") on other platforms.',
      );
    }

    if (!isSignInLoaded || !isSignUpLoaded) {
      return {
        createdSessionId: null,
        signIn,
        signUp,
        setActive,
      };
    }

    // Lazy load expo-apple-authentication to avoid import issues on web
    const AppleAuthentication = await import('expo-apple-authentication');

    // Check if Apple Authentication is available on the device
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      return errorThrower.throw('Apple Authentication is not available on this device.');
    }

    try {
      // Generate a cryptographically secure nonce for the Apple Sign-In request (required by Clerk)
      // Lazy load expo-crypto to avoid import issues on web
      const Crypto = await import('expo-crypto');
      const nonce = Crypto.randomUUID();

      // Request Apple authentication with requested scopes
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce,
      });

      // Extract the identity token from the credential
      const { identityToken } = credential;

      if (!identityToken) {
        return errorThrower.throw('No identity token received from Apple Sign-In.');
      }

      // Create a SignIn with the Apple ID token strategy
      // Note: Type assertions needed until @clerk/clerk-react propagates the new oauth_token_apple strategy type
      await signIn.create({
        strategy: 'oauth_token_apple' as any,
        token: identityToken,
      } as any);

      // Check if we need to transfer to SignUp (user doesn't exist yet)
      const userNeedsToBeCreated = signIn.firstFactorVerification.status === 'transferable';

      if (userNeedsToBeCreated) {
        // User doesn't exist - create a new SignUp with transfer
        await signUp.create({
          transfer: true,
          unsafeMetadata: startAppleSignInFlowParams?.unsafeMetadata,
        });

        return {
          createdSessionId: signUp.createdSessionId,
          setActive,
          signIn,
          signUp,
        };
      }

      // User exists - return the SignIn session
      return {
        createdSessionId: signIn.createdSessionId,
        setActive,
        signIn,
        signUp,
      };
    } catch (error: unknown) {
      // Handle Apple Authentication errors
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ERR_REQUEST_CANCELED') {
        // User canceled the sign-in flow
        return {
          createdSessionId: null,
          setActive,
          signIn,
          signUp,
        };
      }

      // Re-throw other errors
      throw error;
    }
  }

  return {
    startAppleSignInFlow,
  };
}
