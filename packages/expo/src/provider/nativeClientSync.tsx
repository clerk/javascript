import type { ClientResource, SignedInSessionResource } from '@clerk/shared/types';
import { type MutableRefObject, useCallback, useEffect, useMemo, useRef } from 'react';
import { Platform } from 'react-native';

import { MemoryTokenCache } from '../cache';
import type { TokenCache } from '../cache/types';
import { CLERK_CLIENT_JWT_KEY } from '../constants';
import {
  type NativeClientEvent,
  type NativeClientSnapshot,
  useNativeClientEvents,
} from '../hooks/useNativeClientEvents';
import { ClerkExpoModule as NativeClerkModule } from '../utils/native-module';

const tokenCacheReadTimeoutMs = 1_000;
const clientTokenPollIntervalMs = 100;
const clientTokenAvailabilityTimeoutMs = 3_000;
const nativeClientSyncSourceIdPrefix = 'clerk-expo-js-sync';

export type SyncableClerkInstance = {
  addListener?: (listener: () => void, options?: { skipInitialEmit?: boolean }) => () => void;
  addOnLoaded?: (listener: () => void) => void;
  client?: ClientResource;
  handleUnauthenticated?: (options?: { broadcast?: boolean }) => Promise<unknown>;
  loaded?: boolean;
  session?: SignedInSessionResource | null;
  setActive?: (params: { session: SignedInSessionResource | string | null }) => Promise<void>;
  updateClient?: (client: ClientResource, options?: { __internal_dangerouslySkipEmit?: boolean }) => void;
  __internal_reloadInitialResources?: () => void | Promise<void>;
};

type RefreshableClientResource = ClientResource & {
  fetch?: (options?: { fetchMaxTries?: number }) => Promise<ClientResource>;
};

type NativeRefreshFromJsOptions = {
  clientToken?: string | null;
};

export type NativeRefreshFromJsController = {
  cancel: () => void;
};

export type ClientTokenCacheListener = (clientToken: string | null) => void;

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function useSyncableTokenCache({
  suppressTokenCacheNotificationsRef,
  tokenCache,
  tokenCacheListenersRef,
}: {
  suppressTokenCacheNotificationsRef: MutableRefObject<boolean>;
  tokenCache: TokenCache | undefined;
  tokenCacheListenersRef: MutableRefObject<Set<ClientTokenCacheListener>>;
}): TokenCache | undefined {
  return useMemo(() => {
    const effectiveTokenCache =
      tokenCache ?? (Platform.OS === 'ios' || Platform.OS === 'android' ? MemoryTokenCache : undefined);
    if (!effectiveTokenCache) {
      return undefined;
    }

    const notifyClientTokenListeners = (clientToken: string | null) => {
      if (suppressTokenCacheNotificationsRef.current) {
        return;
      }

      for (const listener of tokenCacheListenersRef.current) {
        listener(clientToken);
      }
    };

    return {
      getToken: key => effectiveTokenCache.getToken(key),
      saveToken: async (key, token) => {
        await effectiveTokenCache.saveToken(key, token);
        if (key === CLERK_CLIENT_JWT_KEY) {
          notifyClientTokenListeners(token);
        }
      },
      clearToken: async key => {
        await effectiveTokenCache.clearToken?.(key);
        if (key === CLERK_CLIENT_JWT_KEY) {
          notifyClientTokenListeners(null);
        }
      },
    };
  }, [suppressTokenCacheNotificationsRef, tokenCache, tokenCacheListenersRef]);
}

function getNativeClientTokenFromSnapshot(
  snapshot: NativeClientSnapshot | null | undefined,
): string | null | undefined {
  if (!snapshot || !('clientToken' in snapshot)) {
    return undefined;
  }

  return snapshot.clientToken ?? null;
}

async function readNativeClientToken({ waitForToken }: { waitForToken: boolean }): Promise<string | null> {
  const ClerkExpo = NativeClerkModule;
  if (!ClerkExpo?.getClientToken) {
    return null;
  }

  const startedAt = Date.now();
  let remainingMs = clientTokenAvailabilityTimeoutMs;

  do {
    const nativeClientToken = await ClerkExpo.getClientToken();
    if (nativeClientToken) {
      return nativeClientToken;
    }

    if (!waitForToken) {
      return null;
    }

    remainingMs = clientTokenAvailabilityTimeoutMs - (Date.now() - startedAt);
    if (remainingMs <= 0) {
      return null;
    }

    await delay(Math.min(clientTokenPollIntervalMs, remainingMs));
  } while (remainingMs > 0);

  return null;
}

