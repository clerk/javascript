import '../polyfills';

import type { ClerkProviderProps as ReactClerkProviderProps } from '@clerk/react';
import { InternalClerkProvider as ClerkReactProvider, type Ui } from '@clerk/react/internal';
import { useRef } from 'react';

import type { TokenCache } from '../cache/types';
import { isNative, isWeb } from '../utils/runtime';
import { maybeCompleteAuthSession } from './maybeCompleteAuthSession';
import {
  type DeviceTokenCacheListener,
  NativeClientSync,
  type NativeRefreshFromJsController,
  useNativeClientBootstrap,
  useNativeClientEventSync,
  useSyncableTokenCache,
} from './nativeClientSync';
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
  const tokenCacheListenersRef = useRef<Set<DeviceTokenCacheListener>>(new Set());
  const suppressTokenCacheNotificationsRef = useRef(0);
  const nativeRefreshFromJsControllerRef = useRef<NativeRefreshFromJsController | null>(null);
  const syncableTokenCache = useSyncableTokenCache({
    suppressTokenCacheNotificationsRef,
    tokenCache,
    tokenCacheListenersRef,
  });

  const clerkInstance = isNative()
    ? getClerkInstance({
        publishableKey: pk,
        tokenCache: syncableTokenCache,
        proxyUrl,
        domain,
        __experimental_passkeys,
        __experimental_resourceCache,
      })
    : null;

  const suppressJsClientChangedRef = useRef(0);
  const isMountedRef = useNativeClientBootstrap({
    publishableKey: pk,
    suppressTokenCacheNotificationsRef,
    tokenCache: syncableTokenCache,
    clerkInstance,
  });
  useNativeClientEventSync({
    clerkInstance,
    isMountedRef,
    nativeRefreshFromJsControllerRef,
    suppressJsClientChangedRef,
    suppressTokenCacheNotificationsRef,
    tokenCache: syncableTokenCache,
  });

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
          nativeRefreshFromJsControllerRef={nativeRefreshFromJsControllerRef}
          suppressJsClientChangedRef={suppressJsClientChangedRef}
          suppressTokenCacheNotificationsRef={suppressTokenCacheNotificationsRef}
          tokenCache={syncableTokenCache}
          tokenCacheListenersRef={tokenCacheListenersRef}
        />
      )}
      {children}
    </ClerkReactProvider>
  );
}
