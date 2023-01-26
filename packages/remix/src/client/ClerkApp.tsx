import { useLoaderData } from '@remix-run/react';
import React from 'react';

import type { RemixClerkProviderProps } from './RemixClerkProvider';
import { ClerkProvider } from './RemixClerkProvider';

type ClerkAppOptions = Partial<Omit<RemixClerkProviderProps, 'navigate' | 'children' | 'clerkState'>>;

export function ClerkApp(App: () => JSX.Element, opts: ClerkAppOptions = {}) {
  return () => {
    const { clerkState } = useLoaderData();
    return (
      // @ts-expect-error
      <ClerkProvider
        {...opts}
        clerkState={clerkState}
      >
        <App />
      </ClerkProvider>
    );
  };
}
