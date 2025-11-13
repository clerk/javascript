import { useSignIn, useSignUp } from '@clerk/clerk-react';
import type { SetActive, SignInResource, SignUpResource } from '@clerk/types';

import { errorThrower } from '../utils/errors';

export type StartAppleAuthenticationFlowParams = {
  unsafeMetadata?: SignUpUnsafeMetadata;
};

export type StartAppleAuthenticationFlowReturnType = {
  createdSessionId: string | null;
  setActive?: SetActive;
  signIn?: SignInResource;
  signUp?: SignUpResource;
};

/**
 * Hook for native Apple Authentication on iOS using expo-apple-authentication.
 *
 * This hook provides a simplified way to authenticate users with their Apple ID
 * using the native iOS Sign in with Apple UI. The authentication flow automatically
 * handles the ID token exchange with Clerk's backend and manages the transfer flow
 * between sign-in and sign-up.
 *
 * @example
 * ```tsx
 * import { useSignInWithApple } from '@clerk/clerk-expo';
 * import { Button } from 'react-native';
 *
 * function AppleSignInButton() {
 *   const { startAppleAuthenticationFlow } = useSignInWithApple();
 *
 *   const onPress = async () => {
 *     try {
 *       const { createdSessionId, setActive } = await startAppleAuthenticationFlow();
 *
 *       if (createdSessionId && setActive) {
 *         await setActive({ session: createdSessionId });
 *       }
 *     } catch (err) {
 *       console.error('Apple Authentication error:', err);
 *     }
 *   };
 *
 *   return <Button title="Sign in with Apple" onPress={onPress} />;
 * }
 * ```
 *
 * @requires expo-apple-authentication - Must be installed as a peer dependency
 * @platform iOS - This is the iOS-specific implementation
 *
 * @returns An object containing the `startAppleAuthenticationFlow` function
 */
export function useSignInWithApple() {
  const { signIn, setActive, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, isLoaded: isSignUpLoaded } = useSignUp();

  async function startAppleAuthenticationFlow(
    startAppleAuthenticationFlowParams?: StartAppleAuthenticationFlowParams,
  ): Promise<StartAppleAuthenticationFlowReturnType> {
    if (!isSignInLoaded || !isSignUpLoaded) {
      return {
        createdSessionId: null,
        signIn,
        signUp,
        setActive,
      };
    }

    // Dynamically import expo-apple-authentication only when needed
    let AppleAuthentication;
    let Crypto;

    try {
      [AppleAuthentication, Crypto] = await Promise.all([import('expo-apple-authentication'), import('expo-crypto')]);
    } catch {
      return errorThrower.throw(
        'expo-apple-authentication is required to use Sign in with Apple. ' +
          'Please install it by running: npx expo install expo-apple-authentication expo-crypto',
      );
    }

    // Check if Apple Authentication is available on the device
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      return errorThrower.throw('Apple Authentication is not available on this device.');
    }

    try {
      // Generate a cryptographically secure nonce for the Apple Sign-In request (required by Clerk)
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
      await signIn.create({
        strategy: 'oauth_token_apple',
        token: identityToken,
      });

      // Check if we need to transfer to SignUp (user doesn't exist yet)
      const userNeedsToBeCreated = signIn.firstFactorVerification.status === 'transferable';

      if (userNeedsToBeCreated) {
        // User doesn't exist - create a new SignUp with transfer
        await signUp.create({
          transfer: true,
          unsafeMetadata: startAppleAuthenticationFlowParams?.unsafeMetadata,
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
    startAppleAuthenticationFlow,
  };
}
