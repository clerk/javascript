import { useAuth } from '@clerk/react';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useRef } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { getClerkInstance } from '../provider/singleton';
import NativeClerkAuthView from '../specs/NativeClerkAuthView';
import NativeClerkModule from '../specs/NativeClerkModule';
import type { AuthViewProps } from './AuthView.types';

// Token cache key used by the Clerk JS SDK (must match createClerkInstance.ts)
const CLERK_CLIENT_JWT_KEY = '__clerk_client_jwt';

// Check if native module is supported on this platform
const isNativeSupported = Platform.OS === 'ios' || Platform.OS === 'android';

// Safely get the native module
let ClerkExpo: typeof NativeClerkModule | null = null;
if (isNativeSupported) {
  try {
    ClerkExpo = NativeClerkModule;
  } catch {
    ClerkExpo = null;
  }
}

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

/**
 * A pre-built native authentication component that handles sign-in and sign-up flows.
 *
 * `AuthView` presents a comprehensive, native UI for authentication powered by:
 * - **iOS**: clerk-ios (SwiftUI) - https://github.com/clerk/clerk-ios
 * - **Android**: clerk-android (Jetpack Compose) - https://github.com/clerk/clerk-android
 *
 * @example Modal presentation (default)
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
 * @example Inline presentation
 * ```tsx
 * <AuthView
 *   presentation="inline"
 *   style={{ flex: 1 }}
 *   onSuccess={() => router.replace('/home')}
 * />
 * ```
 *
 * @see {@link https://clerk.com/docs/components/authentication/sign-in} Clerk Sign-In Documentation
 */
export function AuthView({
  presentation = 'modal',
  mode = 'signInOrUp',
  isDismissable = true,
  onSuccess,
  onError,
  onDismiss,
  style,
}: AuthViewProps) {
  if (presentation === 'inline') {
    return (
      <InlinePresentation
        mode={mode}
        isDismissable={isDismissable}
        onSuccess={onSuccess}
        onError={onError}
        style={style}
      />
    );
  }

  return (
    <ModalPresentation
      mode={mode}
      isDismissable={isDismissable}
      onSuccess={onSuccess}
      onError={onError}
      onDismiss={onDismiss}
    />
  );
}

// MARK: - Modal Presentation

function ModalPresentation({
  mode,
  isDismissable,
  onSuccess,
  onError,
  onDismiss,
}: Pick<AuthViewProps, 'mode' | 'isDismissable' | 'onSuccess' | 'onError' | 'onDismiss'>) {
  const { isSignedIn } = useAuth();
  const authCompletedRef = useRef(false);
  const initialSignedInRef = useRef(isSignedIn);
  const hasStartedRef = useRef(false);

  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (!isNativeSupported || !ClerkExpo?.presentAuth) {
      return;
    }

    if (authCompletedRef.current) {
      return;
    }

    if (hasStartedRef.current) {
      return;
    }

    if (initialSignedInRef.current && isSignedIn) {
      authCompletedRef.current = true;
      onSuccessRef.current?.();
      return;
    }

    if (isSignedIn && !initialSignedInRef.current) {
      return;
    }

    hasStartedRef.current = true;

    const presentModal = async () => {
      if (ClerkExpo?.getSession) {
        try {
          const nativeSession = (await ClerkExpo.getSession()) as { sessionId?: string } | null;
          const sessionId = nativeSession?.sessionId;
          if (sessionId) {
            if (isSignedIn) {
              // JS SDK agrees we're signed in — sync native session and complete
              authCompletedRef.current = true;
              await syncNativeSession(sessionId);
              onSuccessRef.current?.();
              return;
            }
            // JS SDK is signed out but native has a stale session — clear it
            try {
              await ClerkExpo.signOut?.();
            } catch {
              // Best effort
            }
          }
        } catch {
          // Failed to check native session, continue to present modal
        }
      }

      try {
        const result = (await ClerkExpo.presentAuth({
          mode: mode ?? 'signInOrUp',
          dismissable: isDismissable ?? true,
        })) as { sessionId?: string };

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

        // Modal was dismissed without completing auth (resolved with no sessionId)
        hasStartedRef.current = false;
        onDismissRef.current?.();
      } catch (err) {
        const error = err as Error & { code?: string };

        if (isAlreadySignedInError(error)) {
          authCompletedRef.current = true;

          if (ClerkExpo?.getSession) {
            try {
              const nativeSession = (await ClerkExpo.getSession()) as { sessionId?: string } | null;
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

        // Modal was dismissed (native promise rejected) — reset so remounting works
        hasStartedRef.current = false;
        onDismissRef.current?.();
        onErrorRef.current?.(error);
      }
    };

    presentModal();
  }, [mode, isDismissable, isSignedIn]);

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

  return null;
}

// MARK: - Inline Presentation

function InlinePresentation({
  mode,
  isDismissable,
  onSuccess,
  onError,
  style,
}: Pick<AuthViewProps, 'mode' | 'isDismissable' | 'onSuccess' | 'onError' | 'style'>) {
  const authCompletedRef = useRef(false);

  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const syncSession = useCallback(async (sessionId: string) => {
    if (authCompletedRef.current) {
      return;
    }

    try {
      await syncNativeSession(sessionId);
      authCompletedRef.current = true;
      onSuccessRef.current?.();
    } catch (err) {
      console.error('[AuthView] Failed to sync session:', err);
      onErrorRef.current?.(err as Error);
    }
  }, []);

  const handleAuthEvent = useCallback(
    async (event: { nativeEvent: { type: string; data: string } }) => {
      const { type, data: rawData } = event.nativeEvent;
      const data: Record<string, any> = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

      if (type === 'signInCompleted' || type === 'signUpCompleted') {
        const sessionId = data?.sessionId;
        if (sessionId) {
          await syncSession(sessionId);
        }
      }
    },
    [syncSession],
  );

  // Fallback: poll native session to detect auth completion
  useEffect(() => {
    if (!ClerkExpo?.getSession) {
      return;
    }

    const interval = setInterval(async () => {
      if (authCompletedRef.current) {
        clearInterval(interval);
        return;
      }

      try {
        const session = (await ClerkExpo.getSession()) as { sessionId?: string } | null;
        if (session?.sessionId) {
          clearInterval(interval);
          await syncSession(session.sessionId);
        }
      } catch {
        // ignore polling errors
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [syncSession]);

  if (!isNativeSupported || !NativeClerkAuthView) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.text}>
          {!isNativeSupported
            ? 'Native AuthView is only available on iOS and Android'
            : 'Native AuthView requires the @clerk/expo plugin. Add "@clerk/expo" to your app.json plugins array.'}
        </Text>
      </View>
    );
  }

  return (
    <NativeClerkAuthView
      style={[styles.container, style]}
      mode={mode}
      isDismissable={isDismissable}
      onAuthEvent={handleAuthEvent}
    />
  );
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
