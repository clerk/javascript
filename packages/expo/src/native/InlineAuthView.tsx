import { ClerkRuntimeError } from '@clerk/shared/error';
import { useCallback, useRef } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { CLERK_CLIENT_JWT_KEY } from '../constants';
import { getClerkInstance } from '../provider/singleton';
import NativeClerkAuthView from '../specs/NativeClerkAuthView';
import NativeClerkModule from '../specs/NativeClerkModule';
import { tokenCache } from '../token-cache';
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
      if (ClerkExpoModule?.getClientToken) {
        const nativeClientToken = await ClerkExpoModule.getClientToken();
        if (nativeClientToken) {
          await tokenCache?.saveToken(CLERK_CLIENT_JWT_KEY, nativeClientToken);
        }
      }

      const clerkInstance = getClerkInstance();
      if (!clerkInstance) {
        throw new ClerkRuntimeError(
          'Clerk instance is not available. Ensure <ClerkProvider> is mounted before using <InlineAuthView>.',
          { code: 'clerk_instance_not_available' },
        );
      }

      const clerkRecord = clerkInstance as unknown as Record<string, unknown>;
      if (typeof clerkRecord.__internal_reloadInitialResources === 'function') {
        await (clerkRecord.__internal_reloadInitialResources as () => Promise<void>)();
      }

      if (typeof clerkInstance.setActive === 'function') {
        await clerkInstance.setActive({ session: sessionId });
      }

      authCompletedRef.current = true;
    } catch (err) {
      if (__DEV__) {
        console.error('[InlineAuthView] Failed to sync session:', err);
      }
    }
  }, []);

  const handleAuthEvent = useCallback(
    async (event: { nativeEvent: { type: string; data: string } }) => {
      const { type, data: rawData } = event.nativeEvent;
      if (__DEV__) {
        console.log('[InlineAuthView] onAuthEvent:', type, rawData);
      }
      const data: Record<string, any> = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

      if (type === 'signInCompleted' || type === 'signUpCompleted') {
        const sessionId = data?.sessionId;
        if (sessionId) {
          await syncSession(sessionId);
        } else if (__DEV__) {
          console.warn('[InlineAuthView] Auth event received but no sessionId in data:', data);
        }
      }
    },
    [syncSession],
  );

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
