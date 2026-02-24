import { useAuth } from '@clerk/react';
import { Platform, requireNativeModule, requireNativeViewManager } from 'expo-modules-core';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useRef } from 'react';
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
let ClerkExpo: ClerkExpoModule | null = null;
if (isNativeSupported) {
  try {
    ClerkExpo = requireNativeModule('ClerkExpo');
  } catch {
    ClerkExpo = null;
  }
}

// Get the native view component for inline rendering
let NativeAuthView: any = null;
if (isNativeSupported) {
  try {
    NativeAuthView = requireNativeViewManager('ClerkExpo', 'ClerkAuthExpoView');
  } catch {
    NativeAuthView = null;
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
    />
  );
}

// MARK: - Modal Presentation

function ModalPresentation({
  mode,
  isDismissable,
  onSuccess,
  onError,
}: Pick<AuthViewProps, 'mode' | 'isDismissable' | 'onSuccess' | 'onError'>) {
  const { isSignedIn } = useAuth();
  const authCompletedRef = useRef(false);
  const initialSignedInRef = useRef(isSignedIn);
  const hasStartedRef = useRef(false);

  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

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
          const nativeSession = await ClerkExpo.getSession();
          const sessionId = nativeSession?.sessionId;
          if (sessionId) {
            authCompletedRef.current = true;
            await syncNativeSession(sessionId);
            onSuccessRef.current?.();
            return;
          }
        } catch {
          // Failed to check native session, continue to present modal
        }
      }

      try {
        const result = await ClerkExpo.presentAuth({
          mode: mode ?? 'signInOrUp',
          dismissable: isDismissable ?? true,
        });

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

        hasStartedRef.current = false;
      } catch (err) {
        const error = err as Error & { code?: string };

        if (isAlreadySignedInError(error)) {
          authCompletedRef.current = true;

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
    async (event: { nativeEvent: { type: string; data: Record<string, any> } }) => {
      const { type, data } = event.nativeEvent;

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
        const session = await ClerkExpo.getSession();
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

  if (!isNativeSupported || !NativeAuthView) {
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
    <NativeAuthView
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
