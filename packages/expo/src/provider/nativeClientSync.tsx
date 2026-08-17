import type { ClientJSONSnapshot, ClientResource, SignedInSessionResource } from '@clerk/shared/types';
import { type MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { MemoryTokenCache } from '../cache';
import type { TokenCache } from '../cache/types';
import { CLERK_CLIENT_JWT_KEY } from '../constants';
import { type NativeClientEvent, useNativeClientEvents } from '../hooks/useNativeClientEvents';
import { ClerkExpoModule as NativeClerkModule } from '../utils/native-module';

const tokenCacheReadTimeoutMs = 1_000;
const nativeDeviceTokenPollIntervalMs = 100;
const nativeDeviceTokenAvailabilityTimeoutMs = 3_000;
const nativeClientSyncSourceIdPrefix = 'clerk-expo-js-sync';
const unauthenticatedRecoveryCooldownMs = 5_000;

export type SyncableClerkInstance = {
  addListener?: (listener: () => void, options?: { skipInitialEmit?: boolean }) => () => void;
  addOnLoaded?: (listener: () => void) => void;
  client?: ClientResource;
  handleUnauthenticated?: (options?: { broadcast?: boolean }) => Promise<unknown>;
  loaded?: boolean;
  off?: (event: 'status', listener: (status: string) => void) => void;
  on?: (event: 'status', listener: (status: string) => void) => void;
  session?: SignedInSessionResource | null;
  status?: string;
  setActive?: (params: { session: SignedInSessionResource | string | null }) => Promise<void>;
  updateClient?: (client: ClientResource, options?: { __internal_dangerouslySkipEmit?: boolean }) => void;
  __internal_setActiveInProgress?: boolean;
  __internal_reloadInitialResources?: () => void | Promise<void>;
};

type RefreshableClientResource = ClientResource & {
  fetch?: (options?: { fetchMaxTries?: number }) => Promise<ClientResource>;
  fromJSON?: (data: ClientJSONSnapshot) => ClientResource;
};

type NativeRefreshFromJsOptions = {
  deviceToken?: string | null;
  didChangeClient: boolean;
  didChangeDeviceToken: boolean;
};

export type NativeRefreshFromJsController = {
  cancel: () => void;
  syncDeviceTokenToNative: (deviceToken: string | null) => void;
};

export type DeviceTokenCacheListener = (deviceToken: string | null) => void;

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function useSyncableTokenCache({
  suppressTokenCacheNotificationsRef,
  tokenCache,
  tokenCacheListenersRef,
}: {
  suppressTokenCacheNotificationsRef: MutableRefObject<number>;
  tokenCache: TokenCache | undefined;
  tokenCacheListenersRef: MutableRefObject<Set<DeviceTokenCacheListener>>;
}): TokenCache | undefined {
  return useMemo(() => {
    const effectiveTokenCache =
      tokenCache ?? (Platform.OS === 'ios' || Platform.OS === 'android' ? MemoryTokenCache : undefined);
    if (!effectiveTokenCache) {
      return undefined;
    }

    let hasKnownDeviceToken = false;
    let knownDeviceToken: string | null = null;

    const notifyDeviceTokenListeners = (deviceToken: string | null) => {
      if (suppressTokenCacheNotificationsRef.current > 0) {
        return;
      }

      for (const listener of tokenCacheListenersRef.current) {
        listener(deviceToken);
      }
    };

    return {
      getToken: async key => {
        const token = await effectiveTokenCache.getToken(key);
        if (key === CLERK_CLIENT_JWT_KEY && !hasKnownDeviceToken) {
          hasKnownDeviceToken = true;
          knownDeviceToken = token ?? null;
        }
        return token;
      },
      saveToken: async (key, token) => {
        await effectiveTokenCache.saveToken(key, token);
        if (key === CLERK_CLIENT_JWT_KEY) {
          const didChange = !hasKnownDeviceToken || knownDeviceToken !== token;
          hasKnownDeviceToken = true;
          knownDeviceToken = token;
          if (didChange) {
            notifyDeviceTokenListeners(token);
          }
        }
      },
      clearToken: async key => {
        await effectiveTokenCache.clearToken?.(key);
        if (key === CLERK_CLIENT_JWT_KEY) {
          const didChange = !hasKnownDeviceToken || knownDeviceToken !== null;
          hasKnownDeviceToken = true;
          knownDeviceToken = null;
          if (didChange) {
            notifyDeviceTokenListeners(null);
          }
        }
      },
    };
  }, [suppressTokenCacheNotificationsRef, tokenCache, tokenCacheListenersRef]);
}

async function readNativeDeviceToken({ waitForToken }: { waitForToken: boolean }): Promise<string | null> {
  const ClerkExpo = NativeClerkModule;
  if (!ClerkExpo?.getClientToken) {
    return null;
  }

  const startedAt = Date.now();
  let remainingMs = nativeDeviceTokenAvailabilityTimeoutMs;

  do {
    const nativeDeviceToken = await ClerkExpo.getClientToken();
    if (nativeDeviceToken) {
      return nativeDeviceToken;
    }

    if (!waitForToken) {
      return null;
    }

    remainingMs = nativeDeviceTokenAvailabilityTimeoutMs - (Date.now() - startedAt);
    if (remainingMs <= 0) {
      return null;
    }

    await delay(Math.min(nativeDeviceTokenPollIntervalMs, remainingMs));
  } while (remainingMs > 0);

  return null;
}

async function syncDeviceTokenToCache(tokenCache: TokenCache | undefined, deviceToken: string | null): Promise<void> {
  if (deviceToken) {
    await tokenCache?.saveToken(CLERK_CLIENT_JWT_KEY, deviceToken);
    return;
  }

  await tokenCache?.clearToken?.(CLERK_CLIENT_JWT_KEY);
}

async function syncDeviceTokenToCacheWithoutNotifying({
  deviceToken,
  suppressTokenCacheNotificationsRef,
  tokenCache,
}: {
  deviceToken: string | null;
  suppressTokenCacheNotificationsRef: MutableRefObject<number>;
  tokenCache: TokenCache | undefined;
}): Promise<void> {
  suppressTokenCacheNotificationsRef.current += 1;
  try {
    await syncDeviceTokenToCache(tokenCache, deviceToken);
  } finally {
    suppressTokenCacheNotificationsRef.current = Math.max(0, suppressTokenCacheNotificationsRef.current - 1);
  }
}

async function syncNativeDeviceTokenToCache({
  deviceToken,
  suppressTokenCacheNotificationsRef,
  tokenCache,
}: {
  deviceToken: string | null;
  suppressTokenCacheNotificationsRef?: MutableRefObject<number>;
  tokenCache: TokenCache | undefined;
}): Promise<void> {
  if (suppressTokenCacheNotificationsRef) {
    await syncDeviceTokenToCacheWithoutNotifying({
      deviceToken,
      suppressTokenCacheNotificationsRef,
      tokenCache,
    });
    return;
  }

  await syncDeviceTokenToCache(tokenCache, deviceToken);
}

function getDefaultSignedInSession(client: ClientResource | null | undefined): SignedInSessionResource | null {
  if (!client) {
    return null;
  }

  if (client.lastActiveSessionId) {
    const lastActiveSession = client.signedInSessions.find(session => session.id === client.lastActiveSessionId);
    if (lastActiveSession) {
      return lastActiveSession;
    }
  }

  return client.signedInSessions[0] ?? null;
}

function canRefreshJsClientFromServer(clerkInstance: SyncableClerkInstance): boolean {
  const client = clerkInstance.client as RefreshableClientResource | undefined;

  return typeof client?.fetch === 'function' && typeof clerkInstance.updateClient === 'function';
}

function fetchRefreshedJsClient(clerkInstance: SyncableClerkInstance): Promise<ClientResource | null> {
  const client = clerkInstance.client as RefreshableClientResource | undefined;

  if (typeof client?.fetch !== 'function' || typeof clerkInstance.updateClient !== 'function') {
    return Promise.resolve(null);
  }

  return client.fetch({ fetchMaxTries: 1 });
}

type ClientStateSnapshot = {
  id: string | null;
  hasSignedInSession: boolean;
  restore: (() => ClientResource) | null;
};

function snapshotClientState(client: ClientResource | null | undefined): ClientStateSnapshot {
  const resource = client as RefreshableClientResource | undefined;
  const fromJSON = resource?.fromJSON?.bind(resource);
  let restore: ClientStateSnapshot['restore'] = null;

  if (resource && fromJSON) {
    const state = resource.__internal_toSnapshot();
    restore = () => fromJSON(state);
  }

  return {
    id: client?.id ?? null,
    hasSignedInSession: Boolean(client && getDefaultSignedInSession(client)),
    restore,
  };
}

// Client.fetch mutates the resource, so compare against pre-fetch values.
function isForeignSessionlessClient(previousSnapshot: ClientStateSnapshot, refreshedClient: ClientResource): boolean {
  if (!previousSnapshot.id || !refreshedClient.id || previousSnapshot.id === refreshedClient.id) {
    return false;
  }

  return previousSnapshot.hasSignedInSession && refreshedClient.signedInSessions.length === 0;
}

async function refreshJsClientFromNativeState({
  clerkInstance,
  nativeDeviceToken,
  previousDeviceToken,
  rejectForeignSessionlessClient = false,
  reloadInitialResources,
  shouldSyncDeviceToken = true,
  suppressDeviceTokenRollbackNotification = false,
  suppressTokenCacheNotificationsRef,
  tokenCache,
}: {
  clerkInstance: SyncableClerkInstance;
  nativeDeviceToken: string | null;
  previousDeviceToken?: string | null;
  rejectForeignSessionlessClient?: boolean;
  reloadInitialResources: boolean;
  shouldSyncDeviceToken?: boolean;
  suppressDeviceTokenRollbackNotification?: boolean;
  suppressTokenCacheNotificationsRef?: MutableRefObject<number>;
  tokenCache: TokenCache | undefined;
}): Promise<false | 'refreshed' | 'restored'> {
  const previousClientSnapshot = snapshotClientState(clerkInstance.client);

  const restorePreviousDeviceToken = async () => {
    if (!rejectForeignSessionlessClient || !shouldSyncDeviceToken || previousDeviceToken === undefined) {
      return;
    }

    // On the 401 path a rollback is part of recovery, not an external rotation, so it must not
    // reopen the cooldown. The native-event path still notifies so native resyncs the restored token.
    await syncNativeDeviceTokenToCache({
      deviceToken: previousDeviceToken,
      suppressTokenCacheNotificationsRef: suppressDeviceTokenRollbackNotification
        ? suppressTokenCacheNotificationsRef
        : undefined,
      tokenCache,
    });
  };

  let refreshedClient: ClientResource | null;
  try {
    if (shouldSyncDeviceToken) {
      await syncNativeDeviceTokenToCache({
        deviceToken: nativeDeviceToken,
        suppressTokenCacheNotificationsRef,
        tokenCache,
      });
    }

    refreshedClient = await fetchRefreshedJsClient(clerkInstance);
  } catch (error) {
    await restorePreviousDeviceToken();
    throw error;
  }

  if (refreshedClient) {
    if (rejectForeignSessionlessClient && isForeignSessionlessClient(previousClientSnapshot, refreshedClient)) {
      await restorePreviousDeviceToken();
      const restoredClient = previousClientSnapshot.restore?.();
      if (restoredClient) {
        clerkInstance.updateClient?.(restoredClient);
        await reconcileJsActiveSessionFromClient({
          clerkInstance,
        });
      }
      return 'restored';
    }

    clerkInstance.updateClient?.(refreshedClient);
    await reconcileJsActiveSessionFromClient({
      clerkInstance,
    });
    return 'refreshed';
  }

  if (reloadInitialResources && typeof clerkInstance.__internal_reloadInitialResources === 'function') {
    await clerkInstance.__internal_reloadInitialResources();
    await reconcileJsActiveSessionFromClient({
      clerkInstance,
    });
    return getDefaultSignedInSession(clerkInstance.client) ? 'refreshed' : false;
  }

  return false;
}

async function reloadJsClientFromNativeState({
  clerkInstance,
  nativeDeviceToken,
  suppressTokenCacheNotificationsRef,
  tokenCache,
}: {
  clerkInstance: SyncableClerkInstance;
  nativeDeviceToken: string;
  suppressTokenCacheNotificationsRef?: MutableRefObject<number>;
  tokenCache: TokenCache | undefined;
}): Promise<boolean> {
  await syncNativeDeviceTokenToCache({
    deviceToken: nativeDeviceToken,
    suppressTokenCacheNotificationsRef,
    tokenCache,
  });

  await clerkInstance.__internal_reloadInitialResources?.();
  await reconcileJsActiveSessionFromClient({
    clerkInstance,
  });
  return Boolean(getDefaultSignedInSession(clerkInstance.client));
}

async function recoverJsClientFromNativeDeviceToken({
  clerkInstance,
  error,
  suppressTokenCacheNotificationsRef,
  tokenCache,
}: {
  clerkInstance: SyncableClerkInstance;
  error: unknown;
  suppressTokenCacheNotificationsRef: MutableRefObject<number>;
  tokenCache: TokenCache | undefined;
}): Promise<boolean> {
  const nativeDeviceToken = await readNativeDeviceToken({ waitForToken: false });
  if (!nativeDeviceToken) {
    return false;
  }

  if (__DEV__) {
    console.warn('[NativeClientSync] Failed to refresh JS client with native device token:', error);
  }

  try {
    return await reloadJsClientFromNativeState({
      clerkInstance,
      nativeDeviceToken,
      suppressTokenCacheNotificationsRef,
      tokenCache,
    });
  } catch (recoveryError) {
    if (__DEV__) {
      console.warn('[NativeClientSync] Failed to recover JS client after unauthenticated state:', recoveryError);
    }
    return false;
  }
}

async function reconcileJsActiveSessionFromClient({
  clerkInstance,
}: {
  clerkInstance: SyncableClerkInstance;
}): Promise<void> {
  const fallbackSession = getDefaultSignedInSession(clerkInstance.client);
  if (!fallbackSession || typeof clerkInstance.setActive !== 'function') {
    return;
  }

  const currentSession = clerkInstance.session;
  const currentSessionStillExists = currentSession
    ? clerkInstance.client?.signedInSessions.some(session => session.id === currentSession.id)
    : false;

  if (currentSessionStillExists && currentSession?.id === fallbackSession.id) {
    return;
  }

  await clerkInstance.setActive({ session: fallbackSession });
}

async function runWithSuppressedJsClientChanges<T>(
  suppressJsClientChangedRef: MutableRefObject<number> | undefined,
  task: () => Promise<T>,
): Promise<T> {
  if (!suppressJsClientChangedRef) {
    return task();
  }

  suppressJsClientChangedRef.current += 1;
  try {
    return await task();
  } finally {
    suppressJsClientChangedRef.current = Math.max(0, suppressJsClientChangedRef.current - 1);
  }
}

function mergePendingNativeRefreshOptions(
  current: NativeRefreshFromJsOptions | null,
  next: NativeRefreshFromJsOptions,
): NativeRefreshFromJsOptions {
  if (!current) {
    return next;
  }

  const merged: NativeRefreshFromJsOptions = {
    didChangeClient: current.didChangeClient || next.didChangeClient,
    didChangeDeviceToken: current.didChangeDeviceToken || next.didChangeDeviceToken,
  };

  if ('deviceToken' in current) {
    merged.deviceToken = current.deviceToken ?? null;
  }

  if ('deviceToken' in next) {
    merged.deviceToken = next.deviceToken ?? null;
  }

  return merged;
}

const tokenCacheReadTimedOut = Symbol('tokenCacheReadTimedOut');

// `undefined` = read timed out, `null` = confirmed missing token.
async function getCachedDeviceToken(tokenCache: TokenCache | undefined): Promise<string | null | undefined> {
  if (!tokenCache) {
    return null;
  }

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      tokenCache.getToken(CLERK_CLIENT_JWT_KEY),
      new Promise<typeof tokenCacheReadTimedOut>(resolve => {
        timeoutId = setTimeout(() => resolve(tokenCacheReadTimedOut), tokenCacheReadTimeoutMs);
      }),
    ]);
    if (result === tokenCacheReadTimedOut) {
      return undefined;
    }
    return result ?? null;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

