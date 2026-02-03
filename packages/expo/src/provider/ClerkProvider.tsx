import '../polyfills';

import { ClerkProvider as ClerkReactProvider } from '@clerk/react';
import type { Ui } from '@clerk/react/internal';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { useEffect } from 'react';

import type { TokenCache } from '../cache/types';
import { isNative, isWeb } from '../utils/runtime';
import { getClerkInstance } from './singleton';
import type { BuildClerkOptions } from './singleton/types';

export type ClerkProviderProps<TUi extends Ui = Ui> = Omit<
  React.ComponentProps<typeof ClerkReactProvider<TUi>>,
  'publishableKey'
> & {
  /**
   * Used to override the default EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY env variable if needed.
   * This is optional for Expo as the ClerkProvider will automatically use the EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY env variable if it exists.
   */
  publishableKey?: string;
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
  const pk = publishableKey || process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY || '';

  // Get the Clerk instance for syncing
  const clerkInstance = isNative()
    ? getClerkInstance({
        publishableKey: pk,
        tokenCache,
        __experimental_passkeys,
        __experimental_resourceCache,
      })
    : null;

  // Configure native Clerk SDK (iOS and Android) and sync session state
  useEffect(() => {
    if ((Platform.OS === 'ios' || Platform.OS === 'android') && pk) {
      const configureAndSyncClerk = async () => {
        try {
          const { requireNativeModule } = require('expo-modules-core');
          const ClerkExpo = requireNativeModule('ClerkExpo');
          if (ClerkExpo?.configure) {
            await ClerkExpo.configure(pk);
            console.log(`[ClerkProvider] Configured Clerk ${Platform.OS} SDK`);

            // Check if native SDK has an existing session and sync to JS
            if (ClerkExpo?.getSession) {
              const nativeSession = await ClerkExpo.getSession();
              // Check for actual session data, not just truthy object (empty {} is truthy)
              if (nativeSession?.session) {
                console.log(`[ClerkProvider] Native session found, syncing to JS SDK...`);
                // Reload JS SDK state from backend to pick up the session
                if ((clerkInstance as any)?.__internal_reloadInitialResources) {
                  await (clerkInstance as any).__internal_reloadInitialResources();
                  console.log(`[ClerkProvider] JS SDK state synced`);
                }
              }
            }
          }
        } catch (error) {
          // Native module not found is expected when the @clerk/expo plugin isn't configured
          // This is fine - the JS SDK will work without native features
          const isNativeModuleNotFound = error instanceof Error && error.message.includes('Cannot find native module');
          if (isNativeModuleNotFound) {
            // Silent in production, debug log only
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
      configureAndSyncClerk();
    }
  }, [pk, clerkInstance]);

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
