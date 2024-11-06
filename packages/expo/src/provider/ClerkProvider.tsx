import '../polyfills';

import { ClerkProvider as ClerkReactProvider } from '@clerk/clerk-react';
import * as WebBrowser from 'expo-web-browser';

import type { TokenCache } from '../cache/types';
import { isNative, isWeb } from '../utils/runtime';
import { getClerkInstance } from './singleton';
import type { BuildClerkOptions } from './singleton/types';

export type ClerkProviderProps = React.ComponentProps<typeof ClerkReactProvider> & {
  /**
   * The token cache is used to persist the active user's session token. Clerk stores this token in memory by default, however it is recommended to use a token cache for production applications.
   * @see https://clerk.com/docs/quickstarts/expo#configure-the-token-cache-with-expo
   */
  tokenCache?: TokenCache;
  passkeys?: BuildClerkOptions['passkeys'];
};

const SDK_METADATA = {
  name: PACKAGE_NAME,
  version: PACKAGE_VERSION,
};

export function ClerkProvider(props: ClerkProviderProps): JSX.Element {
  const { children, tokenCache, publishableKey, passkeys, ...rest } = props;
  const pk = publishableKey || process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY || '';

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
              passkeys,
            })
          : null
      }
      standardBrowser={!isNative()}
    >
      {children}
    </ClerkReactProvider>
  );
}
