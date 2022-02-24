import { IsomorphicClerkOptions } from '@clerk/clerk-react/dist/types';
import { useLoaderData } from '@remix-run/react';
import React from 'react';

import { ClerkProvider } from './RemixClerkProvider';

type RemixConnectOptions = {
  frontendApi: string;
} & Omit<IsomorphicClerkOptions, 'navigate'>;

export function ConnectClerk(App: () => JSX.Element, opts: RemixConnectOptions) {
  return () => {
    const { clerkState } = useLoaderData();
    return (
      <ClerkProvider {...opts} clerkState={clerkState}>
        <App />
      </ClerkProvider>
    );
  };
}
