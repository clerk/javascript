import React from 'react';

import { assertPublishableKeyInSpaMode, inSpaMode } from '../utils';
import { ClerkProvider } from './ReactRouterClerkProvider';
import type { ReactRouterClerkProviderProps } from './types';

type ClerkAppOptions = Partial<
  Omit<ReactRouterClerkProviderProps, 'routerPush' | 'routerReplace' | 'children' | 'clerkState'>
>;

export function ClerkApp(App: () => JSX.Element, opts: ClerkAppOptions = {}) {
  return ({ loaderData }) => {
    let clerkState;
    const isSpaMode = inSpaMode();

    // Don't use `useLoaderData` to fetch the clerk state if we're in SPA mode
    if (!isSpaMode) {
      console.log({ loaderData });
      clerkState = loaderData.clerkState;
    }

    if (isSpaMode) {
      assertPublishableKeyInSpaMode(opts.publishableKey);
    }

    return (
      <ClerkProvider
        /* @ts-ignore The type of opts cannot be inferred by TS automatically because of the complex
         * discriminated unions required for the router props and multidomain feature   */
        {...(opts as ReactRouterClerkProviderProps)}
        clerkState={clerkState}
      >
        <App />
      </ClerkProvider>
    );
  };
}
