// import type { ClerkProviderProps } from '@clerk/clerk-react';
import React from 'react';

import { initialState } from './auth';
import type { NextAppBetaClerkProviderProps } from './client/ClerkProvider';
import { ClerkProvider as ClerkProviderClient } from './client/ClerkProvider';

export function ClerkProvider({ children, ...restProps }: NextAppBetaClerkProviderProps) {
  const state = initialState()?.__clerk_ssr_state || { sessionId: null, orgId: null, userId: null };

  return (
    <ClerkProviderClient
      {...restProps}
      initialState={state as any}
    >
      {children}
    </ClerkProviderClient>
  );
}
