import { useLoaderData } from '@remix-run/react';
import React from 'react';

import { assertPublishableKeyInSpaMode, inSpaMode } from '../utils';
import { ClerkProvider } from './RemixClerkProvider';
import type { RemixClerkProviderProps } from './types';

type ClerkAppOptions = Partial<
  Omit<RemixClerkProviderProps, 'routerPush' | 'routerReplace' | 'children' | 'clerkState'>
>;

export function ClerkApp(App: () => JSX.Element, opts: ClerkAppOptions = {}) {
  return () => {
    let clerkState;
    const isSpaMode = inSpaMode();

    // Don't use `useLoaderData` to fetch the clerk state if we're in SPA mode
    if (!isSpaMode) {
      const loaderData = useLoaderData<{ clerkState: any }>();
      clerkState = loaderData.clerkState;
    }

    if (isSpaMode) {
      assertPublishableKeyInSpaMode(opts.publishableKey);
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
