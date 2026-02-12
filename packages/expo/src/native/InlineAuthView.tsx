import { requireNativeModule, requireNativeViewManager, Platform } from 'expo-modules-core';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, type ViewStyle, type StyleProp } from 'react-native';

import { getClerkInstance } from '../provider/singleton';
import type { AuthViewMode } from './AuthView.types';

// Check if native module is supported on this platform
const isNativeSupported = Platform.OS === 'ios' || Platform.OS === 'android';

// Token cache key used by the Clerk JS SDK (must match createClerkInstance.ts)
const CLERK_CLIENT_JWT_KEY = '__clerk_client_jwt';

// Get the native view component for inline rendering
let NativeAuthView: any = null;
let ClerkExpoModule: {
  getSession(): Promise<{ sessionId?: string } | null>;
  getClientToken(): Promise<string | null>;
} | null = null;
if (isNativeSupported) {
  try {
    NativeAuthView = requireNativeViewManager('ClerkExpo', 'ClerkAuthExpoView');
  } catch {
    NativeAuthView = null;
  }
  try {
    ClerkExpoModule = requireNativeModule('ClerkExpo');
  } catch {
    ClerkExpoModule = null;
  }
}

export interface InlineAuthViewProps {
  /**
   * Authentication mode that determines which flows are available.
   * @default 'signInOrUp'
   */
  mode?: AuthViewMode;

  /**
   * Whether the authentication view can be dismissed by the user.
   * @default true
   */
  isDismissable?: boolean;

  /**
   * Callback fired when authentication completes successfully.
   * After this callback, all `@clerk/expo` hooks will reflect the authenticated state.
   */
  onSuccess?: () => void;

  /**
   * Callback fired when an error occurs during authentication.
   */
  onError?: (error: Error) => void;

  /**
   * Style applied to the container view.
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * An inline native authentication component that renders in-place (not as a modal).
 *
 * Unlike `AuthView` which presents a full-screen modal, `InlineAuthView` renders
 * directly within your React Native view hierarchy, allowing you to embed the
 * native authentication UI anywhere in your layout.
 *
 * @example
 * ```tsx
 * import { InlineAuthView } from '@clerk/expo/native';
 *
 * export default function SignInScreen() {
 *   return (
 *     <View style={{ flex: 1 }}>
 *       <Text style={{ fontSize: 24, padding: 16 }}>Welcome</Text>
 *       <InlineAuthView
 *         style={{ flex: 1 }}
 *         onSuccess={() => router.replace('/home')}
 *       />
 *     </View>
 *   );
 * }
 * ```
 */
export function InlineAuthView({
  mode = 'signInOrUp',
  isDismissable = true,
  onSuccess,
  onError: _onError,
  style,
}: InlineAuthViewProps) {
  const authCompletedRef = useRef(false);

  const syncSession = useCallback(
    async (sessionId: string) => {
      if (authCompletedRef.current) return;
      authCompletedRef.current = true;

      console.log('[InlineAuthView] Syncing session:', sessionId);
      try {
        // The native SDK (clerk-ios/clerk-android) and JS SDK (clerk-js) use separate
        // Clerk API clients. The native session won't appear in the JS client's sessions.
        // To fix this, we copy the native client's bearer token to the JS SDK's token cache
        // so both SDKs use the same Clerk API client.
        if (ClerkExpoModule?.getClientToken) {
          const nativeClientToken = await ClerkExpoModule.getClientToken();
          if (nativeClientToken) {
            console.log('[InlineAuthView] Got native client token, syncing to JS SDK...');
            await SecureStore.setItemAsync(CLERK_CLIENT_JWT_KEY, nativeClientToken, {
              keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
            });
          }
        }

        // Get the raw Clerk instance (not IsomorphicClerk from useClerk())
        // because __internal_reloadInitialResources is stripped from IsomorphicClerk
        const clerkInstance = getClerkInstance()!;
        const clerkAny = clerkInstance as any;

        // Reload the client from the API - now using the native client's token,
        // so the JS SDK will see the same sessions as the native SDK
        if (typeof clerkAny.__internal_reloadInitialResources === 'function') {
          await clerkAny.__internal_reloadInitialResources();
          console.log('[InlineAuthView] Resources reloaded with native client token');
        }

        if (clerkInstance?.setActive) {
          await clerkInstance.setActive({ session: sessionId });
          console.log('[InlineAuthView] Session synced successfully');
        }
      } catch (err) {
        console.error('[InlineAuthView] Failed to sync session:', err);
      }

      onSuccess?.();
    },
    [onSuccess],
  );

  // Handle native events from the ExpoView bridge
  const handleAuthEvent = useCallback(
    async (event: { nativeEvent: { type: string; data: Record<string, any> } }) => {
      const { type, data } = event.nativeEvent;
      console.log('[InlineAuthView] Native event:', type, data);

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
  // This handles cases where the native event bridge doesn't fire
  useEffect(() => {
    if (!ClerkExpoModule?.getSession) return;

    const interval = setInterval(async () => {
      if (authCompletedRef.current) {
        clearInterval(interval);
        return;
      }

      try {
        const session = await ClerkExpoModule!.getSession();
        if (session?.sessionId) {
          console.log('[InlineAuthView] Poll detected session:', session.sessionId);
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
            ? 'Native InlineAuthView is only available on iOS and Android'
            : 'Native InlineAuthView requires the @clerk/expo plugin. Add "@clerk/expo" to your app.json plugins array.'}
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
  },
  text: {
    fontSize: 16,
    color: '#666',
  },
});
