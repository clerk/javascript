import { useAuth, useClerk } from '@clerk/react';
import { Platform, requireNativeModule } from 'expo-modules-core';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { AuthViewProps } from './AuthView.types';

// Check if native module is supported on this platform
const isNativeSupported = Platform.OS === 'ios' || Platform.OS === 'android';

// Get the native module for modal presentation
const ClerkExpo = isNativeSupported ? requireNativeModule('ClerkExpo') : null;

/**
 * A pre-built native authentication component that handles sign-in and sign-up flows.
 *
 * `AuthView` presents a comprehensive, native UI for authentication powered by:
 * - **iOS**: clerk-ios (SwiftUI) - https://github.com/clerk/clerk-ios
 * - **Android**: clerk-android (Jetpack Compose) - https://github.com/clerk/clerk-android
 *
 * ## Supported Authentication Methods
 *
 * AuthView automatically presents the authentication methods enabled in your
 * [Clerk Dashboard](https://dashboard.clerk.com):
 *
 * - **Email/Password** - Traditional email and password sign-in/sign-up
 * - **Phone Number** - SMS-based authentication
 * - **Username/Password** - Username-based authentication
 * - **OAuth Providers** - Google, Apple, GitHub, Microsoft, and 20+ providers
 * - **Passkeys** - WebAuthn/FIDO2 biometric authentication
 * - **Multi-factor Authentication** - SMS, TOTP (authenticator apps), backup codes
 * - **Magic Links** - Passwordless email authentication
 * - **Enterprise SSO** - SAML and OIDC providers
 *
 * ## Session Synchronization
 *
 * When authentication completes successfully, `AuthView` automatically syncs
 * the native session with the JavaScript SDK. After `onSuccess` is called,
 * all `@clerk/expo` hooks will reflect the authenticated state:
 *
 * - `useUser()` - Returns the authenticated user
 * - `useAuth()` - Returns `isSignedIn: true` and session tokens
 * - `useOrganization()` - Returns active organization (if applicable)
 * - `useSession()` - Returns the active session
 *
 * ## Usage with JS SDK APIs
 *
 * After native authentication, you have full access to all JS SDK APIs:
 *
 * ```tsx
 * import { AuthView } from '@clerk/expo/native';
 * import { useUser } from '@clerk/expo';
 *
 * function App() {
 *   const { user } = useUser();
 *
 *   if (!user) {
 *     return <AuthView onSuccess={() => console.log('Authenticated!')} />;
 *   }
 *
 *   // Full JS SDK APIs available after auth:
 *   const updateName = () => user.update({ firstName: 'New Name' });
 *   const addEmail = () => user.createEmailAddress({ email: 'new@example.com' });
 *   const setupTOTP = () => user.createTOTP();
 *
 *   return <ProfileScreen />;
 * }
 * ```
 *
 * @example Basic usage
 * ```tsx
 * import { AuthView } from '@clerk/expo/native';
 *
 * export default function SignInScreen() {
 *   return (
 *     <AuthView
 *       onSuccess={() => router.replace('/home')}
 *       onError={(error) => console.error(error)}
 *     />
 *   );
 * }
 * ```
 *
 * @example Sign-up only mode
 * ```tsx
 * <AuthView
 *   mode="signUp"
 *   onSuccess={() => router.replace('/onboarding')}
 * />
 * ```
 *
 * @example Non-dismissable (required auth)
 * ```tsx
 * <AuthView
 *   isDismissable={false}
 *   onSuccess={() => router.replace('/dashboard')}
 * />
 * ```
 *
 * @see {@link https://clerk.com/docs/components/authentication/sign-in} Clerk Sign-In Documentation
 * @see {@link https://clerk.com/docs/authentication/configuration/sign-up-sign-in-options} Authentication Options
 */
export function AuthView({ mode = 'signInOrUp', isDismissable = true, onSuccess, onError }: AuthViewProps) {
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
      console.log('[AuthView] Auth already completed, ignoring effect re-run');
      return;
    }

    // If user was already signed in when component mounted, call onSuccess once
    if (initialSignedInRef.current && isSignedIn) {
      console.log('[AuthView] User was already signed in on mount, skipping auth modal');
      authCompletedRef.current = true;
      onSuccess?.();
      return;
    }

    // If isSignedIn became true after we started (sign-in completed), don't re-present modal
    if (isSignedIn && !initialSignedInRef.current) {
      console.log('[AuthView] Sign-in completed (isSignedIn changed to true), not re-presenting modal');
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
            console.log('[AuthView] Native SDK has existing session, syncing to JS...');
            authCompletedRef.current = true;
            if ((clerk as any)?.__internal_reloadInitialResources) {
              await (clerk as any).__internal_reloadInitialResources();
              console.log('[AuthView] JS SDK state synced from native session');
            }
            onSuccess?.();
            return;
          }
        } catch (e) {
          console.log('[AuthView] Could not check native session:', e);
        }
      }

      try {
        console.log(`[AuthView] Presenting native auth modal with mode: ${mode}`);
        const result = await ClerkExpo.presentAuth({
          mode,
          dismissable: isDismissable,
        });

        console.log(`[AuthView] Auth completed:`, result);

        // Mark auth as completed to prevent duplicate onSuccess calls
        authCompletedRef.current = true;

        // After native sign-in completes, reload the JS SDK state from the backend
        // This syncs the native session with the JS ClerkProvider
        console.log('[AuthView] clerk object:', typeof clerk, Object.keys(clerk || {}));
        console.log(
          '[AuthView] __internal_reloadInitialResources exists:',
          !!(clerk as any)?.__internal_reloadInitialResources,
        );
        if ((clerk as any)?.__internal_reloadInitialResources) {
          console.log('[AuthView] Reloading JS SDK state from backend...');
          try {
            await (clerk as any).__internal_reloadInitialResources();
            console.log('[AuthView] JS SDK state reloaded');
          } catch (reloadError) {
            console.error('[AuthView] Failed to reload JS SDK state:', reloadError);
          }
        } else {
          console.warn('[AuthView] __internal_reloadInitialResources not available on clerk object');
        }

        onSuccess?.();
      } catch (err) {
        const error = err as Error;

        // Handle "User is already signed in" error - this means native SDK has session but JS SDK doesn't know
        // This can happen when JS SDK failed to initialize (e.g., dev auth error) but native SDK has valid session
        if (error.message?.includes('already signed in')) {
          console.log('[AuthView] Native SDK reports user already signed in, syncing JS SDK state...');
          authCompletedRef.current = true;
          if ((clerk as any).__internal_reloadInitialResources) {
            try {
              await (clerk as any).__internal_reloadInitialResources();
              console.log('[AuthView] JS SDK state synced from existing native session');
              onSuccess?.();
              return;
            } catch (reloadErr) {
              console.error('[AuthView] Failed to reload JS SDK state:', reloadErr);
            }
          }
        }

        console.error('[AuthView] Auth error:', err);
        onError?.(error);
      }
    };

    presentModal();
  }, [mode, isDismissable, clerk, onSuccess, onError, isSignedIn]);

  // Show a placeholder while modal is presented
  if (!isNativeSupported) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Native AuthView is only available on iOS and Android</Text>
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
