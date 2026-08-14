import type { NativeClientEvent } from '../hooks/useNativeClientEvents';

type NativeToJsSyncHandler = (nativeClientEvent?: NativeClientEvent | null) => Promise<void>;

type NativeToJsSyncRegistration = {
  handler: NativeToJsSyncHandler;
  pendingEventSyncs: Set<Promise<void>>;
  pendingExplicitSync: Promise<void> | null;
  explicitSyncRequestGeneration: number;
  explicitSyncCompletedGeneration: number;
};

const pendingJsToNativeSyncs = new Set<Promise<void>>();
let jsToNativeSyncGeneration = 0;
let latestSettledJsToNativeSyncGeneration = 0;
let latestJsToNativeSyncFailure: { error: unknown; generation: number } | null = null;
let nativeToJsSyncRegistration: NativeToJsSyncRegistration | null = null;

function removePendingSync(pendingSyncs: Set<Promise<void>>, sync: Promise<void>): void {
  pendingSyncs.delete(sync);
}

export function trackPendingJsToNativeSync(sync: Promise<unknown>): void {
  const generation = ++jsToNativeSyncGeneration;
  const trackedSync = sync.then(
    () => {
      if (generation >= latestSettledJsToNativeSyncGeneration) {
        latestSettledJsToNativeSyncGeneration = generation;
        latestJsToNativeSyncFailure = null;
      }
    },
    error => {
      if (generation >= latestSettledJsToNativeSyncGeneration) {
        latestSettledJsToNativeSyncGeneration = generation;
        latestJsToNativeSyncFailure = { error, generation };
      }
    },
  );

  pendingJsToNativeSyncs.add(trackedSync);
  void trackedSync.then(() => pendingJsToNativeSyncs.delete(trackedSync));
}

export async function waitForPendingJsToNativeSync(): Promise<void> {
  while (pendingJsToNativeSyncs.size > 0) {
    await Promise.all(pendingJsToNativeSyncs);
  }

  if (latestJsToNativeSyncFailure) {
    throw latestJsToNativeSyncFailure.error;
  }
}

export function registerNativeToJsSyncHandler(handler: NativeToJsSyncHandler): () => void {
  const registration = {
    handler,
    pendingEventSyncs: new Set<Promise<void>>(),
    pendingExplicitSync: null,
    explicitSyncRequestGeneration: 0,
    explicitSyncCompletedGeneration: 0,
  };
  nativeToJsSyncRegistration = registration;

  return () => {
    if (nativeToJsSyncRegistration === registration) {
      nativeToJsSyncRegistration = null;
    }
  };
}

export function synchronizeNativeClientToJs(nativeClientEvent?: NativeClientEvent | null): Promise<void> {
  const registration = nativeToJsSyncRegistration;
  if (!registration) {
    return Promise.reject(new Error('Native Clerk client synchronization is not available.'));
  }

  if (nativeClientEvent) {
    if (registration.pendingExplicitSync) {
      registration.explicitSyncRequestGeneration += 1;
      return registration.pendingExplicitSync;
    }

    const sync = Promise.resolve().then(() => registration.handler(nativeClientEvent));
    registration.pendingEventSyncs.add(sync);
    void sync.then(
      () => removePendingSync(registration.pendingEventSyncs, sync),
      () => removePendingSync(registration.pendingEventSyncs, sync),
    );
    return sync;
  }

  registration.explicitSyncRequestGeneration += 1;
  if (registration.pendingExplicitSync) {
    return registration.pendingExplicitSync;
  }

  const pendingEvents = [...registration.pendingEventSyncs];
  const sync = (async () => {
    await Promise.all(pendingEvents.map(pendingEvent => pendingEvent.catch(() => undefined)));

    let firstError: unknown;
    let didFail = false;
    while (registration.explicitSyncCompletedGeneration < registration.explicitSyncRequestGeneration) {
      const generation = registration.explicitSyncRequestGeneration;
      try {
        await registration.handler();
      } catch (error) {
        if (!didFail) {
          firstError = error;
          didFail = true;
        }
      }
      registration.explicitSyncCompletedGeneration = generation;
    }

    registration.pendingExplicitSync = null;

    if (didFail) {
      throw firstError;
    }
  })();
  registration.pendingExplicitSync = sync;
  return sync;
}