async function syncClientTokenToCache(tokenCache: TokenCache | undefined, clientToken: string | null): Promise<void> {
  if (clientToken) {
    await tokenCache?.saveToken(CLERK_CLIENT_JWT_KEY, clientToken);
  }
}

async function syncClientTokenToCacheWithoutNotifying({
  clientToken,
  suppressTokenCacheNotificationsRef,
  tokenCache,
}: {
  clientToken: string | null;
  suppressTokenCacheNotificationsRef: MutableRefObject<boolean>;
  tokenCache: TokenCache | undefined;
}): Promise<void> {
  suppressTokenCacheNotificationsRef.current = true;
  try {
    await syncClientTokenToCache(tokenCache, clientToken);
  } finally {
    suppressTokenCacheNotificationsRef.current = false;
  }
}

async function syncNativeTokenToCache({
  clientToken,
  suppressTokenCacheNotificationsRef,
  tokenCache,
}: {
  clientToken: string | null;
  suppressTokenCacheNotificationsRef?: MutableRefObject<boolean>;
  tokenCache: TokenCache | undefined;
}): Promise<void> {
  if (suppressTokenCacheNotificationsRef) {
    await syncClientTokenToCacheWithoutNotifying({
      clientToken,
      suppressTokenCacheNotificationsRef,
      tokenCache,
    });
    return;
  }

  await syncClientTokenToCache(tokenCache, clientToken);
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

async function refreshJsClientWithoutEmitting(clerkInstance: SyncableClerkInstance): Promise<ClientResource | null> {
  const client = clerkInstance.client as RefreshableClientResource | undefined;

  if (typeof client?.fetch !== 'function' || typeof clerkInstance.updateClient !== 'function') {
    return null;
  }

  const refreshedClient = await client.fetch({ fetchMaxTries: 1 });
  const nextSession = getDefaultSignedInSession(refreshedClient);

  clerkInstance.updateClient(refreshedClient, {
    __internal_dangerouslySkipEmit: Boolean(nextSession),
  });

  return refreshedClient;
}

async function refreshJsClientFromNativeState({
  clerkInstance,
  nativeClientToken,
  reloadInitialResources,
  suppressTokenCacheNotificationsRef,
  tokenCache,
}: {
  clerkInstance: SyncableClerkInstance;
  nativeClientToken: string | null;
  reloadInitialResources: boolean;
  suppressTokenCacheNotificationsRef?: MutableRefObject<boolean>;
  tokenCache: TokenCache | undefined;
}): Promise<boolean> {
  await syncNativeTokenToCache({
    clientToken: nativeClientToken,
    suppressTokenCacheNotificationsRef,
    tokenCache,
  });

  const refreshedClient = await refreshJsClientWithoutEmitting(clerkInstance);
  if (refreshedClient) {
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
  nativeClientToken,
  suppressTokenCacheNotificationsRef,
  tokenCache,
}: {
  clerkInstance: SyncableClerkInstance;
  nativeClientToken: string;
  suppressTokenCacheNotificationsRef?: MutableRefObject<boolean>;
  tokenCache: TokenCache | undefined;
}): Promise<boolean> {
  await syncNativeTokenToCache({
    clientToken: nativeClientToken,
    suppressTokenCacheNotificationsRef,
    tokenCache,
  });

  await clerkInstance.__internal_reloadInitialResources?.();
  await reconcileJsActiveSessionFromClient({
    clerkInstance,
  });
  return Boolean(getDefaultSignedInSession(clerkInstance.client));
}

async function recoverJsClientFromNativeToken({
  clerkInstance,
  error,
  suppressTokenCacheNotificationsRef,
  tokenCache,
}: {
  clerkInstance: SyncableClerkInstance;
  error: unknown;
  suppressTokenCacheNotificationsRef: MutableRefObject<boolean>;
  tokenCache: TokenCache | undefined;
}): Promise<boolean> {
  const nativeClientToken = await readNativeClientToken({ waitForToken: false });
  if (!nativeClientToken) {
    return false;
  }

  if (__DEV__) {
    console.warn('[NativeClientSync] Failed to refresh JS client with native client token:', error);
  }

  try {
    return await reloadJsClientFromNativeState({
      clerkInstance,
      nativeClientToken,
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

  if ('clientToken' in next) {
    return {
      clientToken: next.clientToken ?? null,
    };
  }

  return current;
}

async function getCachedClientToken(tokenCache: TokenCache | undefined): Promise<string | null> {
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
  suppressTokenCacheNotificationsRef?: MutableRefObject<boolean>;
  tokenCache: TokenCache | undefined;
}): Promise<void> {
  const nativeClientTokenFromEvent = getNativeClientTokenFromSnapshot(nativeClientEvent);
  const nativeClientToken =
    nativeClientTokenFromEvent !== undefined
      ? nativeClientTokenFromEvent
      : await readNativeClientToken({
          waitForToken: !nativeClientEvent,
        });

  if (!nativeClientToken && !nativeClientEvent) {
    return;
  }

  await runWithSuppressedJsClientChanges(suppressJsClientChangedRef, async () => {
    nativeRefreshFromJsControllerRef?.current?.cancel();

    await refreshJsClientFromNativeState({
      clerkInstance,
      nativeClientToken,
      reloadInitialResources: true,
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
  clerkInstance,
  nativeRefreshFromJsControllerRef,
  suppressJsClientChangedRef,
  suppressTokenCacheNotificationsRef,
  tokenCache,
  tokenCacheListenersRef,
}: {
  clerkInstance: SyncableClerkInstance | null | undefined;
  nativeRefreshFromJsControllerRef: MutableRefObject<NativeRefreshFromJsController | null>;
  suppressJsClientChangedRef: MutableRefObject<number>;
  suppressTokenCacheNotificationsRef: MutableRefObject<boolean>;
  tokenCache: TokenCache | undefined;
  tokenCacheListenersRef: MutableRefObject<Set<ClientTokenCacheListener>>;
}): null {
  const isRefreshingNativeFromJsRef = useRef(false);
  const pendingNativeRefreshRef = useRef<NativeRefreshFromJsOptions | null>(null);
  const nativeRefreshGenerationRef = useRef(0);

  const cancelNativeRefreshFromJs = useCallback(() => {
    pendingNativeRefreshRef.current = null;
    nativeRefreshGenerationRef.current += 1;
    isRefreshingNativeFromJsRef.current = false;
  }, []);

  useEffect(() => {
    nativeRefreshFromJsControllerRef.current = {
      cancel: cancelNativeRefreshFromJs,
    };

    return () => {
      if (nativeRefreshFromJsControllerRef.current?.cancel === cancelNativeRefreshFromJs) {
        nativeRefreshFromJsControllerRef.current = null;
      }
    };
  }, [cancelNativeRefreshFromJs, nativeRefreshFromJsControllerRef]);

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

      originalUpdateClient(newClient, options);
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
      if (!('clientToken' in options)) {
        return;
      }

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

      const bearerToken = 'clientToken' in options ? (options.clientToken ?? null) : null;
      if (generation !== nativeRefreshGenerationRef.current) {
        return;
      }

      const sourceId = `${nativeClientSyncSourceIdPrefix}-${generation}`;
      await ClerkExpo.syncFromJsClientToken(bearerToken, sourceId);
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
        pendingOptions = pendingNativeRefreshRef.current ?? {};
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
    const listener: ClientTokenCacheListener = clientToken => {
      queueNativeRefreshFromJs({ clientToken });
    };
    const tokenCacheListeners = tokenCacheListenersRef.current;

    tokenCacheListeners.add(listener);
    return () => {
      tokenCacheListeners.delete(listener);
    };
  }, [queueNativeRefreshFromJs, tokenCacheListenersRef]);

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
            const nativeClientToken = await readNativeClientToken({ waitForToken: false });
            // Native may have already moved the server-side client to a new
            // active session. Refresh JS before allowing Clerk JS' stale-session
            // 401 path to collapse the whole client to signed out.
            const didRecover = await refreshJsClientFromNativeState({
              clerkInstance,
              nativeClientToken,
              reloadInitialResources: false,
              suppressTokenCacheNotificationsRef,
              tokenCache,
            });
            if (didRecover) {
              return;
            }
          } catch (error) {
            const didRecover = await recoverJsClientFromNativeToken({
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

        queueNativeRefreshFromJs({});
      },
      { skipInitialEmit: true },
    );

    return () => {
      unsubscribe();
    };
  }, [clerkInstance, queueNativeRefreshFromJs, suppressJsClientChangedRef]);

  return null;
}

export function useNativeClientBootstrap({
  publishableKey,
  suppressTokenCacheNotificationsRef,
  tokenCache,
  clerkInstance,
}: {
  publishableKey: string;
  suppressTokenCacheNotificationsRef: MutableRefObject<boolean>;
  tokenCache: TokenCache | undefined;
  clerkInstance: SyncableClerkInstance | null | undefined;
}) {
  const initStartedRef = useRef(false);
  const nativeClientSyncedRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    initStartedRef.current = false;
    nativeClientSyncedRef.current = false;
  }, [publishableKey]);

  useEffect(() => {
    isMountedRef.current = true;

    if ((Platform.OS === 'ios' || Platform.OS === 'android') && publishableKey && !initStartedRef.current) {
      initStartedRef.current = true;

      const configureNativeClerk = async () => {
        try {
          const ClerkExpo = NativeClerkModule;

          if (ClerkExpo?.configure) {
            await ClerkExpo.configure(publishableKey, null);

            if (!isMountedRef.current) {
              return;
            }

            let bearerToken: string | null = null;
            try {
              bearerToken = await getCachedClientToken(tokenCache);
            } catch (e) {
              if (__DEV__) {
                console.warn('[ClerkProvider] Token cache read failed:', e);
              }
            }

            if (bearerToken) {
              await ClerkExpo.configure(publishableKey, bearerToken);

              if (!isMountedRef.current) {
                return;
              }
            }

            if (clerkInstance) {
              const waitForLoad = (): Promise<void> => {
                return new Promise(resolve => {
                  if (clerkInstance.loaded) {
                    resolve();
                  } else if (typeof clerkInstance.addOnLoaded === 'function') {
                    clerkInstance.addOnLoaded(() => resolve());
                  } else {
                    if (__DEV__) {
                      console.warn('[ClerkProvider] Clerk instance has no loaded property or addOnLoaded method');
                    }
                    resolve();
                  }
                });
              };

              await waitForLoad();

              if (!isMountedRef.current) {
                return;
              }

              if (!nativeClientSyncedRef.current) {
                nativeClientSyncedRef.current = true;
                await syncNativeClientToJs({
                  clerkInstance,
                  suppressTokenCacheNotificationsRef,
                  tokenCache,
                });
              }
            }
          }
        } catch (error) {
          const isNativeModuleNotFound =
            error instanceof Error &&
            (error.message.includes('Cannot find native module') ||
              error.message.includes("TurboModuleRegistry.getEnforcing(...): 'ClerkExpo'"));
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
        }
      };
      void configureNativeClerk();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [publishableKey, suppressTokenCacheNotificationsRef, tokenCache, clerkInstance]);

  return isMountedRef;
}

export function useNativeClientEventSync({
  clerkInstance,
  isMountedRef,
  nativeRefreshFromJsControllerRef,
  suppressJsClientChangedRef,
  suppressTokenCacheNotificationsRef,
  tokenCache,
}: {
  clerkInstance: SyncableClerkInstance | null | undefined;
  isMountedRef: MutableRefObject<boolean>;
  nativeRefreshFromJsControllerRef: MutableRefObject<NativeRefreshFromJsController | null>;
  suppressJsClientChangedRef: MutableRefObject<number>;
  suppressTokenCacheNotificationsRef: MutableRefObject<boolean>;
  tokenCache: TokenCache | undefined;
}) {
  const { nativeClientEvent } = useNativeClientEvents();

  useEffect(() => {
    if (!nativeClientEvent || !clerkInstance) {
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
    nativeClientEvent,
    clerkInstance,
    isMountedRef,
    nativeRefreshFromJsControllerRef,
    suppressJsClientChangedRef,
    suppressTokenCacheNotificationsRef,
    tokenCache,
  ]);
}
