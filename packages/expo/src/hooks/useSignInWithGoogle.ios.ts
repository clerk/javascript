import { createUseSignInWithGoogle } from './useSignInWithGoogle.shared';
export type {
  StartGoogleAuthenticationFlowParams,
  StartGoogleAuthenticationFlowReturnType,
} from './useSignInWithGoogle.types';

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
export const useSignInWithGoogle = createUseSignInWithGoogle({ requiresIosClientId: true });
