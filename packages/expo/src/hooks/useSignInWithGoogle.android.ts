import { createUseSignInWithGoogle } from './useSignInWithGoogle.shared';
export type {
  StartGoogleAuthenticationFlowParams,
  StartGoogleAuthenticationFlowReturnType,
} from './useSignInWithGoogle.types';

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
 *       const { createdSessionId, setSelected } = await startGoogleAuthenticationFlow();
 *
 *       if (createdSessionId && setSelected) {
 *         await setSelected({ session: createdSessionId });
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
export const useSignInWithGoogle = createUseSignInWithGoogle({ requiresIosClientId: false });
