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
  const { children, tokenCache, hotload, ...rest } = props;
  const frontendApi = props.frontendApi || process.env.CLERK_FRONTEND_API || '';

  const clerkRef = React.useRef<ReturnType<typeof buildClerk> | null>(null);

  function getClerk() {
    if (clerkRef.current === null && !hotload) {
      clerkRef.current = buildClerk({
        frontendApi,
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
