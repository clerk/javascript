import { useLoaderData } from '@remix-run/react';
import React from 'react';

import { ClerkProvider, RemixClerkProviderProps } from './RemixClerkProvider';

type ClerkAppOptions = Partial<Omit<RemixClerkProviderProps, 'navigate' | 'children' | 'clerkState'>>;

export function ClerkApp(App: () => JSX.Element, opts: ClerkAppOptions = {}) {
  return () => {
    const { clerkState } = useLoaderData();
    return (
      <ClerkProvider
        {...opts}
        clerkState={clerkState}
      >
        <App />
      </ClerkProvider>
    );
  };
}
