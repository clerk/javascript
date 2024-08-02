import '../polyfills';

import { ClerkProvider as ClerkReactProvider } from '@clerk/clerk-react';
import * as WebBrowser from 'expo-web-browser';

import type { TokenCache } from '../cache/types';
import { isNative, isWeb } from '../utils/runtime';
import { getClerkInstance } from './singleton';

export type ClerkProviderProps = React.ComponentProps<typeof ClerkReactProvider> & {
  tokenCache?: TokenCache;
};

const SDK_METADATA = {
  name: PACKAGE_NAME,
  version: PACKAGE_VERSION,
};

export function ClerkProvider(props: ClerkProviderProps): JSX.Element {
  const { children, tokenCache, publishableKey, ...rest } = props;
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
      Clerk={isNative() ? getClerkInstance({ publishableKey: pk, tokenCache }) : null}
      standardBrowser={!isNative()}
    >
      {children}
    </ClerkReactProvider>
  );
}