async function syncNativeClientToJs({
  clerkInstance,
  nativeRefreshFromJsControllerRef,
  nativeClientEvent,
  suppressJsClientChangedRef,
  suppressTokenCacheNotificationsRef,
  tokenCache,
}: {
  clerkInstance: SyncableClerkInstance;
  nativeRefreshFromJsControllerRef?: MutableRefObject<NativeRefreshFromJsController | null>;
  nativeClientEvent?: NativeClientEvent | null;
  suppressJsClientChangedRef?: MutableRefObject<number>;
  suppressTokenCacheNotificationsRef?: MutableRefObject<number>;
  tokenCache: TokenCache | undefined;
}): Promise<void> {
  const didChangeClient = nativeClientEvent?.changed.client ?? true;
  const didChangeDeviceToken = nativeClientEvent?.changed.deviceToken ?? true;

  if (!didChangeClient && !didChangeDeviceToken) {
    return;
  }

  const nativeDeviceToken = nativeClientEvent
    ? nativeClientEvent.deviceToken
    : await readNativeDeviceToken({
        waitForToken: true,
      });

  if (!nativeDeviceToken && !nativeClientEvent) {
    return;
  }

  const previousDeviceToken = didChangeDeviceToken ? await getCachedDeviceToken(tokenCache) : undefined;
  const hasSignedInJsClient = Boolean(getDefaultSignedInSession(clerkInstance.client));

  if (didChangeDeviceToken && hasSignedInJsClient) {
    // Timed-out cache read leaves no rollback snapshot, so keep JS authoritative.
    if (previousDeviceToken === undefined) {
      return;
    }

    if (previousDeviceToken && !canRefreshJsClientFromServer(clerkInstance)) {
      nativeRefreshFromJsControllerRef?.current?.syncDeviceTokenToNative(previousDeviceToken);
      return;
    }
  }

  await runWithSuppressedJsClientChanges(suppressJsClientChangedRef, async () => {
    nativeRefreshFromJsControllerRef?.current?.cancel();

    await refreshJsClientFromNativeState({
      clerkInstance,
      nativeDeviceToken,
      previousDeviceToken,
      rejectForeignSessionlessClient: true,
      reloadInitialResources: true,
      shouldSyncDeviceToken: didChangeDeviceToken,
      suppressTokenCacheNotificationsRef,
      tokenCache,
    });
  });
}

