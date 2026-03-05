import { ClerkRuntimeError } from '@clerk/shared/error';
import { useCallback, useRef } from 'react';
import { Platform, Text, View } from 'react-native';

import { CLERK_CLIENT_JWT_KEY } from '../constants';
import { getClerkInstance } from '../provider/singleton';
import NativeClerkAuthView from '../specs/NativeClerkAuthView';
import NativeClerkModule from '../specs/NativeClerkModule';
import { tokenCache } from '../token-cache';
import type { AuthViewProps } from './AuthView.types';

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

export async function syncNativeSession(sessionId: string): Promise<void> {
  // Copy the native client's bearer token to the JS SDK's token cache
  if (ClerkExpo?.getClientToken) {
    const nativeClientToken = await ClerkExpo.getClientToken();
    if (__DEV__) {
      console.log(
        '[syncNativeSession] getClientToken:',
        nativeClientToken ? `${nativeClientToken.slice(0, 20)}...` : 'null',
      );
    }
    if (nativeClientToken) {
      await tokenCache?.saveToken(CLERK_CLIENT_JWT_KEY, nativeClientToken);
    }
  }

  const clerkInstance = getClerkInstance();
  if (!clerkInstance) {
    throw new ClerkRuntimeError(
      'Clerk instance is not available. Ensure <ClerkProvider> is mounted before using <AuthView>.',
      { code: 'clerk_instance_not_available' },
    );
  }

  // Reload resources using the native client's token
  const clerkRecord = clerkInstance as unknown as Record<string, unknown>;
  if (typeof clerkRecord.__internal_reloadInitialResources === 'function') {
    if (__DEV__) {
      console.log('[syncNativeSession] reloading initial resources...');
    }
    await (clerkRecord.__internal_reloadInitialResources as () => Promise<void>)();
    if (__DEV__) {
      console.log('[syncNativeSession] reload complete');
    }
  }

  if (typeof clerkInstance.setActive === 'function') {
    if (__DEV__) {
      console.log('[syncNativeSession] calling setActive with session:', sessionId);
    }
    await clerkInstance.setActive({ session: sessionId });
    if (__DEV__) {
      console.log('[syncNativeSession] setActive complete');
    }
  }
}

/**
 * A pre-built native authentication component that handles sign-in and sign-up flows.
 *
 * `AuthView` renders inline within your React Native view hierarchy, powered by:
 * - **iOS**: clerk-ios (SwiftUI) - https://github.com/clerk/clerk-ios
 * - **Android**: clerk-android (Jetpack Compose) - https://github.com/clerk/clerk-android
 *
 * After authentication completes, the session is automatically synced with the JS SDK.
 * Use `useAuth()`, `useUser()`, or `useSession()` in a `useEffect` to react to state changes.
 *
 * @example
 * ```tsx
 * import { AuthView } from '@clerk/expo/native';
 * import { useAuth } from '@clerk/expo';
 *
 * export default function SignInScreen() {
 *   const { isSignedIn } = useAuth();
 *
 *   useEffect(() => {
 *     if (isSignedIn) router.replace('/home');
 *   }, [isSignedIn]);
 *
 *   return <AuthView />;
 * }
 * ```
 *
 * @see {@link https://clerk.com/docs/components/authentication/sign-in} Clerk Sign-In Documentation
 */
export function AuthView({ mode = 'signInOrUp', isDismissable = false }: AuthViewProps) {
  const authCompletedRef = useRef(false);

  const syncSession = useCallback(async (sessionId: string) => {
    if (authCompletedRef.current) {
      return;
    }

    if (__DEV__) {
      console.log('[AuthView] syncSession called with sessionId:', sessionId);
    }

    try {
      await syncNativeSession(sessionId);
      authCompletedRef.current = true;
      if (__DEV__) {
        console.log('[AuthView] syncSession succeeded');
      }
    } catch (err) {
      if (__DEV__) {
        console.error('[AuthView] Failed to sync session:', err);
      }
    }
  }, []);

  const handleAuthEvent = useCallback(
    async (event: { nativeEvent: { type: string; data: string } }) => {
      const { type, data: rawData } = event.nativeEvent;
      if (__DEV__) {
        console.log('[AuthView] onAuthEvent:', type, rawData);
      }
      const data: Record<string, any> = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

      if (type === 'signInCompleted' || type === 'signUpCompleted') {
        const sessionId = data?.sessionId;
        if (sessionId) {
          await syncSession(sessionId);
        } else if (__DEV__) {
          console.warn('[AuthView] Auth event received but no sessionId in data:', data);
        }
      }
    },
    [syncSession],
  );

  if (!isNativeSupported || !NativeClerkAuthView) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: '#666' }}>
          {!isNativeSupported
            ? 'Native AuthView is only available on iOS and Android'
            : 'Native AuthView requires the @clerk/expo plugin. Add "@clerk/expo" to your app.json plugins array.'}
        </Text>
      </View>
    );
  }

  return (
    <NativeClerkAuthView
      style={{ flex: 1 }}
      mode={mode}
      isDismissable={isDismissable}
      onAuthEvent={handleAuthEvent}
    />
  );
}
