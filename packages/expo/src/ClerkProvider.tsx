import './polyfills';

import {
  __internal__setErrorThrowerOptions,
  ClerkProvider as ClerkReactProvider,
  ClerkProviderProps as ClerkReactProviderProps,
} from '@clerk/clerk-react';
import React from 'react';

import type { TokenCache } from './cache';
import { isReactNative } from './runtime';
import { buildClerk } from './singleton';

__internal__setErrorThrowerOptions({
  packageName: '@clerk/expo',
});

export type ClerkProviderProps = ClerkReactProviderProps & {
  children: React.ReactNode;
  tokenCache?: TokenCache;
};

export function ClerkProvider(props: ClerkProviderProps): JSX.Element {
  const { children, tokenCache, ...rest } = props;
  const publishableKey =
    props.publishableKey || process.env.CLERK_PUBLISHABLE_KEY || process.env.CLERK_FRONTEND_API || '';

  const clerkRef = React.useRef<ReturnType<typeof buildClerk> | null>(null);

  function getClerk() {
    if (clerkRef.current === null) {
      clerkRef.current = buildClerk({
        publishableKey,
        tokenCache,
      });
    }
    return clerkRef.current;
  }

  return (
    <ClerkReactProvider
      {...rest}
      Clerk={getClerk()}
      standardBrowser={!isReactNative()}
    >
      {children}
    </ClerkReactProvider>
  );
}