/**
 * Syncs JS SDK client changes to the native Clerk SDK so native components
 * (UserButton, UserProfileView) stay in sync after JS-owned resource changes.
 *
 * Must be rendered inside `ClerkReactProvider` so the Clerk instance has loaded
 * resources to emit.
 */
export function NativeClientSync({
  enabled,
  clerkInstance,
  nativeRefreshFromJsControllerRef,
  suppressJsClientChangedRef,
  suppressTokenCacheNotificationsRef,
  tokenCache,
  tokenCacheListenersRef,
}: {
  enabled: boolean;
  clerkInstance: SyncableClerkInstance | null | undefined;
  nativeRefreshFromJsControllerRef: MutableRefObject<NativeRefreshFromJsController | null>;
  suppressJsClientChangedRef: MutableRefObject<number>;
  suppressTokenCacheNotificationsRef: MutableRefObject<number>;
  tokenCache: TokenCache | undefined;
  tokenCacheListenersRef: MutableRefObject<Set<DeviceTokenCacheListener>>;
}): null {
  const isRefreshingNativeFromJsRef = useRef(false);
  const pendingNativeRefreshRef = useRef<NativeRefreshFromJsOptions | null>(null);
  const pendingNativeRefreshBeforeReadyRef = useRef<NativeRefreshFromJsOptions | null>(null);
  const nativeRefreshGenerationRef = useRef(0);
  const lastUnauthenticatedRecoveryRef = useRef<number | undefined>(undefined);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const cancelNativeRefreshFromJs = useCallback(() => {
    pendingNativeRefreshRef.current = null;
    pendingNativeRefreshBeforeReadyRef.current = null;
    nativeRefreshGenerationRef.current += 1;
    isRefreshingNativeFromJsRef.current = false;
  }, []);

  useEffect(() => {
    if (
      !clerkInstance ||
      typeof clerkInstance.updateClient !== 'function' ||
      typeof clerkInstance.setActive !== 'function'
    ) {
      return;
    }

    const originalUpdateClient = clerkInstance.updateClient.bind(clerkInstance);
    let isReconcilingRemovedActiveSession = false;

    const updateClient: SyncableClerkInstance['updateClient'] = (newClient, options) => {
      const currentSessionId = clerkInstance.session?.id;
      const fallbackSession = getDefaultSignedInSession(newClient);
      const currentSessionWasRemoved = currentSessionId
        ? !newClient.signedInSessions.some(session => session.id === currentSessionId)
        : false;
      const alreadyReconcilingRemovedActiveSession = isReconcilingRemovedActiveSession;

      if ((currentSessionWasRemoved || alreadyReconcilingRemovedActiveSession) && fallbackSession) {
        // Clerk JS briefly emits signed-out when the active session disappears,
        // even if the refreshed client still has another signed-in session.
        // Keep that transient state internal so native session switching does
        // not dismiss mounted native UI before setActive settles on JS.
        originalUpdateClient(newClient, { __internal_dangerouslySkipEmit: true });

        if (clerkInstance.__internal_setActiveInProgress || alreadyReconcilingRemovedActiveSession) {
          return;
        }

        isReconcilingRemovedActiveSession = true;
        void runWithSuppressedJsClientChanges(suppressJsClientChangedRef, async () => {
          try {
            await clerkInstance.setActive?.({ session: fallbackSession });
          } catch (error) {
            if (__DEV__) {
              console.warn('[NativeClientSync] Failed to set remaining active JS session:', error);
            }
            originalUpdateClient(newClient, options);
          } finally {
            isReconcilingRemovedActiveSession = false;
          }
        });
        return;
      }

      if (options) {
        originalUpdateClient(newClient, options);
        return;
      }

      originalUpdateClient(newClient);
    };

    clerkInstance.updateClient = updateClient;

    return () => {
      if (clerkInstance.updateClient === updateClient) {
        clerkInstance.updateClient = originalUpdateClient;
      }
    };
  }, [clerkInstance, suppressJsClientChangedRef]);

  const queueNativeRefreshFromJs = useCallback((options: NativeRefreshFromJsOptions): void => {
    if (isRefreshingNativeFromJsRef.current) {
      pendingNativeRefreshRef.current = mergePendingNativeRefreshOptions(pendingNativeRefreshRef.current, options);
      nativeRefreshGenerationRef.current += 1;
      return;
    }

    const initialGeneration = nativeRefreshGenerationRef.current + 1;
    nativeRefreshGenerationRef.current = initialGeneration;
    isRefreshingNativeFromJsRef.current = true;

    const refreshNativeFromJsClient = async (
      options: NativeRefreshFromJsOptions,
      generation: number,
    ): Promise<void> => {
      const ClerkExpo = NativeClerkModule;
      if (!ClerkExpo || generation !== nativeRefreshGenerationRef.current) {
        return;
      }

      const deviceToken = options.didChangeDeviceToken ? (options.deviceToken ?? null) : null;
      if (generation !== nativeRefreshGenerationRef.current) {
        return;
      }

      const sourceId = `${nativeClientSyncSourceIdPrefix}-${generation}`;
      await ClerkExpo.syncClientStateFromJs(
        deviceToken,
        sourceId,
        options.didChangeClient,
        options.didChangeDeviceToken,
      );
    };

    let latestRunGeneration = initialGeneration;

    void (async () => {
      let pendingOptions = options;
      let generation = initialGeneration;
      do {
        latestRunGeneration = generation;
        pendingNativeRefreshRef.current = null;
        try {
          await refreshNativeFromJsClient(pendingOptions, generation);
        } catch (error: unknown) {
          if (__DEV__) {
            console.warn('[NativeClientSync] Failed to refresh native client from JS client change:', error);
          }
        }
        pendingOptions = pendingNativeRefreshRef.current ?? {
          didChangeClient: false,
          didChangeDeviceToken: false,
        };
        if (pendingNativeRefreshRef.current !== null) {
          generation = nativeRefreshGenerationRef.current + 1;
          nativeRefreshGenerationRef.current = generation;
        }
      } while (pendingNativeRefreshRef.current !== null);
    })().finally(() => {
      if (latestRunGeneration === nativeRefreshGenerationRef.current || pendingNativeRefreshRef.current === null) {
        isRefreshingNativeFromJsRef.current = false;
      }
    });
  }, []);

  useEffect(() => {
    nativeRefreshFromJsControllerRef.current = {
      cancel: cancelNativeRefreshFromJs,
      syncDeviceTokenToNative: deviceToken => {
        queueNativeRefreshFromJs({
          deviceToken,
          didChangeClient: false,
          didChangeDeviceToken: true,
        });
      },
    };

    return () => {
      if (nativeRefreshFromJsControllerRef.current?.cancel === cancelNativeRefreshFromJs) {
        nativeRefreshFromJsControllerRef.current = null;
      }
    };
  }, [cancelNativeRefreshFromJs, nativeRefreshFromJsControllerRef, queueNativeRefreshFromJs]);

  useEffect(() => {
    if (!enabled) {
      pendingNativeRefreshBeforeReadyRef.current = null;
      return;
    }

    if (pendingNativeRefreshBeforeReadyRef.current) {
      const pendingOptions = pendingNativeRefreshBeforeReadyRef.current;
      pendingNativeRefreshBeforeReadyRef.current = null;
      queueNativeRefreshFromJs(pendingOptions);
    }
  }, [enabled, queueNativeRefreshFromJs]);

  useEffect(() => {
    const listener: DeviceTokenCacheListener = deviceToken => {
      // A rotated device token is new input for recovery, so it reopens the unauthenticated cooldown.
      lastUnauthenticatedRecoveryRef.current = undefined;

      const options = {
        deviceToken,
        didChangeClient: false,
        didChangeDeviceToken: true,
      };

      if (!enabledRef.current) {
        if (clerkInstance?.loaded) {
          pendingNativeRefreshBeforeReadyRef.current = mergePendingNativeRefreshOptions(
            pendingNativeRefreshBeforeReadyRef.current,
            options,
          );
        }
        return;
      }

      queueNativeRefreshFromJs(options);
    };
    const tokenCacheListeners = tokenCacheListenersRef.current;

    tokenCacheListeners.add(listener);
    return () => {
      tokenCacheListeners.delete(listener);
    };
  }, [clerkInstance, queueNativeRefreshFromJs, tokenCacheListenersRef]);

  useEffect(() => {
    if (!clerkInstance || typeof clerkInstance.handleUnauthenticated !== 'function') {
      return;
    }

    const originalHandleUnauthenticated = clerkInstance.handleUnauthenticated.bind(clerkInstance);
    let isHandlingUnauthenticated = false;

    const handleUnauthenticated: SyncableClerkInstance['handleUnauthenticated'] = async options => {
      if (isHandlingUnauthenticated) {
        return;
      }

      isHandlingUnauthenticated = true;
      try {
        // Re-reading native state and refetching the client for every response in a 401 burst only amplifies it.
        const lastRecovery = lastUnauthenticatedRecoveryRef.current;
        if (lastRecovery !== undefined) {
          const elapsed = Date.now() - lastRecovery;
          // A backwards clock jump makes elapsed negative; treat it as expired instead of waiting out the gap.
          if (elapsed >= 0 && elapsed < unauthenticatedRecoveryCooldownMs) {
            return await originalHandleUnauthenticated(options);
          }
        }
        lastUnauthenticatedRecoveryRef.current = Date.now();

        try {
          return await runWithSuppressedJsClientChanges(suppressJsClientChangedRef, async () => {
            try {
              const nativeDeviceToken = await readNativeDeviceToken({ waitForToken: false });
              const previousDeviceToken = await getCachedDeviceToken(tokenCache);
              // Native may have already moved the server-side client to a new
              // active session. Refresh JS before allowing Clerk JS' stale-session
              // 401 path to collapse the whole client to signed out.
              const result = await refreshJsClientFromNativeState({
                clerkInstance,
                nativeDeviceToken,
                previousDeviceToken,
                rejectForeignSessionlessClient: true,
                reloadInitialResources: false,
                suppressDeviceTokenRollbackNotification: true,
                suppressTokenCacheNotificationsRef,
                tokenCache,
              });
              // The suppressed rollback write skips the listener that resyncs native, so the
              // restored token must be pushed to native from here.
              if (result === 'restored' && previousDeviceToken !== undefined) {
                nativeRefreshFromJsControllerRef.current?.syncDeviceTokenToNative(previousDeviceToken);
              }
              if (result) {
                return;
              }
            } catch (error) {
              const didRecover = await recoverJsClientFromNativeDeviceToken({
                clerkInstance,
                error,
                suppressTokenCacheNotificationsRef,
                tokenCache,
              });
              if (didRecover) {
                return;
              }
            }

            return originalHandleUnauthenticated(options);
          });
        } finally {
          // Slow attempts must not finish with a mostly spent window, so the stamp moves to settle
          // time. A rotation mid-attempt cleared the ref to force a fresh attempt; keep it cleared.
          if (lastUnauthenticatedRecoveryRef.current !== undefined) {
            lastUnauthenticatedRecoveryRef.current = Date.now();
          }
        }
      } finally {
        isHandlingUnauthenticated = false;
      }
    };

    clerkInstance.handleUnauthenticated = handleUnauthenticated;

    return () => {
      if (clerkInstance.handleUnauthenticated === handleUnauthenticated) {
        clerkInstance.handleUnauthenticated = originalHandleUnauthenticated;
      }
    };
  }, [
    clerkInstance,
    nativeRefreshFromJsControllerRef,
    suppressJsClientChangedRef,
    suppressTokenCacheNotificationsRef,
    tokenCache,
  ]);

  useEffect(() => {
    if (!clerkInstance || typeof clerkInstance.addListener !== 'function') {
      return;
    }

    const unsubscribe = clerkInstance.addListener(
      () => {
        if (suppressJsClientChangedRef.current > 0) {
          return;
        }

        if (!enabledRef.current) {
          if (clerkInstance.loaded) {
            pendingNativeRefreshBeforeReadyRef.current = mergePendingNativeRefreshOptions(
              pendingNativeRefreshBeforeReadyRef.current,
              {
                didChangeClient: true,
                didChangeDeviceToken: false,
              },
            );
          }
          return;
        }

        queueNativeRefreshFromJs({
          didChangeClient: true,
          didChangeDeviceToken: false,
        });
      },
      { skipInitialEmit: true },
    );

    return () => {
      unsubscribe();
    };
  }, [clerkInstance, queueNativeRefreshFromJs, suppressJsClientChangedRef]);

  return null;
}

