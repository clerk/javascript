import { useClerk } from '@clerk/react';
import Constants from 'expo-constants';

import { errorThrower } from '../utils/errors';
import { executeGoogleAuthenticationFlow } from './useSignInWithGoogle.shared';
import type {
  StartGoogleAuthenticationFlowParams,
  StartGoogleAuthenticationFlowReturnType,
} from './useSignInWithGoogle.types';

export type { StartGoogleAuthenticationFlowParams, StartGoogleAuthenticationFlowReturnType };

/**
 * Hook for native Google Authentication on iOS using Clerk's built-in Google Sign-In module.
 *
 * This hook provides a simplified way to authenticate users with their Google account
 * using the native iOS Google Sign-In UI. The authentication flow automatically
 * handles the ID token exchange with Clerk's backend and manages the transfer flow
 * between sign-in and sign-up.
 *
 * Features:
 * - Native Google Sign-In UI
 * - Built-in nonce support for replay attack protection
 * - No additional dependencies required
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
 * @platform iOS - This is the iOS-specific implementation using Google Sign-In SDK
 *
 * @returns An object containing the `startGoogleAuthenticationFlow` function
 */
export function useSignInWithGoogle() {
  const clerk = useClerk();

  async function startGoogleAuthenticationFlow(
    startGoogleAuthenticationFlowParams?: StartGoogleAuthenticationFlowParams,
  ): Promise<StartGoogleAuthenticationFlowReturnType> {
    const { client, loaded, setActive } = clerk;

    if (!loaded || !client) {
      return {
        createdSessionId: null,
        setActive,
      };
    }

    // Get environment variables from expo-constants
    const webClientId =
      Constants.expoConfig?.extra?.EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID ||
      process.env.EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID;
    const iosClientId =
      Constants.expoConfig?.extra?.EXPO_PUBLIC_CLERK_GOOGLE_IOS_CLIENT_ID ||
      process.env.EXPO_PUBLIC_CLERK_GOOGLE_IOS_CLIENT_ID;

    if (!webClientId || !iosClientId) {
      return errorThrower.throw(
        'Google Sign-In credentials not found. Please set EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID and EXPO_PUBLIC_CLERK_GOOGLE_IOS_CLIENT_ID in your .env file.',
      );
    }

    return executeGoogleAuthenticationFlow(
      { client, setActive },
      { webClientId, iosClientId },
      startGoogleAuthenticationFlowParams,
    );
  }

  return {
    startGoogleAuthenticationFlow,
  };
}
