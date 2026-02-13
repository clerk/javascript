import '../polyfills';

import { ClerkProvider as ClerkReactProvider } from '@clerk/react';
import type { Ui } from '@clerk/react/internal';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { useEffect, useRef } from 'react';

import type { TokenCache } from '../cache/types';
import { useNativeAuthEvents } from '../hooks/useNativeAuthEvents';
import { isNative, isWeb } from '../utils/runtime';
import { getClerkInstance } from './singleton';
import type { BuildClerkOptions } from './singleton/types';

export type ClerkProviderProps<TUi extends Ui = Ui> = Omit<
  React.ComponentProps<typeof ClerkReactProvider<TUi>>,
  'publishableKey'
> & {
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

export function ClerkProvider<TUi extends Ui = Ui>(props: ClerkProviderProps<TUi>): JSX.Element {
  const {
    children,
    tokenCache,
    publishableKey,
    __experimental_passkeys,
    experimental,
    __experimental_resourceCache,
    ...rest
  } = props;
  const pk = publishableKey;

  // Track pending native session to sync after clerk loads
  const pendingNativeSessionRef = useRef<string | null>(null);
  const initStartedRef = useRef(false);
  const sessionSyncedRef = useRef(false);
  const prevPkRef = useRef(pk);

  // Reset refs when publishable key changes (hot-swap support)
  if (prevPkRef.current !== pk) {
    prevPkRef.current = pk;
    pendingNativeSessionRef.current = null;
    initStartedRef.current = false;
    sessionSyncedRef.current = false;
  }

  // Get the Clerk instance for syncing
  const clerkInstance = isNative()
    ? getClerkInstance({
        publishableKey: pk,
        tokenCache,
        __experimental_passkeys,
        __experimental_resourceCache,
      })
    : null;

  // Track whether the component is still mounted
  const isMountedRef = useRef(true);

  // Configure native Clerk SDK and set up session sync callback
  useEffect(() => {
    isMountedRef.current = true;

    if ((Platform.OS === 'ios' || Platform.OS === 'android') && pk && !initStartedRef.current) {
      initStartedRef.current = true;

      const configureNativeClerk = async () => {
        try {
          const { requireNativeModule } = require('expo-modules-core');
          const ClerkExpo = requireNativeModule('ClerkExpo');

          if (ClerkExpo?.configure) {
            await ClerkExpo.configure(pk);

            if (!isMountedRef.current) {
              return;
            }

            // Poll for native session (matching iOS's 3-second max wait)
            const MAX_WAIT_MS = 3000;
            const POLL_INTERVAL_MS = 100;
            let sessionId: string | null = null;

            for (let elapsed = 0; elapsed < MAX_WAIT_MS; elapsed += POLL_INTERVAL_MS) {
              if (!isMountedRef.current) {
                return;
              }
              if (ClerkExpo?.getSession) {
                const nativeSession = await ClerkExpo.getSession();
                // Normalize: iOS returns { sessionId }, Android returns { session: { id } }
                sessionId = nativeSession?.sessionId ?? (nativeSession as any)?.session?.id ?? null;
                if (sessionId) {
                  break;
                }
              }
              await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
            }

            if (!isMountedRef.current) {
              return;
            }

            if (sessionId && clerkInstance) {
              pendingNativeSessionRef.current = sessionId;

              // Wait for clerk to be loaded before syncing
              const clerkAny = clerkInstance as any;

              const waitForLoad = (): Promise<void> => {
                return new Promise(resolve => {
                  if (clerkAny.loaded) {
                    resolve();
                  } else if (typeof clerkAny.addOnLoaded === 'function') {
                    clerkAny.addOnLoaded(() => resolve());
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

              if (!sessionSyncedRef.current && typeof clerkInstance.setActive === 'function') {
                sessionSyncedRef.current = true;
                const pendingSession = pendingNativeSessionRef.current;

                // If the native session is not in the client's sessions list,
                // reload the client from the API so setActive can find it.
                const sessionInClient = clerkInstance.client?.sessions?.some(
                  (s: { id: string }) => s.id === pendingSession,
                );
                if (!sessionInClient && typeof clerkAny.__internal_reloadInitialResources === 'function') {
                  await clerkAny.__internal_reloadInitialResources();
                }

                try {
                  await clerkInstance.setActive({ session: pendingSession });
                } catch (err) {
                  console.error(`[ClerkProvider] Failed to sync native session:`, err);
                }
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
          } else {
            console.error(`[ClerkProvider] Failed to configure Clerk ${Platform.OS}:`, error);
          }
        }
      };
      configureNativeClerk();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [pk, clerkInstance]);

  // Listen for native auth state changes and sync to JS SDK
  const { nativeAuthState } = useNativeAuthEvents();

  useEffect(() => {
    if (!nativeAuthState || !clerkInstance) {
      return;
    }

    const syncNativeAuthToJs = async () => {
      try {
        if (nativeAuthState.type === 'signedIn' && nativeAuthState.sessionId && clerkInstance.setActive) {
          // Ensure the session exists in the client before calling setActive
          const sessionInClient = clerkInstance.client?.sessions?.some(
            (s: { id: string }) => s.id === nativeAuthState.sessionId,
          );
          if (!sessionInClient) {
            const clerkAny = clerkInstance as any;
            if (typeof clerkAny.__internal_reloadInitialResources === 'function') {
              await clerkAny.__internal_reloadInitialResources();
            }
            if (!isMountedRef.current) {
              return;
            }
          }

          if (!isMountedRef.current) {
            return;
          }
          await clerkInstance.setActive({ session: nativeAuthState.sessionId });
        } else if (nativeAuthState.type === 'signedOut' && clerkInstance.signOut) {
          if (!isMountedRef.current) {
            return;
          }
          await clerkInstance.signOut();
        }
      } catch (error) {
        console.error(`[ClerkProvider] Failed to sync native auth state:`, error);
      }
    };

    syncNativeAuthToJs();
  }, [nativeAuthState, clerkInstance]);

  if (isWeb()) {
    // This is needed in order for useOAuth to work correctly on web.
    WebBrowser.maybeCompleteAuthSession();
  }

  return (
    <ClerkReactProvider
      // Force reset the state when the provided key changes, this ensures that the provider does not retain stale state.
      // See JS-598 for additional context.
      key={pk}
      {...rest}
      publishableKey={pk}
      sdkMetadata={SDK_METADATA}
      Clerk={clerkInstance}
      standardBrowser={!isNative()}
      experimental={{
        ...experimental,
        // force the rethrowOfflineNetworkErrors flag to true if the asyncStorage is provided
        rethrowOfflineNetworkErrors: !!__experimental_resourceCache || experimental?.rethrowOfflineNetworkErrors,
      }}
    >
      {children}
    </ClerkReactProvider>
  );
}
