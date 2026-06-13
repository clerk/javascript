import '../polyfills';

import type { ClerkProviderProps as ReactClerkProviderProps } from '@clerk/react';
import { useAuth } from '@clerk/react';
import { InternalClerkProvider as ClerkReactProvider, type Ui } from '@clerk/react/internal';
import { type MutableRefObject, useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import type { TokenCache } from '../cache/types';
import { CLERK_CLIENT_JWT_KEY } from '../constants';
import { notifyNativeSessionChanged } from '../hooks/nativeSessionEvents';
import { useNativeClientEvents } from '../hooks/useNativeClientEvents';
import { tokenCache as defaultTokenCache } from '../token-cache';
import { ClerkExpoModule as NativeClerkModule } from '../utils/native-module';
import { isNative, isWeb } from '../utils/runtime';
import { maybeCompleteAuthSession } from './maybeCompleteAuthSession';
import { getClerkInstance } from './singleton';
import type { BuildClerkOptions } from './singleton/types';

export type ClerkProviderProps<TUi extends Ui = Ui> = Omit<ReactClerkProviderProps<TUi>, 'publishableKey'> & {
  /**
   * Your Clerk publishable key, available in the Clerk Dashboard.
   * This is required for React Native / Expo apps. Environment variables inside node_modules
   * are not inlined during production builds, so the key must be passed explicitly.
   *
   * @example
   * ```tsx
   * const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
   * <ClerkProvider publishableKey={publishableKey}>
   * ```
   */
  publishableKey: string;
  /**
   * The token cache is used to persist the active user's session token. Clerk stores this token in memory by default, however it is recommended to use a token cache for production applications.
   * @see https://clerk.com/docs/quickstarts/expo#configure-the-token-cache-with-expo
   */
  tokenCache?: TokenCache;
  /**
   * Note: Passkey support in Expo is currently in a limited rollout phase.
   * If you're interested in using this feature, please contact us for early access or additional details.
   *
   * @experimental This API is experimental and may change at any moment.
   */
  __experimental_passkeys?: BuildClerkOptions['__experimental_passkeys'];
  /**
   * This cache is used to store the resources that Clerk fetches from the server when the network is offline.
   *
   * @experimental This API is experimental and may change at any moment.
   */
  __experimental_resourceCache?: BuildClerkOptions['__experimental_resourceCache'];
};

const SDK_METADATA = {
  name: PACKAGE_NAME,
  version: PACKAGE_VERSION,
};

const tokenCacheReadTimeoutMs = 1_000;

type SyncableClerkInstance = {
  addListener?: (listener: (payload?: unknown) => void, options?: { skipInitialEmit?: boolean }) => () => void;
  addOnLoaded?: (listener: () => void) => void;
  client?: { lastActiveSessionId?: string | null } | null;
  loaded?: boolean;
  session?: { id?: string | null } | null;
  setActive?: (params: { session: string }) => void | Promise<void>;
  __internal_reloadInitialResources?: () => void | Promise<void>;
};

async function waitForNativeClientToken(): Promise<string | null> {
  const ClerkExpo = NativeClerkModule;
  if (!ClerkExpo?.getClientToken) {
    return null;
  }

  const maxAttempts = 30;
  const intervalMs = 100;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const nativeClientToken = await ClerkExpo.getClientToken();
    if (nativeClientToken) {
      return nativeClientToken;
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  return null;
}

async function syncClientTokenToCache(tokenCache: TokenCache | undefined, clientToken: string | null): Promise<void> {
  if (clientToken) {
    await tokenCache?.saveToken(CLERK_CLIENT_JWT_KEY, clientToken);
  } else {
    await tokenCache?.clearToken?.(CLERK_CLIENT_JWT_KEY);
  }
}

function hasActiveJsSession(clerkInstance: SyncableClerkInstance): boolean {
  return Boolean(clerkInstance.session?.id || clerkInstance.client?.lastActiveSessionId);
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

async function readCachedClientToken({
  tokenCache,
  waitForToken,
}: {
  tokenCache: TokenCache | undefined;
  waitForToken: boolean;
}): Promise<string | null> {
  const maxAttempts = waitForToken ? 30 : 1;
  const intervalMs = 100;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const token = await getCachedClientToken(tokenCache);
    if (token || !waitForToken) {
      return token;
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  return null;
}

async function syncNativeClientToJs({
  clerkInstance,
  clearMissingNativeToken,
  tokenCache,
}: {
  clerkInstance: SyncableClerkInstance;
  clearMissingNativeToken: boolean;
  tokenCache: TokenCache | undefined;
}): Promise<void> {
  const nativeClientToken = await waitForNativeClientToken();
  const effectiveTokenCache = tokenCache ?? defaultTokenCache;

  if (!nativeClientToken && !clearMissingNativeToken) {
    return;
  }

  await syncClientTokenToCache(effectiveTokenCache, nativeClientToken);
  if (typeof clerkInstance.__internal_reloadInitialResources === 'function') {
    await clerkInstance.__internal_reloadInitialResources();
  }

  const nativeActiveSessionId = clerkInstance.client?.lastActiveSessionId;
  const jsActiveSessionId = clerkInstance.session?.id;

  if (
    nativeActiveSessionId &&
    nativeActiveSessionId !== jsActiveSessionId &&
    typeof clerkInstance.setActive === 'function'
  ) {
    await clerkInstance.setActive({ session: nativeActiveSessionId });
  }
}

/**
 * Syncs JS SDK client changes to the native Clerk SDK so native components
 * (UserButton, UserProfileView) stay in sync after JS-owned resource changes.
 *
 * Must be rendered inside `ClerkReactProvider` so the Clerk instance has loaded
 * resources to emit.
 */
function NativeClientSync({
  clerkInstance,
  isSyncingNativeClientToJsRef,
  publishableKey,
  tokenCache,
}: {
  clerkInstance: SyncableClerkInstance | null | undefined;
  isSyncingNativeClientToJsRef: MutableRefObject<boolean>;
  publishableKey: string;
  tokenCache: TokenCache | undefined;
}): null {
  const { isLoaded, sessionId } = useAuth();
  const isRefreshingNativeFromJsRef = useRef(false);
  const pendingNativeRefreshWaitForTokenRef = useRef<boolean | null>(null);
  // Use the provided tokenCache, falling back to the default SecureStore cache
  const effectiveTokenCache = tokenCache ?? defaultTokenCache;

  const queueNativeRefreshFromJs = useCallback(
    (waitForToken: boolean): void => {
      if (isSyncingNativeClientToJsRef.current && !waitForToken) {
        return;
      }

      if (isRefreshingNativeFromJsRef.current) {
        pendingNativeRefreshWaitForTokenRef.current =
          pendingNativeRefreshWaitForTokenRef.current === true || waitForToken;
        return;
      }

      isRefreshingNativeFromJsRef.current = true;

      const refreshNativeFromJsClient = async (shouldWaitForToken: boolean): Promise<void> => {
        const ClerkExpo = NativeClerkModule;
        if (!ClerkExpo) {
          return;
        }

        const bearerToken = await readCachedClientToken({
          tokenCache: effectiveTokenCache,
          waitForToken: shouldWaitForToken,
        });
        if (bearerToken) {
          // configure writes the token and refreshes native client state.
          await ClerkExpo.configure(publishableKey, bearerToken);
        } else {
          const nativeClientToken = (await ClerkExpo.getClientToken?.()) ?? null;
          if (nativeClientToken) {
            // No JS token to push, but native has a stored client token to reload.
            await ClerkExpo.refreshClient();
          }
        }
        notifyNativeSessionChanged();
      };

      void (async () => {
        let waitForPendingToken = waitForToken;
        do {
          pendingNativeRefreshWaitForTokenRef.current = null;
          await refreshNativeFromJsClient(waitForPendingToken);
          waitForPendingToken = pendingNativeRefreshWaitForTokenRef.current ?? false;
        } while (pendingNativeRefreshWaitForTokenRef.current !== null);
      })()
        .catch((error: unknown) => {
          if (__DEV__) {
            console.warn('[NativeClientSync] Failed to refresh native client from JS client change:', error);
          }
        })
        .finally(() => {
          isRefreshingNativeFromJsRef.current = false;
        });
    },
    [effectiveTokenCache, isSyncingNativeClientToJsRef, publishableKey],
  );

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    queueNativeRefreshFromJs(Boolean(sessionId));
  }, [isLoaded, queueNativeRefreshFromJs, sessionId]);

  useEffect(() => {
    if (!clerkInstance || typeof clerkInstance.addListener !== 'function') {
      return;
    }

    return clerkInstance.addListener(
      () => {
        queueNativeRefreshFromJs(hasActiveJsSession(clerkInstance));
      },
      { skipInitialEmit: true },
    );
  }, [clerkInstance, queueNativeRefreshFromJs]);

  return null;
}

function useNativeSessionBootstrap({
  isSyncingNativeClientToJsRef,
  publishableKey,
  tokenCache,
  clerkInstance,
}: {
  isSyncingNativeClientToJsRef: MutableRefObject<boolean>;
  publishableKey: string;
  tokenCache: TokenCache | undefined;
  clerkInstance: SyncableClerkInstance | null | undefined;
}) {
  const initStartedRef = useRef(false);
  const sessionSyncedRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    initStartedRef.current = false;
    sessionSyncedRef.current = false;
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
            notifyNativeSessionChanged();

            const effectiveTokenCache = tokenCache ?? defaultTokenCache;
            let bearerToken: string | null = null;
            try {
              bearerToken = await getCachedClientToken(effectiveTokenCache);
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
              notifyNativeSessionChanged();
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

              if (!sessionSyncedRef.current) {
                sessionSyncedRef.current = true;
                isSyncingNativeClientToJsRef.current = true;
                try {
                  await syncNativeClientToJs({
                    clerkInstance,
                    clearMissingNativeToken: false,
                    tokenCache,
                  });
                } finally {
                  isSyncingNativeClientToJsRef.current = false;
                }
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
  }, [publishableKey, tokenCache, clerkInstance, isSyncingNativeClientToJsRef]);

  return isMountedRef;
}

export function ClerkProvider<TUi extends Ui = Ui>(props: ClerkProviderProps<TUi>): JSX.Element {
  const {
    children,
    tokenCache,
    publishableKey,
    proxyUrl,
    domain,
    __experimental_passkeys,
    experimental,
    __experimental_resourceCache,
    ...rest
  } = props;
  const pk = publishableKey;

  const clerkInstance = isNative()
    ? getClerkInstance({
        publishableKey: pk,
        tokenCache,
        proxyUrl,
        domain,
        __experimental_passkeys,
        __experimental_resourceCache,
      })
    : null;

  const isSyncingNativeClientToJsRef = useRef(false);
  const isMountedRef = useNativeSessionBootstrap({
    isSyncingNativeClientToJsRef,
    publishableKey: pk,
    tokenCache,
    clerkInstance,
  });

  // Listen for native client events and reload JS from the client source of truth.
  const { nativeClientEvent } = useNativeClientEvents();

  useEffect(() => {
    if (!nativeClientEvent || !clerkInstance) {
      return;
    }

    const syncNativeClientStateToJs = async () => {
      try {
        if (!isMountedRef.current) {
          return;
        }
        isSyncingNativeClientToJsRef.current = true;
        try {
          await syncNativeClientToJs({
            clerkInstance,
            clearMissingNativeToken: true,
            tokenCache,
          });
          notifyNativeSessionChanged();
        } finally {
          isSyncingNativeClientToJsRef.current = false;
        }
      } catch (error) {
        if (__DEV__) {
          console.error(`[ClerkProvider] Failed to sync native client state:`, error);
        }
      }
    };

    void syncNativeClientStateToJs();
  }, [nativeClientEvent, clerkInstance, tokenCache, isMountedRef]);

  // Needed for `useOAuth` / `useSSO` to work correctly on web — must stay synchronous during render
  // so the redirect URL is caught before children mount. Resolves to a no-op on native via the
  // sibling `maybeCompleteAuthSession.ts`, which keeps Metro from statically bundling
  // `expo-web-browser` (an optional peer) for native consumers.
  if (isWeb()) {
    maybeCompleteAuthSession();
  }

  return (
    <ClerkReactProvider
      // Force reset the state when the provided key changes, this ensures that the provider does not retain stale state.
      // See JS-598 for additional context.
      key={pk}
      {...rest}
      publishableKey={pk}
      proxyUrl={proxyUrl}
      domain={domain}
      sdkMetadata={SDK_METADATA}
      Clerk={clerkInstance}
      standardBrowser={!isNative()}
      experimental={{
        ...experimental,
        // force the rethrowOfflineNetworkErrors flag to true if the asyncStorage is provided
        rethrowOfflineNetworkErrors: !!__experimental_resourceCache || experimental?.rethrowOfflineNetworkErrors,
        ...(isNative() && { runtimeEnvironment: 'headless' as const }),
      }}
    >
      {isNative() && (
        <NativeClientSync
          clerkInstance={clerkInstance}
          isSyncingNativeClientToJsRef={isSyncingNativeClientToJsRef}
          publishableKey={pk}
          tokenCache={tokenCache}
        />
      )}
      {children}
    </ClerkReactProvider>
  );
}
