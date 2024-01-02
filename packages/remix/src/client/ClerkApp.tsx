import { useLoaderData } from '@remix-run/react';
import React from 'react';

import { ClerkProvider } from './RemixClerkProvider';
import type { RemixClerkProviderProps } from './types';

type ClerkAppOptions = Partial<
  Omit<RemixClerkProviderProps, 'routerPush' | 'routerReplace' | 'children' | 'clerkState'>
>;

export function ClerkApp(App: () => JSX.Element, opts: ClerkAppOptions = {}) {
  return () => {
    const { clerkState } = useLoaderData();
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
