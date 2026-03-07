import { useEffect, useState } from 'react';
import { NativeEventEmitter, Platform } from 'react-native';

import NativeClerkModule from '../specs/NativeClerkModule';

// Check if native module is supported on this platform
const isNativeSupported = Platform.OS === 'ios' || Platform.OS === 'android';

// Get the native module for event listening
let ClerkExpo: typeof NativeClerkModule | null = null;

if (isNativeSupported) {
  try {
    ClerkExpo = NativeClerkModule;
  } catch {
    // Native module not available - plugin not configured
    ClerkExpo = null;
  }
}

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
    console.log(`[useNativeAuthEvents] INIT: isNativeSupported=${isNativeSupported}, ClerkExpo=${!!ClerkExpo}`);

    if (!isNativeSupported || !ClerkExpo) {
      console.log(`[useNativeAuthEvents] SKIP: Native not supported or ClerkExpo not available`);
      return;
    }

    let subscription: { remove: () => void } | null = null;

    try {
      console.log(`[useNativeAuthEvents] SETUP: Creating NativeEventEmitter for ClerkExpo`);
      const eventEmitter = new NativeEventEmitter(ClerkExpo as any);

      console.log(`[useNativeAuthEvents] LISTEN: Adding listener for 'onAuthStateChange' events`);
      subscription = eventEmitter.addListener('onAuthStateChange', (event: NativeAuthStateEvent) => {
        console.log('[useNativeAuthEvents] EVENT_RECEIVED:', JSON.stringify(event));
        setNativeAuthState(event);
      });
      console.log(`[useNativeAuthEvents] LISTEN: Listener added successfully`);
    } catch (error) {
      console.log('[useNativeAuthEvents] ERROR: Could not set up event listener:', error);
    }

    return () => {
      console.log(`[useNativeAuthEvents] CLEANUP: Removing event listener`);
      subscription?.remove();
    };
  }, []);

  return {
    nativeAuthState,
    isSupported: isNativeSupported && !!ClerkExpo,
  };
}
