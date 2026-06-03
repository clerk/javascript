import { useEffect, useState } from 'react';
import { NativeEventEmitter } from 'react-native';

import { ClerkExpoModule as ClerkExpo, isNativeSupported } from '../utils/native-module';

/**
 * Local marker for a native client event.
 */
interface NativeClientEvent {
  issuedAt: number;
}

interface UseNativeClientEventsReturn {
  nativeClientEvent: NativeClientEvent | null;
}

/**
 * Listens for native client events that should sync JS client state.
 */
export function useNativeClientEvents(): UseNativeClientEventsReturn {
  const [nativeClientEvent, setNativeClientEvent] = useState<NativeClientEvent | null>(null);

  useEffect(() => {
    if (!isNativeSupported || !ClerkExpo) {
      return;
    }

    let subscription: { remove: () => void } | null = null;

    try {
      const eventEmitter = new NativeEventEmitter(ClerkExpo);

      subscription = eventEmitter.addListener('refreshClient', () => {
        setNativeClientEvent({ issuedAt: Date.now() });
      });
    } catch (error) {
      if (__DEV__) {
        console.error('[useNativeClientEvents] Failed to set up event listener:', error);
      }
    }

    return () => {
      subscription?.remove();
    };
  }, []);

  return {
    nativeClientEvent,
  };
}
