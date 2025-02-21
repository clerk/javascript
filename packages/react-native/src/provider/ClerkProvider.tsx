import '../polyfills';

import { ClerkProvider as ClerkReactProvider } from '@clerk/clerk-react';
import { WebView } from 'react-native-webview';

import type { TokenCache } from '../cache/types';
import { isNative, isWeb } from '../utils/runtime';
import { getClerkInstance } from './singleton';
import type { BuildClerkOptions } from './singleton/types';

export type ClerkProviderProps = React.ComponentProps<typeof ClerkReactProvider> & {
  /**
   * The token cache is used to persist the active user's session token. Clerk stores this token in memory by default, however it is recommended to use a token cache for production applications.
   * @see https://clerk.com/docs/quickstarts/react-native#configure-the-token-cache-with-react-native
   */
  tokenCache?: TokenCache;
  /**
   * Note: Passkey support in React Native is currently not as far as Expo, which is in a limited rollout phase. Do not expect it to work yet.
   * If you're interested in using this feature, please contact us for early access or additional details.
   * This API is experimental and may change at any moment.
   * @experimental
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

export function ClerkProvider(props: ClerkProviderProps): JSX.Element {
  const {
    children,
    tokenCache,
    publishableKey,
    __experimental_passkeys,
    experimental,
    __experimental_resourceCache,
    ...rest
  } = props;
  const pk = publishableKey || process.env.CLERK_PUBLISHABLE_KEY || '';

  if (isWeb()) {
    // This is needed in order for useOAuth to work correctly on web.
    maybeCompleteAuthSession();
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

/**
 *  replaces Expo WebBrowser function with React Native WebView
 */
function maybeCompleteAuthSession() {
  const url = window.location.href;
  if (url.includes('?') && (url.includes('code=') || url.includes('error='))) {
    return (
      <WebView
        source={{ uri: url }}
        style={{ width: 0, height: 0 }}
        onLoadEnd={syntheticEvent => {
          const { nativeEvent } = syntheticEvent;
          if (nativeEvent.url !== url) {
            window.location.href = nativeEvent.url;
          }
        }}
      />
    );
  }
  return null;
}
