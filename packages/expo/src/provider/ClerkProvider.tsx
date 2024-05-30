import '../polyfills';

import { ClerkProvider as ClerkReactProvider } from '@clerk/clerk-react';
import React from 'react';

import type { TokenCache } from './cache';
import { getClerkInstance } from './singleton';
import { MemoryTokenCache } from './cache';
import { buildClerk } from './singleton';
import { isNative } from './utils/runtime';

export type ClerkProviderProps = React.ComponentProps<typeof ClerkReactProvider> & {
  tokenCache?: TokenCache;
};

export function ClerkProvider(props: ClerkProviderProps): JSX.Element {
  const { children, tokenCache, publishableKey, ...rest } = props;
  const pk = publishableKey || process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY || '';

  return (
    <ClerkReactProvider
      // Force reset the state when the provided key changes, this ensures that the provider does not retain stale state.
      // See JS-598 for additional context.
      key={key}
      {...rest}
      publishableKey={key}
      Clerk={isNative() ? getClerkInstance({ publishableKey: pk, tokenCache }) : null}
      standardBrowser={!isNative()}
    >
      {children}
    </ClerkReactProvider>
  );
}
