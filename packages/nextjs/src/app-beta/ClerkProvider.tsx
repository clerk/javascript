import React from 'react';

import { initialState } from './auth';
import { ClerkProvider as ClerkProviderClient } from './client/ClerkProvider';

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  const state = initialState()?.__clerk_ssr_state || { sessionId: null, orgId: null, userId: null };
  return <ClerkProviderClient initialState={state}>{children}</ClerkProviderClient>;
}
