import type { IsomorphicClerkOptions } from '@clerk/clerk-react';
import type { InitialState, PublishableKeyOrFrontendApi } from '@clerk/types';
import React from 'react';

import { initialState } from './auth';
import { ClerkProvider as ClerkProviderClient } from './client/ClerkProvider';

type NextAppClerkProviderProps = {
  children: React.ReactNode;
} & Omit<IsomorphicClerkOptions, keyof PublishableKeyOrFrontendApi> &
  Partial<PublishableKeyOrFrontendApi>;

export function ClerkProvider(props: NextAppClerkProviderProps) {
  const state = (initialState()?.__clerk_ssr_state || { sessionId: null, orgId: null, userId: null }) as InitialState;
  return (
    // @ts-expect-error
    <ClerkProviderClient
      frontendApi={process.env.NEXT_PUBLIC_CLERK_FRONTEND_API || ''}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ''}
      proxyUrl={process.env.NEXT_PUBLIC_CLERK_PROXY_URL}
      initialState={state}
      {...props}
    />
  );
}
