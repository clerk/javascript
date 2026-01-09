import { requireNativeModule, Platform } from 'expo-modules-core';
import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { SignInProps } from './SignIn.types';
import { useSignIn } from '../hooks';

// Get the native module for modal presentation
const ClerkExpo = Platform.OS === 'ios' ? requireNativeModule('ClerkExpo') : null;

/**
 * Native iOS SignIn component powered by clerk-ios SwiftUI
 *
 * Uses the official clerk-ios package from:
 * https://github.com/clerk/clerk-ios
 * https://swiftpackageindex.com/clerk/clerk-ios
 *
 * This component presents the native sign-in UI modally when mounted.
 * The modal will automatically dismiss when authentication completes.
 *
 * @example
 * ```tsx
 * import { SignIn } from '@clerk/clerk-expo/native';
 *
 * export default function SignInScreen() {
 *   return (
 *     <SignIn
 *       mode="signIn"
 *       onSuccess={() => router.push('/')}
 *     />
 *   );
 * }
 * ```
 */
export function SignIn({ mode = 'signInOrUp', isDismissable = true, onSuccess, onError }: SignInProps) {
  const { setActive } = useSignIn();

  useEffect(() => {
    if (Platform.OS !== 'ios' || !ClerkExpo?.presentAuth) {
      return;
    }

    const presentModal = async () => {
      try {
        console.log(`[SignIn] Presenting native auth modal with mode: ${mode}`);
        const result = await ClerkExpo.presentAuth({
          mode,
          dismissable: isDismissable,
        });

        console.log(`[SignIn] Auth completed: ${result.type}, sessionId: ${result.sessionId}`);

        // Sync native auth result with JavaScript state
        if (setActive && result.sessionId) {
          await setActive({ session: result.sessionId });
        }
        onSuccess?.();
      } catch (err) {
        console.error('[SignIn] Auth error:', err);
        onError?.(err as Error);
      }
    };

    presentModal();
  }, [mode, isDismissable, setActive, onSuccess, onError]);

  // Show a placeholder while modal is presented
  if (Platform.OS !== 'ios') {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Native SignIn is only available on iOS</Text>
      </View>
    );
  }

  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    color: '#666',
  },
});
