import { useAuth, useClerk } from '@clerk/react';
import { requireNativeModule, Platform } from 'expo-modules-core';
import { useEffect, useRef } from 'react';
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
  // Track if we've already completed auth to prevent duplicate onSuccess calls
  const authCompletedRef = useRef(false);
  // Track the initial signed-in state to differentiate between "already signed in" vs "just signed in"
  const initialSignedInRef = useRef(isSignedIn);

  useEffect(() => {
    if (!isNativeSupported || !ClerkExpo?.presentAuth) {
      return;
    }

    // If auth already completed in this component instance, don't do anything
    if (authCompletedRef.current) {
      console.log('[SignIn] Auth already completed, ignoring effect re-run');
      return;
    }

    // If user was already signed in when component mounted, call onSuccess once
    if (initialSignedInRef.current && isSignedIn) {
      console.log('[SignIn] User was already signed in on mount, skipping auth modal');
      authCompletedRef.current = true;
      onSuccess?.();
      return;
    }

    // If isSignedIn became true after we started (sign-in completed), don't re-present modal
    if (isSignedIn && !initialSignedInRef.current) {
      console.log('[SignIn] Sign-in completed (isSignedIn changed to true), not re-presenting modal');
      return;
    }

    const presentModal = async () => {
      // First check if native SDK has an existing session
      // If so, sync to JS and call onSuccess without showing modal
      if (ClerkExpo?.getSession) {
        try {
          const nativeSession = await ClerkExpo.getSession();
          // Check for actual session data, not just truthy object (empty {} is truthy)
          if (nativeSession?.session) {
            console.log('[SignIn] Native SDK has existing session, syncing to JS...');
            authCompletedRef.current = true;
            // @ts-expect-error - This is an internal API
            if (clerk?.__internal_reloadInitialResources) {
              // @ts-expect-error - This is an internal API
              await clerk.__internal_reloadInitialResources();
              console.log('[SignIn] JS SDK state synced from native session');
            }
            onSuccess?.();
            return;
          }
        } catch (e) {
          console.log('[SignIn] Could not check native session:', e);
        }
      }

      try {
        console.log(`[SignIn] Presenting native auth modal with mode: ${mode}`);
        const result = await ClerkExpo.presentAuth({
          mode,
          dismissable: isDismissable,
        });

        console.log(`[SignIn] Auth completed:`, result);

        // Mark auth as completed to prevent duplicate onSuccess calls
        authCompletedRef.current = true;

        // After native sign-in completes, reload the JS SDK state from the backend
        // This syncs the native session with the JS ClerkProvider
        console.log('[SignIn] clerk object:', typeof clerk, Object.keys(clerk || {}));
        // @ts-expect-error - This is an internal API
        console.log('[SignIn] __internal_reloadInitialResources exists:', !!clerk?.__internal_reloadInitialResources);
        // @ts-expect-error - This is an internal API
        if (clerk?.__internal_reloadInitialResources) {
          console.log('[SignIn] Reloading JS SDK state from backend...');
          try {
            // @ts-expect-error - This is an internal API
            await clerk.__internal_reloadInitialResources();
            console.log('[SignIn] JS SDK state reloaded');
          } catch (reloadError) {
            console.error('[SignIn] Failed to reload JS SDK state:', reloadError);
          }
        } else {
          console.warn('[SignIn] __internal_reloadInitialResources not available on clerk object');
        }

        onSuccess?.();
      } catch (err) {
        const error = err as Error;

        // Handle "User is already signed in" error - this means native SDK has session but JS SDK doesn't know
        // This can happen when JS SDK failed to initialize (e.g., dev auth error) but native SDK has valid session
        if (error.message?.includes('already signed in')) {
          console.log('[SignIn] Native SDK reports user already signed in, syncing JS SDK state...');
          authCompletedRef.current = true;
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
