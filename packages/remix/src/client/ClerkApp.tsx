import { useLoaderData } from '@remix-run/react';
import React from 'react';

import { ClerkProvider } from './RemixClerkProvider';
import type { RemixClerkProviderProps } from './types';

type SpaModeOptions = { spaMode: true; publishableKey: string } | { spaMode?: false; publishableKey?: string };

type ClerkAppOptions = Partial<
  Omit<RemixClerkProviderProps, 'routerPush' | 'routerReplace' | 'children' | 'clerkState' | 'publishableKey'>
> &
  SpaModeOptions;

export function ClerkApp(App: () => JSX.Element, opts: ClerkAppOptions = {}) {
  return () => {
    let clerkState;

    // Don't use `useLoaderData` to fetch the clerk state if we're in SPA mode
    if (!opts?.spaMode) {
      const loaderData = useLoaderData<{ clerkState: any }>();
      clerkState = loaderData.clerkState;
    }

    return (
      <ClerkProvider
        /* @ts-ignore The type of opts cannot be inferred by TS automatically because of the complex
         * discriminated unions required for the router props and multidomain feature   */
        {...(opts as RemixClerkProviderProps)}
        clerkState={clerkState}
      >
        <App />
      </ClerkProvider>
    );
  };
}
