import { useAuth } from '@clerk/react';
import { Platform, requireNativeModule } from 'expo-modules-core';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getClerkInstance } from '../provider/singleton';
import type { AuthViewProps } from './AuthView.types';

// Token cache key used by the Clerk JS SDK (must match createClerkInstance.ts)
const CLERK_CLIENT_JWT_KEY = '__clerk_client_jwt';

// Type definition for the ClerkExpo native module
interface ClerkExpoModule {
  configure(config: { publishableKey: string }): Promise<void>;
  presentAuth(options: { mode: string; dismissable: boolean }): Promise<{ sessionId?: string }>;
  presentUserProfile(): Promise<void>;
  getSession(): Promise<{ sessionId?: string; user?: Record<string, unknown> } | null>;
  getClientToken(): Promise<string | null>;
  signOut(): Promise<void>;
}

// Check if native module is supported on this platform
const isNativeSupported = Platform.OS === 'ios' || Platform.OS === 'android';

// Get the native module for modal presentation
// Wrapped in try/catch because the module may not be available if the plugin isn't configured
let ClerkExpo: ClerkExpoModule | null = null;
if (isNativeSupported) {
  try {
    ClerkExpo = requireNativeModule('ClerkExpo') as ClerkExpoModule;
  } catch {
    // Native module not available - plugin not configured
    // This is expected when users use @clerk/expo without the native plugin
    ClerkExpo = null;
  }
}

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

async function syncNativeSession(sessionId: string): Promise<void> {
  // Copy the native client's bearer token to the JS SDK's token cache
  if (ClerkExpo?.getClientToken) {
    const nativeClientToken = await ClerkExpo.getClientToken();
    if (nativeClientToken) {
      await SecureStore.setItemAsync(CLERK_CLIENT_JWT_KEY, nativeClientToken, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
      });
    }
  }

  const clerkInstance = getClerkInstance();
  if (!clerkInstance) {
    throw new Error('[AuthView] Clerk instance not available');
  }

  // Reload resources using the native client's token
  const clerkRecord = clerkInstance as unknown as Record<string, unknown>;
  if (typeof clerkRecord.__internal_reloadInitialResources === 'function') {
    await (clerkRecord.__internal_reloadInitialResources as () => Promise<void>)();
  }

  if (typeof clerkInstance.setActive === 'function') {
    await clerkInstance.setActive({ session: sessionId });
  }
}

/**
 * Check if an error indicates the user is already signed in.
 * Prefers structured error code, falls back to message matching.
 */
function isAlreadySignedInError(error: Error & { code?: string }): boolean {
  if (error.code === 'already_signed_in') {
    return true;
  }
  return /already signed in/i.test(error.message ?? '');
}

export function AuthView({ mode = 'signInOrUp', isDismissable = true, onSuccess, onError }: AuthViewProps) {
  const { isSignedIn } = useAuth();
  // Track if we've already completed auth to prevent duplicate onSuccess calls
  const authCompletedRef = useRef(false);
  // Track the initial signed-in state to differentiate between "already signed in" vs "just signed in"
  const initialSignedInRef = useRef(isSignedIn);
  // Track if we've started presenting
  const hasStartedRef = useRef(false);

  // Stable refs for callbacks to avoid re-triggering the effect
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    if (!isNativeSupported || !ClerkExpo?.presentAuth) {
      return;
    }

    // If auth already completed in this component instance, don't do anything
    if (authCompletedRef.current) {
      return;
    }

    // If we've already started presenting, don't start again
    if (hasStartedRef.current) {
      return;
    }

    // If user was already signed in when component mounted, call onSuccess once
    if (initialSignedInRef.current && isSignedIn) {
      authCompletedRef.current = true;
      onSuccessRef.current?.();
      return;
    }

    // If isSignedIn became true after we started (sign-in completed), don't re-present modal
    if (isSignedIn && !initialSignedInRef.current) {
      return;
    }

    hasStartedRef.current = true;

    const presentModal = async () => {
      // First check if native SDK has an existing session
      // If so, sync to JS and call onSuccess without showing modal
      if (ClerkExpo?.getSession) {
        try {
          const nativeSession = await ClerkExpo.getSession();
          const sessionId = nativeSession?.sessionId;
          if (sessionId) {
            authCompletedRef.current = true;
            await syncNativeSession(sessionId);
            onSuccessRef.current?.();
            return;
          }
        } catch (e) {
          // Failed to check native session, continue to present modal
        }
      }

      try {
        const result = await ClerkExpo.presentAuth({
          mode,
          dismissable: isDismissable,
        });

        // Sync the native session to JS SDK
        if (result.sessionId) {
          try {
            await syncNativeSession(result.sessionId);
            authCompletedRef.current = true;
            onSuccessRef.current?.();
          } catch (syncError) {
            console.error('[AuthView] Failed to sync session:', syncError);
            onErrorRef.current?.(syncError as Error);
          }
          return;
        }

        authCompletedRef.current = true;
        onSuccessRef.current?.();
      } catch (err) {
        const error = err as Error & { code?: string };

        // Handle "User is already signed in" error - this means native SDK has session but JS SDK doesn't know
        // This can happen when JS SDK failed to initialize (e.g., dev auth error) but native SDK has valid session
        if (isAlreadySignedInError(error)) {
          authCompletedRef.current = true;

          // Get the session from native SDK and sync to JS
          if (ClerkExpo?.getSession) {
            try {
              const nativeSession = await ClerkExpo.getSession();
              if (nativeSession?.sessionId) {
                await syncNativeSession(nativeSession.sessionId);
                onSuccessRef.current?.();
                return;
              }
            } catch (syncErr) {
              console.error('[AuthView] Failed to sync native session:', syncErr);
            }
          }
        }

        onErrorRef.current?.(error);
      }
    };

    presentModal();
  }, [mode, isDismissable, isSignedIn]);

  // Show a placeholder when native modules aren't available
  if (!isNativeSupported || !ClerkExpo) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          {!isNativeSupported
            ? 'Native AuthView is only available on iOS and Android'
            : 'Native AuthView requires the @clerk/expo plugin. Add "@clerk/expo" to your app.json plugins array.'}
        </Text>
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
