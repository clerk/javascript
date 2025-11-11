import { useSignIn, useSignUp } from '@clerk/clerk-react';
import type { SetActive, SignInResource, SignUpResource } from '@clerk/types';
import Constants from 'expo-constants';

import { errorThrower } from '../utils/errors';

// Define our own interface to avoid importing types from an optional dependency
// This keeps @react-native-google-signin/google-signin as an optional peer dependency
interface GoogleSigninInterface {
  configure(config: { webClientId: string; androidClientId?: string }): void;
  hasPlayServices(options?: { showPlayServicesUpdateDialog?: boolean }): Promise<boolean>;
  signIn(): Promise<{ data?: { idToken?: string } }>;
}

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
 * Hook for native Google Authentication on Android using @react-native-google-signin/google-signin.
 *
 * This hook provides a simplified way to authenticate users with their Google account
 * using the native Android Google Sign-In UI. The authentication flow automatically
 * handles the ID token exchange with Clerk's backend and manages the transfer flow
 * between sign-in and sign-up.
 *
 * @example
 * ```tsx
 * import { useSignInWithGoogle } from '@clerk/clerk-expo';
 * import { Button } from 'react-native';
 *
 * function GoogleSigninButton() {
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
 * @requires @react-native-google-signin/google-signin - Must be installed as a peer dependency
 * @platform Android - This is the Android-specific implementation
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

    try {
      // Dynamically import GoogleSignin to keep it as an optional dependency
      // This will only fail at runtime if the user tries to use it without installing the package
      let GoogleSignin: GoogleSigninInterface;
      try {
        const module = await import('@react-native-google-signin/google-signin');
        GoogleSignin = module.GoogleSignin;
      } catch {
        return errorThrower.throw(
          'Google Sign-In package not found. Please install @react-native-google-signin/google-signin to use this feature.',
        );
      }

      // Get environment variables from expo-constants
      const webClientId =
        Constants.expoConfig?.extra?.EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID ||
        process.env.EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID;
      const androidClientId =
        Constants.expoConfig?.extra?.EXPO_PUBLIC_CLERK_GOOGLE_ANDROID_CLIENT_ID ||
        process.env.EXPO_PUBLIC_CLERK_GOOGLE_ANDROID_CLIENT_ID;

      if (!webClientId || !androidClientId) {
        return errorThrower.throw(
          'Google Sign-In credentials not found. Please set EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID and EXPO_PUBLIC_CLERK_GOOGLE_ANDROID_CLIENT_ID in your .env file.',
        );
      }

      // Configure Google Sign-In (can be called multiple times safely)
      GoogleSignin.configure({
        webClientId,
        androidClientId,
      });

      // Check Google Play Services availability on Android
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Sign in with Google
      const response = await GoogleSignin.signIn();

      // Extract the ID token from the response
      const idToken = response.data?.idToken;

      if (!idToken) {
        return errorThrower.throw('No ID token received from Google Sign-In.');
      }

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
        // In this case, we need to create a sign-up with the same token
        const isClerkError =
          signInError &&
          typeof signInError === 'object' &&
          'clerkError' in signInError &&
          (signInError as any).clerkError === true;

        const hasExternalAccountNotFoundError =
          signInError &&
          typeof signInError === 'object' &&
          'errors' in signInError &&
          Array.isArray((signInError as any).errors) &&
          (signInError as any).errors.some((err: any) => err.code === 'external_account_not_found');

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
        if (errorCode === 'SIGN_IN_CANCELLED' || errorCode === '-5') {
          return {
            createdSessionId: null,
            setActive,
            signIn,
            signUp,
          };
        }

        // Play Services not available or outdated
        if (errorCode === 'PLAY_SERVICES_NOT_AVAILABLE') {
          return errorThrower.throw('Google Play Services is not available or outdated on this device.');
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
