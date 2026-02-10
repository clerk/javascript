import { useAuth, useClerk } from '@clerk/react';
import { Platform, requireNativeModule } from 'expo-modules-core';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { AuthViewProps } from './AuthView.types';

// Type definition for the ClerkExpo native module
interface ClerkExpoModule {
  configure(config: { publishableKey: string }): Promise<void>;
  presentAuth(options: { mode: string; dismissable: boolean }): Promise<{ sessionId?: string }>;
  presentUserProfile(): Promise<void>;
  getSession(): Promise<{ sessionId?: string; user?: Record<string, unknown> } | null>;
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
export function AuthView({ mode = 'signInOrUp', isDismissable = true, onSuccess, onError }: AuthViewProps) {
  const clerk = useClerk();
  const { isSignedIn, isLoaded } = useAuth();
  // Track if we've already completed auth to prevent duplicate onSuccess calls
  const authCompletedRef = useRef(false);
  // Track the initial signed-in state to differentiate between "already signed in" vs "just signed in"
  const initialSignedInRef = useRef(isSignedIn);
  // Track if we've started presenting
  const hasStartedRef = useRef(false);

  console.log(
    `[AuthView] RENDER: isSignedIn=${isSignedIn}, isLoaded=${isLoaded}, authCompleted=${authCompletedRef.current}, initialSignedIn=${initialSignedInRef.current}, hasStarted=${hasStartedRef.current}`,
  );

  useEffect(() => {
    console.log(
      `[AuthView] EFFECT: isNativeSupported=${isNativeSupported}, ClerkExpo=${!!ClerkExpo}, presentAuth=${!!ClerkExpo?.presentAuth}`,
    );

    if (!isNativeSupported || !ClerkExpo?.presentAuth) {
      console.log(`[AuthView] SKIP: Native not supported or presentAuth unavailable`);
      return;
    }

    // If auth already completed in this component instance, don't do anything
    if (authCompletedRef.current) {
      console.log('[AuthView] SKIP: Auth already completed, ignoring effect re-run');
      return;
    }

    // If we've already started presenting, don't start again
    if (hasStartedRef.current) {
      console.log('[AuthView] SKIP: Already started presenting');
      return;
    }

    // If user was already signed in when component mounted, call onSuccess once
    if (initialSignedInRef.current && isSignedIn) {
      console.log('[AuthView] SKIP: User was already signed in on mount (initialSignedIn=true, isSignedIn=true)');
      authCompletedRef.current = true;
      onSuccess?.();
      return;
    }

    // If isSignedIn became true after we started (sign-in completed), don't re-present modal
    if (isSignedIn && !initialSignedInRef.current) {
      console.log(
        '[AuthView] SKIP: Sign-in completed externally (isSignedIn changed to true), not re-presenting modal',
      );
      return;
    }

    hasStartedRef.current = true;
    console.log(`[AuthView] PRESENT: Starting modal presentation flow...`);

    const presentModal = async () => {
      // First check if native SDK has an existing session
      // If so, sync to JS and call onSuccess without showing modal
      if (ClerkExpo?.getSession) {
        try {
          console.log(`[AuthView] CHECK_SESSION: Checking native session...`);
          const nativeSession = await ClerkExpo.getSession();
          console.log(`[AuthView] CHECK_SESSION: Result:`, JSON.stringify(nativeSession));
          // Native getSession returns { sessionId: "...", user: {...} } at top level
          const sessionId = nativeSession?.sessionId;
          if (sessionId) {
            console.log('[AuthView] SYNC: Native SDK has existing session, syncing to JS via setActive...');
            authCompletedRef.current = true;
            if (clerk.setActive) {
              await clerk.setActive({ session: sessionId });
              console.log('[AuthView] SYNC: JS SDK state synced from native session');
            }
            onSuccess?.();
            return;
          } else {
            console.log(`[AuthView] CHECK_SESSION: No session found, will present modal`);
          }
        } catch (e) {
          console.log('[AuthView] CHECK_SESSION: Error checking native session:', e);
        }
      }

      try {
        console.log(`[AuthView] MODAL: Presenting native auth modal with mode=${mode}, dismissable=${isDismissable}`);
        const result = await ClerkExpo.presentAuth({
          mode,
          dismissable: isDismissable,
        });

        console.log(`[AuthView] MODAL: Auth completed, result:`, JSON.stringify(result));

        // Mark auth as completed to prevent duplicate onSuccess calls
        authCompletedRef.current = true;

        // After native sign-in completes, sync the session to JS SDK using setActive
        if (result.sessionId && clerk.setActive) {
          console.log(`[AuthView] SYNC: Syncing session=${result.sessionId} to JS SDK via setActive...`);
          try {
            // Wait for client to be loaded if needed
            const clerkAny = clerk as any;
            console.log(`[AuthView] SYNC: clerk.loaded=${clerkAny.loaded}`);
            if (!clerkAny.loaded && clerkAny.addOnLoaded) {
              console.log('[AuthView] SYNC: Waiting for client to load...');
              await new Promise<void>(resolve => {
                clerkAny.addOnLoaded(() => {
                  console.log('[AuthView] SYNC: addOnLoaded callback fired');
                  resolve();
                });
              });
            }
            await clerk.setActive({ session: result.sessionId });
            console.log('[AuthView] SYNC: JS SDK session synced successfully');
          } catch (syncError) {
            console.error('[AuthView] SYNC: Failed to sync session:', syncError);
          }
        } else {
          console.warn(`[AuthView] SYNC: Skipping - sessionId=${result.sessionId}, setActive=${!!clerk.setActive}`);
        }

        console.log(`[AuthView] SUCCESS: Calling onSuccess callback`);
        onSuccess?.();
      } catch (err) {
        const error = err as Error;
        console.log(`[AuthView] ERROR: ${error.message}`);

        // Handle "User is already signed in" error - this means native SDK has session but JS SDK doesn't know
        // This can happen when JS SDK failed to initialize (e.g., dev auth error) but native SDK has valid session
        if (error.message?.includes('already signed in')) {
          console.log(
            '[AuthView] ALREADY_SIGNED_IN: Native SDK reports user already signed in, fetching native session...',
          );
          authCompletedRef.current = true;

          // Get the session from native SDK and sync to JS
          // Native getSession returns { sessionId: "...", user: {...} } at top level
          if (ClerkExpo?.getSession && clerk.setActive) {
            try {
              const nativeSession = await ClerkExpo.getSession();
              console.log(`[AuthView] ALREADY_SIGNED_IN: Native session:`, JSON.stringify(nativeSession));
              if (nativeSession?.sessionId) {
                const sessionId = nativeSession.sessionId;
                console.log('[AuthView] ALREADY_SIGNED_IN: Syncing via setActive:', sessionId);
                await clerk.setActive({ session: sessionId });
                console.log('[AuthView] ALREADY_SIGNED_IN: JS SDK state synced');
                onSuccess?.();
                return;
              }
            } catch (syncErr) {
              console.error('[AuthView] ALREADY_SIGNED_IN: Failed to sync native session:', syncErr);
            }
          }
        }

        console.error('[AuthView] ERROR: Auth error:', err);
        onError?.(error);
      }
    };

    presentModal();
  }, [mode, isDismissable, clerk, onSuccess, onError, isSignedIn]);

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