function waitForClerkInstanceLoad(clerkInstance: SyncableClerkInstance): Promise<void> {
  if (clerkInstance.loaded) {
    return Promise.resolve();
  }

  if (typeof clerkInstance.on === 'function' && typeof clerkInstance.off === 'function') {
    return new Promise(resolve => {
      let didSettle = false;
      const settle = () => {
        if (didSettle) {
          return;
        }
        didSettle = true;
        clerkInstance.off?.('status', handleStatus);
        resolve();
      };
      const handleStatus = (status: string) => {
        if (status === 'ready' || status === 'degraded' || status === 'error') {
          settle();
        }
      };

      clerkInstance.on?.('status', handleStatus);
      if (
        clerkInstance.loaded ||
        clerkInstance.status === 'ready' ||
        clerkInstance.status === 'degraded' ||
        clerkInstance.status === 'error'
      ) {
        settle();
      }
    });
  }

  if (typeof clerkInstance.addOnLoaded === 'function') {
    return new Promise(resolve => clerkInstance.addOnLoaded?.(resolve));
  }

  if (__DEV__) {
    console.warn('[ClerkProvider] Clerk instance has no load status listener');
  }
  return Promise.resolve();
}

export function useNativeClientBootstrap({
  enabled,
  publishableKey,
  proxyUrl,
  nativeRefreshFromJsControllerRef,
  suppressTokenCacheNotificationsRef,
  tokenCache,
  clerkInstance,
}: {
  enabled: boolean;
  publishableKey: string;
  proxyUrl?: string | ((url: URL) => string);
  nativeRefreshFromJsControllerRef: MutableRefObject<NativeRefreshFromJsController | null>;
  suppressTokenCacheNotificationsRef: MutableRefObject<number>;
  tokenCache: TokenCache | undefined;
  clerkInstance: SyncableClerkInstance | null | undefined;
}) {
  const startedConfigKeyRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);
  const [readyConfigKey, setReadyConfigKey] = useState<string | null>(null);
  // Function proxyUrls are browser-only; the singleton already rejects them on native.
  const nativeProxyUrl = typeof proxyUrl === 'string' && proxyUrl ? proxyUrl : null;
  const configKey = `${publishableKey}|${nativeProxyUrl ?? ''}`;

  useEffect(() => {
    isMountedRef.current = true;

    if (
      enabled &&
      (Platform.OS === 'ios' || Platform.OS === 'android') &&
      publishableKey &&
      startedConfigKeyRef.current !== configKey
    ) {
      startedConfigKeyRef.current = configKey;
      const configuringConfigKey = configKey;
      const isCurrentConfiguration = () => isMountedRef.current && startedConfigKeyRef.current === configuringConfigKey;

      const configureNativeClerk = async () => {
        let didAttemptConfigure = false;
        try {
          const ClerkExpo = NativeClerkModule;

          if (ClerkExpo?.configure) {
            if (clerkInstance) {
              await waitForClerkInstanceLoad(clerkInstance);

              if (!isCurrentConfiguration()) {
                return;
              }
            }

            let initialJsDeviceToken: string | null = null;
            try {
              initialJsDeviceToken = (await getCachedDeviceToken(tokenCache)) ?? null;
            } catch (e) {
              if (__DEV__) {
                console.warn('[ClerkProvider] Token cache read failed:', e);
              }
            }

            if (!isCurrentConfiguration()) {
              return;
            }

            didAttemptConfigure = true;
            if (typeof ClerkExpo.configureWithOptions === 'function') {
              await ClerkExpo.configureWithOptions(publishableKey, {
                bearerToken: initialJsDeviceToken,
                proxyUrl: nativeProxyUrl,
              });
            } else {
              // Old binaries reject extra configure args, so OTA-updated JS must use the legacy call.
              if (nativeProxyUrl && __DEV__) {
                console.warn(
                  '[ClerkProvider] The installed Clerk native module does not support proxyUrl. ' +
                    'Rebuild the app binary to route native components through your proxy.',
                );
              }
              await ClerkExpo.configure(publishableKey, initialJsDeviceToken);
            }

            if (!isCurrentConfiguration()) {
              return;
            }

            if (clerkInstance) {
              const currentJsDeviceToken = (await getCachedDeviceToken(tokenCache)) ?? null;
              const nativeDeviceToken = await readNativeDeviceToken({ waitForToken: false });

              if (!isCurrentConfiguration() || currentJsDeviceToken === nativeDeviceToken) {
                return;
              }

              if (
                !nativeDeviceToken ||
                (initialJsDeviceToken !== null && currentJsDeviceToken !== initialJsDeviceToken)
              ) {
                nativeRefreshFromJsControllerRef.current?.cancel();
                await ClerkExpo.syncClientStateFromJs(
                  currentJsDeviceToken,
                  `${nativeClientSyncSourceIdPrefix}-bootstrap`,
                  true,
                  true,
                );
              } else {
                await syncNativeClientToJs({
                  clerkInstance,
                  nativeRefreshFromJsControllerRef,
                  nativeClientEvent: {
                    changed: { client: true, deviceToken: true },
                    deviceToken: nativeDeviceToken,
                    issuedAt: Date.now(),
                  },
                  suppressTokenCacheNotificationsRef,
                  tokenCache,
                });
              }
            }
          }
        } catch (error) {
          const isNativeModuleNotFound = error instanceof Error && error.message.includes('Cannot find native module');
          if (isNativeModuleNotFound) {
            if (__DEV__) {
              console.debug(
                `[ClerkProvider] Native Clerk module not available. ` +
                  `To enable native features, add "@clerk/expo" to your app.json plugins array.`,
              );
            }
          } else if (__DEV__) {
            console.error(`[ClerkProvider] Failed to configure Clerk ${Platform.OS}:`, error);
          }
        } finally {
          if (didAttemptConfigure && isCurrentConfiguration()) {
            setReadyConfigKey(configuringConfigKey);
          }
        }
      };
      void configureNativeClerk();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [
    enabled,
    publishableKey,
    configKey,
    nativeProxyUrl,
    nativeRefreshFromJsControllerRef,
    suppressTokenCacheNotificationsRef,
    tokenCache,
    clerkInstance,
  ]);

  return {
    isMountedRef,
    isNativeClientReady: readyConfigKey === configKey,
  };
}

export function useNativeClientEventSync({
  enabled,
  clerkInstance,
  isMountedRef,
  nativeRefreshFromJsControllerRef,
  suppressJsClientChangedRef,
  suppressTokenCacheNotificationsRef,
  tokenCache,
}: {
  enabled: boolean;
  clerkInstance: SyncableClerkInstance | null | undefined;
  isMountedRef: MutableRefObject<boolean>;
  nativeRefreshFromJsControllerRef: MutableRefObject<NativeRefreshFromJsController | null>;
  suppressJsClientChangedRef: MutableRefObject<number>;
  suppressTokenCacheNotificationsRef: MutableRefObject<number>;
  tokenCache: TokenCache | undefined;
}) {
  const { nativeClientEvent } = useNativeClientEvents(enabled);

  useEffect(() => {
    if (!enabled || !nativeClientEvent || !clerkInstance) {
      return;
    }

    if (nativeClientEvent.sourceId?.startsWith(nativeClientSyncSourceIdPrefix)) {
      return;
    }

    const syncNativeClientStateToJs = async () => {
      try {
        if (!isMountedRef.current) {
          return;
        }
        await syncNativeClientToJs({
          clerkInstance,
          nativeRefreshFromJsControllerRef,
          nativeClientEvent,
          suppressJsClientChangedRef,
          suppressTokenCacheNotificationsRef,
          tokenCache,
        });
      } catch (error) {
        console.error(`[ClerkProvider] Failed to sync native client state:`, error);
      }
    };

    void syncNativeClientStateToJs();
  }, [
    enabled,
    nativeClientEvent,
    clerkInstance,
    isMountedRef,
    nativeRefreshFromJsControllerRef,
    suppressJsClientChangedRef,
    suppressTokenCacheNotificationsRef,
    tokenCache,
  ]);
}
