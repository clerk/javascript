import './polyfills';

import type { ClerkProviderProps as ClerkReactProviderProps } from '@clerk/clerk-react';
import { ClerkProvider as ClerkReactProvider } from '@clerk/clerk-react';
import React from 'react';

import type { TokenCache } from './cache';
import { isReactNative } from './runtime';
import { getClerkInstance } from './singleton';

export type ClerkProviderProps = ClerkReactProviderProps & {
  tokenCache?: TokenCache;
};

export function ClerkProvider(props: ClerkProviderProps): JSX.Element {
  const { children, tokenCache, publishableKey, ...rest } = props;
  const pk = publishableKey || process.env.CLERK_PUBLISHABLE_KEY || '';

  return (
    <ClerkReactProvider
      // Force reset the state when the provided key changes, this ensures that the provider does not retain stale state.
      // See JS-598 for additional context.
      key={pk}
      {...rest}
      publishableKey={pk}
      Clerk={getClerkInstance({ publishableKey: pk, tokenCache })}
      standardBrowser={!isReactNative()}
    >
      {children}
    </ClerkReactProvider>
  );
}
