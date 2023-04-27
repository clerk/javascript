import type { IsomorphicClerkOptions } from '@clerk/clerk-react/dist/types';
import type { InitialState, PublishableKeyOrFrontendApi } from '@clerk/types';
import React from 'react';

import { ClientClerkProvider } from '../client/ClerkProvider';
import { initialState } from './auth';

type NextAppClerkProviderProps = React.PropsWithChildren<
  Omit<IsomorphicClerkOptions, keyof PublishableKeyOrFrontendApi> & Partial<PublishableKeyOrFrontendApi>
>;

export function ClerkProvider(props: NextAppClerkProviderProps) {
  const state = initialState()?.__clerk_ssr_state as InitialState;

  return (
    // @ts-ignore
    <ClientClerkProvider
      frontendApi={process.env.NEXT_PUBLIC_CLERK_FRONTEND_API || ''}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ''}
      proxyUrl={process.env.NEXT_PUBLIC_CLERK_PROXY_URL}
      initialState={state}
      {...props}
    />
  );
}
