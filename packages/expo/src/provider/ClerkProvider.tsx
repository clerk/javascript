import '../polyfills';

import type { ClerkProviderProps as ReactClerkProviderProps } from '@clerk/react';
import { useAuth } from '@clerk/react';
import { InternalClerkProvider as ClerkReactProvider, type Ui } from '@clerk/react/internal';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import type { TokenCache } from '../cache/types';
import { CLERK_CLIENT_JWT_KEY } from '../constants';
import { useNativeAuthEvents } from '../hooks/useNativeAuthEvents';
import NativeClerkModule from '../specs/NativeClerkModule';
import { tokenCache as defaultTokenCache } from '../token-cache';
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

type NativeSessionResult = {
  sessionId?: string;
  session?: { id?: string };
  user?: { id?: string };
} | null;

function getNativeSessionId(nativeSession: NativeSessionResult): string | null {
  return nativeSession?.sessionId ?? nativeSession?.session?.id ?? null;
}

async function saveNativeClientTokenToJs(tokenCache: TokenCache | undefined): Promise<void> {
  const ClerkExpo = NativeClerkModule;
  if (!ClerkExpo?.getClientToken) {
    return;
  }

  const nativeClientToken = await ClerkExpo.getClientToken();
  if (nativeClientToken) {
    const effectiveTokenCache = tokenCache ?? defaultTokenCache;
    await effectiveTokenCache?.saveToken(CLERK_CLIENT_JWT_KEY, nativeClientToken);
  }
}

async function syncNativeSessionToJs({
  sessionId,
  clerkInstance,
  tokenCache,
}: {
  sessionId: string;
  clerkInstance: any;
  tokenCache: TokenCache | undefined;
}) {
  await saveNativeClientTokenToJs(tokenCache);

  const sessionInClient = clerkInstance.client?.sessions?.some((s: { id: string }) => s.id === sessionId);
  if (!sessionInClient) {
    if (typeof clerkInstance.__internal_reloadInitialResources === 'function') {
      await clerkInstance.__internal_reloadInitialResources();
    }
  }

  if (typeof clerkInstance.setActive === 'function') {
    await clerkInstance.setActive({ session: sessionId });
  }
}

/**
 * Syncs JS SDK auth state to the native Clerk SDK.
 *
 * When a user authenticates via the JS SDK (custom sign-in forms, useSignIn, etc.)
 * rather than through native `<AuthView />`, the native SDK doesn't know about the
 * session. This component watches for JS auth state changes and pushes the bearer
 * token to the native SDK so native components (UserButton, UserProfileView) work.
 *
 * Must be rendered inside `ClerkReactProvider` so `useAuth()` has access to context.
 */
function NativeSessionSync({
  publishableKey,
  tokenCache,
}: {
  publishableKey: string;
  tokenCache: TokenCache | undefined;
}) {
  const { isSignedIn, isLoaded } = useAuth();
  const hasSyncedRef = useRef(false);
  const wasSignedInRef = useRef(false);
  // Use the provided tokenCache, falling back to the default SecureStore cache
  const effectiveTokenCache = tokenCache ?? defaultTokenCache;

  useEffect(() => {
    if (!isSignedIn) {
      hasSyncedRef.current = false;

      // Only propagate a JS sign-out after this provider has observed a signed-in
      // JS state. On cold start, JS may briefly be signed out while native still
      // has the persisted session that ClerkProvider is about to activate.
      if (isLoaded && wasSignedInRef.current) {
        wasSignedInRef.current = false;

        const clearNativeSession = async () => {
          const ClerkExpo = NativeClerkModule;
          if (!ClerkExpo?.signOut || !ClerkExpo?.getSession) {
            return;
          }

          const nativeSession = (await ClerkExpo.getSession()) as NativeSessionResult;
          if (getNativeSessionId(nativeSession)) {
            await ClerkExpo.signOut();
          }
        };

        void clearNativeSession().catch((error: unknown) => {
          if (__DEV__) {
            console.warn('[NativeSessionSync] Failed to clear native session:', error);
          }
        });
      } else if (isLoaded) {
        wasSignedInRef.current = false;
      }

      return;
    }

    wasSignedInRef.current = true;

    if (hasSyncedRef.current) {
      return;
    }

    const syncToNative = async () => {
      try {
        const ClerkExpo = NativeClerkModule;
        if (!ClerkExpo?.configure || !ClerkExpo?.getSession) {
          return;
        }

        // Check if native already has a hydrated session (e.g. auth via AuthView or initial load)
        const nativeSession = (await ClerkExpo.getSession()) as NativeSessionResult;
        const hasNativeSession = !!getNativeSessionId(nativeSession);
        const hasNativeUser = !!nativeSession?.user?.id;

        if (hasNativeSession && hasNativeUser) {
          hasSyncedRef.current = true;
          return;
        }

        // Read the JS SDK's client JWT and push it to the native SDK
        const bearerToken = (await effectiveTokenCache?.getToken(CLERK_CLIENT_JWT_KEY)) ?? null;
        if (bearerToken) {
          await ClerkExpo.configure(publishableKey, bearerToken);
          hasSyncedRef.current = true;
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('[NativeSessionSync] Failed to sync JS session to native:', error);
        }
      }
    };

    void syncToNative();
  }, [isSignedIn, isLoaded, publishableKey, effectiveTokenCache]);

  return null;
}

