import '../polyfills';

import { ClerkProvider as ClerkReactProvider } from '@clerk/clerk-react';

import type { TokenCache } from '../caches/types';
import { isNative } from '../utils/runtime';
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
