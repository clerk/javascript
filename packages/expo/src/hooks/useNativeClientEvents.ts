import { useEffect, useState } from 'react';

import { ClerkExpoModule as ClerkExpo, isNativeSupported } from '../utils/native-module';

const nativeClientChangedEvent = 'clerkNativeClientChanged';

export interface NativeClientSnapshot {
  changed: {
    client: boolean;
    deviceToken: boolean;
  };
  deviceToken: string | null;
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
  if (ClerkExpo && typeof ClerkExpo.addListener === 'function') {
    return ClerkExpo as RefreshClientEventEmitter;
  }

  return null;
}

function isNativeClientSnapshot(snapshot: NativeClientSnapshot | undefined): snapshot is NativeClientSnapshot {
  return (
    typeof snapshot?.changed?.client === 'boolean' &&
    typeof snapshot.changed.deviceToken === 'boolean' &&
    (typeof snapshot.deviceToken === 'string' || snapshot.deviceToken === null)
  );
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
        if (!isNativeClientSnapshot(snapshot)) {
          return;
        }

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
