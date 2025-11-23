import { useSignIn, useSignUp } from '@clerk/clerk-react';
import type { SetActive, SignInResource, SignUpResource } from '@clerk/types';
import * as Crypto from 'expo-crypto';
import Constants from 'expo-constants';

import { ClerkGoogleOneTapSignIn, isSuccessResponse } from '../google-one-tap';
import { errorThrower } from '../utils/errors';

export type StartGoogleAuthenticationFlowParams = {
  unsafeMetadata?: SignUpUnsafeMetadata;
};

export type StartGoogleAuthenticationFlowReturnType = {
  createdSessionId: string | null;
  setActive?: SetActive;
  signIn?: SignInResource;
  signUp?: SignUpResource;
};

/**
 * Hook for native Google Authentication on Android using Clerk's built-in Google One Tap module.
 *
 * This hook provides a simplified way to authenticate users with their Google account
 * using the native Android Google Sign-In UI with Credential Manager. The authentication
 * flow automatically handles the ID token exchange with Clerk's backend and manages
 * the transfer flow between sign-in and sign-up.
 *
 * Features:
 * - Native Google One Tap UI
 * - Built-in nonce support for replay attack protection
 * - No additional dependencies required
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
 * @platform Android - This is the Android-specific implementation using Credential Manager
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

    // Get environment variables from expo-constants
    const webClientId =
      Constants.expoConfig?.extra?.EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID ||
      process.env.EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID;

    if (!webClientId) {
      return errorThrower.throw(
        'Google Sign-In credentials not found. Please set EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID in your .env file.',
      );
    }

    // Configure Google Sign-In
    ClerkGoogleOneTapSignIn.configure({
      webClientId,
    });

    // Generate a cryptographic nonce for replay attack protection
    const nonce = Crypto.randomUUID();

    // Hash the nonce with SHA-256 (Google requires the hashed version)
    const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, nonce);

    try {
      // Try to sign in with Google One Tap (shows saved accounts)
      // Using presentExplicitSignIn for consistent "Sign in with Google" button behavior
      const response = await ClerkGoogleOneTapSignIn.presentExplicitSignIn({
        nonce: hashedNonce,
      });

      // User cancelled
      if (!isSuccessResponse(response)) {
        return {
          createdSessionId: null,
          setActive,
          signIn,
          signUp,
        };
      }

      const { idToken } = response.data;

      try {
        // Try to sign in with the Google One Tap strategy
        await signIn.create({
          strategy: 'google_one_tap',
          token: idToken,
        });

        // Check if we need to transfer to SignUp (user doesn't exist yet)
        const userNeedsToBeCreated = signIn.firstFactorVerification.status === 'transferable';

        if (userNeedsToBeCreated) {
          // User doesn't exist - create a new SignUp with transfer
          await signUp.create({
            transfer: true,
            unsafeMetadata: startGoogleAuthenticationFlowParams?.unsafeMetadata,
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
      } catch (signInError: unknown) {
        // Handle the case where the user doesn't exist (external_account_not_found)
        const isClerkError =
          signInError &&
          typeof signInError === 'object' &&
          'clerkError' in signInError &&
          (signInError as { clerkError: boolean }).clerkError === true;

        const hasExternalAccountNotFoundError =
          signInError &&
          typeof signInError === 'object' &&
          'errors' in signInError &&
          Array.isArray((signInError as { errors: unknown[] }).errors) &&
          (signInError as { errors: Array<{ code: string }> }).errors.some(
            err => err.code === 'external_account_not_found',
          );

        if (isClerkError && hasExternalAccountNotFoundError) {
          // User doesn't exist - create a new SignUp with the token
          await signUp.create({
            strategy: 'google_one_tap',
            token: idToken,
            unsafeMetadata: startGoogleAuthenticationFlowParams?.unsafeMetadata,
          });

          return {
            createdSessionId: signUp.createdSessionId,
            setActive,
            signIn,
            signUp,
          };
        }

        // Re-throw if it's a different error
        throw signInError;
      }
    } catch (error: unknown) {
      // Handle Google Sign-In errors
      if (error && typeof error === 'object' && 'code' in error) {
        const errorCode = (error as { code: string }).code;

        // User canceled the sign-in flow
        if (errorCode === 'SIGN_IN_CANCELLED') {
          return {
            createdSessionId: null,
            setActive,
            signIn,
            signUp,
          };
        }
      }

      // Re-throw other errors
      throw error;
    }
  }

  return {
    startGoogleAuthenticationFlow,
  };
}
