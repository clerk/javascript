import { useCallback, useEffect, useRef } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { CLERK_CLIENT_JWT_KEY } from '../constants';
import { getClerkInstance } from '../provider/singleton';
import { tokenCache } from '../token-cache';
import NativeClerkAuthView from '../specs/NativeClerkAuthView';
import NativeClerkModule from '../specs/NativeClerkModule';
import type { AuthViewMode } from './AuthView.types';

// Check if native module is supported on this platform
const isNativeSupported = Platform.OS === 'ios' || Platform.OS === 'android';

// Safely get the native module
let ClerkExpoModule: typeof NativeClerkModule | null = null;
if (isNativeSupported) {
  try {
    ClerkExpoModule = NativeClerkModule;
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
   * @default false
   */
  isDismissable?: boolean;
}

/**
 * An inline native authentication component that renders in-place.
 *
 * `InlineAuthView` renders directly within your React Native view hierarchy,
 * allowing you to embed the native authentication UI anywhere in your layout.
 *
 * After authentication completes, the session is automatically synced with the JS SDK.
 * Use `useAuth()`, `useUser()`, or `useSession()` in a `useEffect` to react to state changes.
 *
 * @example
 * ```tsx
 * import { InlineAuthView } from '@clerk/expo/native';
 * import { useAuth } from '@clerk/expo';
 *
 * export default function SignInScreen() {
 *   const { isSignedIn } = useAuth();
 *
 *   useEffect(() => {
 *     if (isSignedIn) router.replace('/home');
 *   }, [isSignedIn]);
 *
 *   return (
 *     <View style={{ flex: 1 }}>
 *       <Text style={{ fontSize: 24, padding: 16 }}>Welcome</Text>
 *       <InlineAuthView />
 *     </View>
 *   );
 * }
 * ```
 */
export function InlineAuthView({ mode = 'signInOrUp', isDismissable = false }: InlineAuthViewProps) {
  const authCompletedRef = useRef(false);

  const syncSession = useCallback(async (sessionId: string) => {
    if (authCompletedRef.current) {
      return;
    }

    try {
      // The native SDK (clerk-ios/clerk-android) and JS SDK (clerk-js) use separate
      // Clerk API clients. The native session won't appear in the JS client's sessions.
      // To fix this, we copy the native client's bearer token to the JS SDK's token cache
      // so both SDKs use the same Clerk API client.
      if (ClerkExpoModule?.getClientToken) {
        const nativeClientToken = await ClerkExpoModule.getClientToken();
        if (nativeClientToken) {
          await tokenCache?.saveToken(CLERK_CLIENT_JWT_KEY, nativeClientToken);
        }
      }

      // Get the raw Clerk instance (not IsomorphicClerk from useClerk())
      // because __internal_reloadInitialResources is stripped from IsomorphicClerk
      const clerkInstance = getClerkInstance();
      if (!clerkInstance) {
        throw new Error('[InlineAuthView] Clerk instance not available');
      }

      const clerkRecord = clerkInstance as unknown as Record<string, unknown>;

      // Reload the client from the API - now using the native client's token,
      // so the JS SDK will see the same sessions as the native SDK
      if (typeof clerkRecord.__internal_reloadInitialResources === 'function') {
        await (clerkRecord.__internal_reloadInitialResources as () => Promise<void>)();
      }

      if (typeof clerkInstance.setActive === 'function') {
        await clerkInstance.setActive({ session: sessionId });
      }

      // Mark complete only after successful sync to allow retries on transient failures
      authCompletedRef.current = true;
    } catch (err) {
      console.error('[InlineAuthView] Failed to sync session:', err);
    }
  }, []);

  // Handle native events from the view bridge
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
  // This handles cases where the native event bridge doesn't fire
  useEffect(() => {
    if (!ClerkExpoModule?.getSession) {
      return;
    }

    const interval = setInterval(async () => {
      if (authCompletedRef.current) {
        clearInterval(interval);
        return;
      }

      try {
        const session = (await ClerkExpoModule.getSession()) as { sessionId?: string } | null;
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
      <View style={[styles.container, styles.fallback]}>
        <Text style={styles.text}>
          {!isNativeSupported
            ? 'Native InlineAuthView is only available on iOS and Android'
            : 'Native InlineAuthView requires the @clerk/expo plugin. Add "@clerk/expo" to your app.json plugins array.'}
        </Text>
      </View>
    );
  }

  return (
    <NativeClerkAuthView
      style={styles.container}
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
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    color: '#666',
  },
});
