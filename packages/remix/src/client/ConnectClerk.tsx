import { useLoaderData } from '@remix-run/react';
import React from 'react';

import { ClerkProvider, RemixClerkProviderProps } from './RemixClerkProvider';

type ConnectClerkOptions = Partial<Omit<RemixClerkProviderProps, 'navigate'>>;

export function ConnectClerk(App: () => JSX.Element, opts: ConnectClerkOptions) {
  return () => {
    const { clerkState } = useLoaderData();
    return (
      <ClerkProvider {...opts} clerkState={clerkState}>
        <App />
      </ClerkProvider>
    );
  };
}
