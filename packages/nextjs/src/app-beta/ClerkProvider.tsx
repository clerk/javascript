import React from 'react';

import { initialState } from './auth';
import { ClerkProvider as ClerkProviderClient } from './client/ClerkProvider';

export function ClerkProvider({ children }) {
  const state = initialState();
  return <ClerkProviderClient initialState={state}>{children}</ClerkProviderClient>;
}