function useNativeSessionBootstrap({
  publishableKey,
  tokenCache,
  clerkInstance,
}: {
  publishableKey: string;
  tokenCache: TokenCache | undefined;
  clerkInstance: any;
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
            const effectiveTokenCache = tokenCache ?? defaultTokenCache;
            let bearerToken: string | null = null;
            try {
              bearerToken = (await effectiveTokenCache?.getToken(CLERK_CLIENT_JWT_KEY)) ?? null;
            } catch (e) {
              if (__DEV__) {
                console.warn('[ClerkProvider] Token cache read failed:', e);
              }
            }

            await ClerkExpo.configure(publishableKey, bearerToken);

            if (!isMountedRef.current) {
              return;
            }

            const MAX_WAIT_MS = 3000;
            const POLL_INTERVAL_MS = 100;
            let sessionId: string | null = null;

            for (let elapsed = 0; elapsed < MAX_WAIT_MS; elapsed += POLL_INTERVAL_MS) {
              if (!isMountedRef.current) {
                return;
              }
              if (ClerkExpo?.getSession) {
                const nativeSession = (await ClerkExpo.getSession()) as NativeSessionResult;
                sessionId = getNativeSessionId(nativeSession);
                if (sessionId && nativeSession?.user?.id) {
                  break;
                }
              }
              await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
            }

            if (!isMountedRef.current) {
              return;
            }

            if (sessionId && clerkInstance) {
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
                await syncNativeSessionToJs({
                  sessionId,
                  clerkInstance,
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
  }, [publishableKey, tokenCache, clerkInstance]);

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

  const isMountedRef = useNativeSessionBootstrap({
    publishableKey: pk,
    tokenCache,
    clerkInstance,
  });

  // Listen for native auth state changes and sync to JS SDK
  const { nativeAuthState } = useNativeAuthEvents();

  useEffect(() => {
    if (!nativeAuthState || !clerkInstance) {
      return;
    }

    const syncNativeAuthToJs = async () => {
      try {
        if (nativeAuthState.type === 'signedIn' && nativeAuthState.sessionId && clerkInstance.setActive) {
          if (!isMountedRef.current) {
            return;
          }
          await syncNativeSessionToJs({
            sessionId: nativeAuthState.sessionId,
            clerkInstance,
            tokenCache,
          });
        } else if (nativeAuthState.type === 'signedOut') {
          if (!isMountedRef.current) {
            return;
          }
          const clerkAny = clerkInstance as any;
          if (typeof clerkAny.handleUnauthenticated === 'function') {
            await clerkAny.handleUnauthenticated();
          } else if (clerkInstance.signOut) {
            await clerkInstance.signOut();
          }
        }
      } catch (error) {
        if (__DEV__) {
          console.error(`[ClerkProvider] Failed to sync native auth state:`, error);
        }
      }
    };

    void syncNativeAuthToJs();
  }, [nativeAuthState, clerkInstance, tokenCache, isMountedRef]);

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
        <NativeSessionSync
          publishableKey={pk}
          tokenCache={tokenCache}
        />
      )}
      {children}
    </ClerkReactProvider>
  );
}
