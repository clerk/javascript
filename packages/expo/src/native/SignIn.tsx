import { useAuth, useClerk } from '@clerk/clerk-react';
import { requireNativeModule, Platform } from 'expo-modules-core';
import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { SignInProps } from './SignIn.types';

// Check if native module is supported on this platform
const isNativeSupported = Platform.OS === 'ios' || Platform.OS === 'android';

// Get the native module for modal presentation
const ClerkExpo = isNativeSupported ? requireNativeModule('ClerkExpo') : null;

/**
 * Native SignIn component powered by clerk-ios (SwiftUI) and clerk-android (Jetpack Compose)
 *
 * Uses the official Clerk native packages:
 * - iOS: https://github.com/clerk/clerk-ios
 * - Android: https://github.com/clerk/clerk-android
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
  const clerk = useClerk();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (!isNativeSupported || !ClerkExpo?.presentAuth) {
      return;
    }

    // If user is already signed in, call onSuccess immediately without presenting modal
    if (isSignedIn) {
      console.log('[SignIn] User is already signed in, skipping auth modal');
      onSuccess?.();
      return;
    }

    const presentModal = async () => {
      try {
        console.log(`[SignIn] Presenting native auth modal with mode: ${mode}`);
        const result = await ClerkExpo.presentAuth({
          mode,
          dismissable: isDismissable,
        });

        console.log(`[SignIn] Auth completed:`, result);

        // After native sign-in completes, reload the JS SDK state from the backend
        // This syncs the native session with the JS ClerkProvider
        // @ts-expect-error - This is an internal API
        if (clerk.__internal_reloadInitialResources) {
          console.log('[SignIn] Reloading JS SDK state from backend...');
          // @ts-expect-error - This is an internal API
          await clerk.__internal_reloadInitialResources();
          console.log('[SignIn] JS SDK state reloaded');
        }

        onSuccess?.();
      } catch (err) {
        const error = err as Error;

        // Handle "User is already signed in" error - this means native SDK has session but JS SDK doesn't know
        // This can happen when JS SDK failed to initialize (e.g., dev auth error) but native SDK has valid session
        if (error.message?.includes('already signed in')) {
          console.log('[SignIn] Native SDK reports user already signed in, syncing JS SDK state...');
          // @ts-expect-error - This is an internal API
          if (clerk.__internal_reloadInitialResources) {
            try {
              // @ts-expect-error - This is an internal API
              await clerk.__internal_reloadInitialResources();
              console.log('[SignIn] JS SDK state synced from existing native session');
              onSuccess?.();
              return;
            } catch (reloadErr) {
              console.error('[SignIn] Failed to reload JS SDK state:', reloadErr);
            }
          }
        }

        console.error('[SignIn] Auth error:', err);
        onError?.(error);
      }
    };

    presentModal();
  }, [mode, isDismissable, clerk, onSuccess, onError, isSignedIn]);

  // Show a placeholder while modal is presented
  if (!isNativeSupported) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Native SignIn is only available on iOS and Android</Text>
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
