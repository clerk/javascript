import { useCallback, useEffect, useRef } from 'react';
import { Platform, Text, View } from 'react-native';

import { CLERK_CLIENT_JWT_KEY } from '../constants';
import { getClerkInstance } from '../provider/singleton';
import { tokenCache } from '../token-cache';
import NativeClerkAuthView from '../specs/NativeClerkAuthView';
import NativeClerkModule from '../specs/NativeClerkModule';
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
    if (nativeClientToken) {
      await tokenCache?.saveToken(CLERK_CLIENT_JWT_KEY, nativeClientToken);
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

    try {
      await syncNativeSession(sessionId);
      authCompletedRef.current = true;
    } catch (err) {
      console.error('[AuthView] Failed to sync session:', err);
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

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
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
