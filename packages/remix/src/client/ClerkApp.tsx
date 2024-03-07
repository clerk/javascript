import { useLoaderData, useRouteError } from '@remix-run/react';
import React from 'react';

import { ClerkErrorBoundary } from '.';
import type { RemixClerkProviderProps } from './RemixClerkProvider';
import { ClerkProvider } from './RemixClerkProvider';

type ClerkAppOptions = Partial<Omit<RemixClerkProviderProps, 'navigate' | 'children' | 'clerkState'>>;

export function ClerkApp(App: () => JSX.Element, opts: ClerkAppOptions = {}) {
  return () => {
    // @ts-expect-error - we know clerkState is in the loader data
    const { clerkState } = useLoaderData();
    const error = useRouteError();

    if (error) {
      return ClerkErrorBoundary();
    }

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
