import './polyfills';

import { ClerkProvider as ClerkReactProvider, ClerkProviderProps as ClerkReactProviderProps } from '@clerk/clerk-react';
import React from 'react';

import type { TokenCache } from './cache';
import { isReactNative } from './runtime';
import { buildClerk } from './singleton';

export type ClerkProviderProps = ClerkReactProviderProps & {
  children: React.ReactNode;
  tokenCache?: TokenCache;
  hotload?: boolean;
};

export function ClerkProvider(props: ClerkProviderProps): JSX.Element {
  const { children, tokenCache, ...rest } = props;
  const frontendApi = props.frontendApi || process.env.CLERK_FRONTEND_API || '';

  return (
    <ClerkReactProvider
      {...rest}
      Clerk={buildClerk({ frontendApi, tokenCache })}
      standardBrowser={!isReactNative()}
    >
      {children}
    </ClerkReactProvider>
  );
}
