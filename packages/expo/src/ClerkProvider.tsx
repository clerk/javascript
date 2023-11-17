import './polyfills';

import type { ClerkProviderProps as ClerkReactProviderProps } from '@clerk/clerk-react';
import { __internal__setErrorThrowerOptions, ClerkProvider as ClerkReactProvider } from '@clerk/clerk-react';
import React from 'react';

import type { TokenCache } from './cache';
import { MemoryTokenCache } from './cache';
import { isReactNative } from './runtime';
import { buildClerk } from './singleton';

__internal__setErrorThrowerOptions({
  packageName: '@clerk/expo',
});

export type ClerkProviderProps = ClerkReactProviderProps & {
  tokenCache?: TokenCache;
};

export function ClerkProvider(props: ClerkProviderProps): JSX.Element {
  const { children, tokenCache = MemoryTokenCache, publishableKey, ...rest } = props;
  const key = publishableKey || process.env.CLERK_PUBLISHABLE_KEY || '';

  return (
    <ClerkReactProvider
      // Force reset the state when the provided key changes, this ensures that the provider does not retain stale state.
      // See JS-598 for additional context.
      key={key}
      {...rest}
      publishableKey={key}
      Clerk={buildClerk({ key, tokenCache })}
      standardBrowser={!isReactNative()}
    >
      {children}
    </ClerkReactProvider>
  );
}
