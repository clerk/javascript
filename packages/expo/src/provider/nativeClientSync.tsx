import type { ClientResource, SignedInSessionResource } from '@clerk/shared/types';
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
  __internal_reloadInitialResources?: () => void | Promise<void>;
};

type RefreshableClientResource = ClientResource & {
  fetch?: (options?: { fetchMaxTries?: number }) => Promise<ClientResource>;
};

type NativeRefreshFromJsOptions = {
  deviceToken?: string | null;
  didChangeClient: boolean;
  didChangeDeviceToken: boolean;
};

export type NativeRefreshFromJsController = {
  cancel: () => void;
  getInFlightDeviceTokenPush?: () => { deviceToken: string | null } | null;
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

async function fetchRefreshedJsClient(clerkInstance: SyncableClerkInstance): Promise<ClientResource | null> {
  const client = clerkInstance.client as RefreshableClientResource | undefined;

  if (typeof client?.fetch !== 'function' || typeof clerkInstance.updateClient !== 'function') {
    return null;
  }

  return client.fetch({ fetchMaxTries: 1 });
}

function isForeignSessionlessClient(
  previousClient: ClientResource | null | undefined,
  refreshedClient: ClientResource,
): boolean {
  if (!previousClient?.id || !refreshedClient.id || previousClient.id === refreshedClient.id) {
    return false;
  }

  return Boolean(getDefaultSignedInSession(previousClient)) && refreshedClient.signedInSessions.length === 0;
}

async function refreshJsClientFromNativeState({
  clerkInstance,
  nativeDeviceToken,
  previousDeviceToken,
  rejectForeignSessionlessClient = false,
  reloadInitialResources,
  shouldSyncDeviceToken = true,
  suppressTokenCacheNotificationsRef,
  tokenCache,
}: {
  clerkInstance: SyncableClerkInstance;
  nativeDeviceToken: string | null;
  previousDeviceToken?: string | null;
  rejectForeignSessionlessClient?: boolean;
  reloadInitialResources: boolean;
  shouldSyncDeviceToken?: boolean;
  suppressTokenCacheNotificationsRef?: MutableRefObject<number>;
  tokenCache: TokenCache | undefined;
}): Promise<boolean> {
  const previousClient = clerkInstance.client;

  if (shouldSyncDeviceToken) {
    await syncNativeDeviceTokenToCache({
      deviceToken: nativeDeviceToken,
      suppressTokenCacheNotificationsRef,
      tokenCache,
    });
  }

  const refreshedClient = await fetchRefreshedJsClient(clerkInstance);
  if (refreshedClient) {
    if (rejectForeignSessionlessClient && isForeignSessionlessClient(previousClient, refreshedClient)) {
      // Restoring the previous token also notifies native to re-sync to it.
      if (shouldSyncDeviceToken && previousDeviceToken !== undefined) {
        await syncDeviceTokenToCache(tokenCache, previousDeviceToken);
      }
      return true;
    }

    clerkInstance.updateClient?.(refreshedClient);
    await reconcileJsActiveSessionFromClient({
      clerkInstance,
    });
    return true;
  }

  if (reloadInitialResources && typeof clerkInstance.__internal_reloadInitialResources === 'function') {
    await clerkInstance.__internal_reloadInitialResources();
    await reconcileJsActiveSessionFromClient({
      clerkInstance,
    });
    return Boolean(getDefaultSignedInSession(clerkInstance.client));
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

async function getCachedDeviceToken(tokenCache: TokenCache | undefined): Promise<string | null> {
  if (!tokenCache) {
    return null;
  }

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    return (
      (await Promise.race([
        tokenCache.getToken(CLERK_CLIENT_JWT_KEY),
        new Promise<null>(resolve => {
          timeoutId = setTimeout(() => resolve(null), tokenCacheReadTimeoutMs);
        }),
      ])) ?? null
    );
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
  const inFlightDeviceTokenPushRef = useRef<{ deviceToken: string | null } | null>(null);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const cancelNativeRefreshFromJs = useCallback(() => {
    pendingNativeRefreshRef.current = null;
    pendingNativeRefreshBeforeReadyRef.current = null;
    nativeRefreshGenerationRef.current += 1;
    isRefreshingNativeFromJsRef.current = false;
    inFlightDeviceTokenPushRef.current = null;
  }, []);

  const getInFlightDeviceTokenPush = useCallback(() => {
    return isRefreshingNativeFromJsRef.current ? inFlightDeviceTokenPushRef.current : null;
  }, []);

  useEffect(() => {
    nativeRefreshFromJsControllerRef.current = {
      cancel: cancelNativeRefreshFromJs,
      getInFlightDeviceTokenPush,
    };

    return () => {
      if (nativeRefreshFromJsControllerRef.current?.cancel === cancelNativeRefreshFromJs) {
        nativeRefreshFromJsControllerRef.current = null;
      }
    };
  }, [cancelNativeRefreshFromJs, getInFlightDeviceTokenPush, nativeRefreshFromJsControllerRef]);

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
        isReconcilingRemovedActiveSession = true;
        originalUpdateClient(newClient, { __internal_dangerouslySkipEmit: true });

        if (alreadyReconcilingRemovedActiveSession) {
          return;
        }

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
    const trackInFlightDeviceTokenPush = (pushOptions: NativeRefreshFromJsOptions) => {
      if (pushOptions.didChangeDeviceToken) {
        inFlightDeviceTokenPushRef.current = { deviceToken: pushOptions.deviceToken ?? null };
      }
    };

    if (isRefreshingNativeFromJsRef.current) {
      pendingNativeRefreshRef.current = mergePendingNativeRefreshOptions(pendingNativeRefreshRef.current, options);
      nativeRefreshGenerationRef.current += 1;
      trackInFlightDeviceTokenPush(pendingNativeRefreshRef.current);
      return;
    }

    const initialGeneration = nativeRefreshGenerationRef.current + 1;
    nativeRefreshGenerationRef.current = initialGeneration;
    isRefreshingNativeFromJsRef.current = true;
    trackInFlightDeviceTokenPush(options);

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
        inFlightDeviceTokenPushRef.current = null;
      }
    });
  }, []);

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
        return await runWithSuppressedJsClientChanges(suppressJsClientChangedRef, async () => {
          try {
            const nativeDeviceToken = await readNativeDeviceToken({ waitForToken: false });
            // Native may have already moved the server-side client to a new
            // active session. Refresh JS before allowing Clerk JS' stale-session
            // 401 path to collapse the whole client to signed out.
            const didRecover = await refreshJsClientFromNativeState({
              clerkInstance,
              nativeDeviceToken,
              reloadInitialResources: false,
              suppressTokenCacheNotificationsRef,
              tokenCache,
            });
            if (didRecover) {
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
        isHandlingUnauthenticated = false;
      }
    };

    clerkInstance.handleUnauthenticated = handleUnauthenticated;

    return () => {
      if (clerkInstance.handleUnauthenticated === handleUnauthenticated) {
        clerkInstance.handleUnauthenticated = originalHandleUnauthenticated;
      }
    };
  }, [clerkInstance, suppressJsClientChangedRef, suppressTokenCacheNotificationsRef, tokenCache]);

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
  publishableKey,
  nativeRefreshFromJsControllerRef,
  suppressTokenCacheNotificationsRef,
  tokenCache,
  clerkInstance,
}: {
  publishableKey: string;
  nativeRefreshFromJsControllerRef: MutableRefObject<NativeRefreshFromJsController | null>;
  suppressTokenCacheNotificationsRef: MutableRefObject<number>;
  tokenCache: TokenCache | undefined;
  clerkInstance: SyncableClerkInstance | null | undefined;
}) {
  const startedPublishableKeyRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);
  const [readyPublishableKey, setReadyPublishableKey] = useState<string | null>(null);

  useEffect(() => {
    isMountedRef.current = true;

    if (
      (Platform.OS === 'ios' || Platform.OS === 'android') &&
      publishableKey &&
      startedPublishableKeyRef.current !== publishableKey
    ) {
      startedPublishableKeyRef.current = publishableKey;
      const configuringPublishableKey = publishableKey;
      const isCurrentConfiguration = () =>
        isMountedRef.current && startedPublishableKeyRef.current === configuringPublishableKey;

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
              initialJsDeviceToken = await getCachedDeviceToken(tokenCache);
            } catch (e) {
              if (__DEV__) {
                console.warn('[ClerkProvider] Token cache read failed:', e);
              }
            }

            if (!isCurrentConfiguration()) {
              return;
            }

            didAttemptConfigure = true;
            await ClerkExpo.configure(configuringPublishableKey, initialJsDeviceToken);

            if (!isCurrentConfiguration()) {
              return;
            }

            if (clerkInstance) {
              const currentJsDeviceToken = await getCachedDeviceToken(tokenCache);
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
            setReadyPublishableKey(configuringPublishableKey);
          }
        }
      };
      void configureNativeClerk();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [publishableKey, nativeRefreshFromJsControllerRef, suppressTokenCacheNotificationsRef, tokenCache, clerkInstance]);

  return {
    isMountedRef,
    isNativeClientReady: readyPublishableKey === publishableKey,
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

    const inFlightDeviceTokenPush = nativeRefreshFromJsControllerRef.current?.getInFlightDeviceTokenPush?.();
    if (inFlightDeviceTokenPush && nativeClientEvent.deviceToken !== inFlightDeviceTokenPush.deviceToken) {
      // The event was computed before the device token JS is currently pushing
      // to native; that push realigns native, so the stale token must not win.
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
