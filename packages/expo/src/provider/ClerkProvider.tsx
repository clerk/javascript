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

  // Configure Clerk iOS SDK
  useEffect(() => {
    if (Platform.OS === 'ios' && pk) {
      const configureClerk = async () => {
        try {
          const { requireNativeModule } = require('expo-modules-core');
          const ClerkExpo = requireNativeModule('ClerkExpo');
          if (ClerkExpo?.configure) {
            await ClerkExpo.configure(pk);
            console.log('[ClerkProvider] Configured Clerk iOS SDK');
          }
        } catch (error) {
          console.error('[ClerkProvider] Failed to configure Clerk iOS:', error);
        }
      };
      configureClerk();
    }
  }, [pk]);

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
      Clerk={
        isNative()
          ? getClerkInstance({
              publishableKey: pk,
              tokenCache,
              __experimental_passkeys,
              __experimental_resourceCache,
            })
          : null
      }
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
