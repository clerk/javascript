import { useEffect, useState } from 'react';
import { NativeEventEmitter } from 'react-native';

import { ClerkExpoModule as ClerkExpo, isNativeSupported } from '../utils/native-module';

/**
 * Auth state change event from native SDK
 */
export interface NativeAuthStateEvent {
  type: 'signedIn' | 'signedOut';
  sessionId: string | null;
}

export interface UseNativeAuthEventsReturn {
  /**
   * The latest auth state event from the native SDK.
   * Will be null until an event is received.
   */
  nativeAuthState: NativeAuthStateEvent | null;

  /**
   * Whether native event listening is supported (plugin installed)
   */
  isSupported: boolean;
}

/**
 * Hook to listen for auth state change events from the native Clerk SDK.
 *
 * This provides reactive updates when the user signs in or out via native UI.
 * Events are emitted by the native module when:
 * - User completes sign-in (signInCompleted event from clerk-ios/clerk-android)
 * - User completes sign-up (signUpCompleted event from clerk-ios/clerk-android)
 * - User signs out (signedOut event from clerk-ios/clerk-android)
 *
 * @example
 * ```tsx
 * import { useNativeAuthEvents } from '@clerk/expo';
 *
 * function MyComponent() {
 *   const { nativeAuthState, isSupported } = useNativeAuthEvents();
 *
 *   useEffect(() => {
 *     if (nativeAuthState?.type === 'signedIn') {
 *       console.log('User signed in via native UI');
 *     } else if (nativeAuthState?.type === 'signedOut') {
 *       console.log('User signed out via native UI');
 *     }
 *   }, [nativeAuthState]);
 *
 *   return <AuthUI />;
 * }
 * ```
 */
export function useNativeAuthEvents(): UseNativeAuthEventsReturn {
  const [nativeAuthState, setNativeAuthState] = useState<NativeAuthStateEvent | null>(null);

  useEffect(() => {
    if (!isNativeSupported || !ClerkExpo) {
      return;
    }

    let subscription: { remove: () => void } | null = null;

    try {
      const eventEmitter = new NativeEventEmitter(ClerkExpo as any);

      subscription = eventEmitter.addListener('onAuthStateChange', (event: NativeAuthStateEvent) => {
        if (__DEV__) {
          console.log('[useNativeAuthEvents] onAuthStateChange:', JSON.stringify(event));
        }
        setNativeAuthState(event);
      });
    } catch (error) {
      if (__DEV__) {
        console.error('[useNativeAuthEvents] Failed to set up event listener:', error);
      }
    }

    return () => {
      subscription?.remove();
    };
  }, []);

  return {
    nativeAuthState,
    isSupported: isNativeSupported && !!ClerkExpo,
  };
}
