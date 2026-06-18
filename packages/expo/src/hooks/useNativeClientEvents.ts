import { useEffect, useState } from 'react';
import { DeviceEventEmitter, Platform } from 'react-native';

import { ClerkExpoModule as ClerkExpo, isNativeSupported } from '../utils/native-module';

const nativeClientChangedEvent = 'clerkNativeClientChanged';

export interface NativeClientSnapshot {
  clientToken?: string | null;
  sourceId?: string | null;
}

/**
 * Local marker for a native client event.
 */
export interface NativeClientEvent extends NativeClientSnapshot {
  issuedAt: number;
}

interface UseNativeClientEventsReturn {
  nativeClientEvent: NativeClientEvent | null;
}

type RefreshClientEventSubscription = {
  remove: () => void;
};

type RefreshClientEventEmitter = {
  addListener: (
    eventName: typeof nativeClientChangedEvent,
    listener: (snapshot?: NativeClientSnapshot) => void,
  ) => RefreshClientEventSubscription;
};

function getNativeClientEventEmitter(): RefreshClientEventEmitter | null {
  if (Platform.OS === 'ios') {
    return DeviceEventEmitter;
  }

  if (ClerkExpo && typeof ClerkExpo.addListener === 'function') {
    return ClerkExpo as RefreshClientEventEmitter;
  }

  return null;
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
      const eventEmitter = getNativeClientEventEmitter();

      if (!eventEmitter) {
        return;
      }

      subscription = eventEmitter.addListener(nativeClientChangedEvent, snapshot => {
        setNativeClientEvent({ issuedAt: Date.now(), ...snapshot });
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
