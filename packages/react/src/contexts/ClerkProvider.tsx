import { InitialState } from '@clerk/types';
import React from 'react';

import { multipleClerkProvidersError } from '../errors';
import type { IsomorphicClerkOptions } from '../types';
import { withMaxAllowedInstancesGuard } from '../utils';
import { ClerkContextProvider } from './ClerkContextProvider';
import { StructureContext, StructureContextStates } from './StructureContext';

export interface ClerkProviderProps extends IsomorphicClerkOptions {
  children: React.ReactNode;
  frontendApi?: string;
  initialState?: InitialState;
}

function ClerkProviderBase(props: ClerkProviderProps): JSX.Element {
  const { initialState, children, Clerk, frontendApi, ...options } = props;
  return (
    <StructureContext.Provider value={StructureContextStates.noGuarantees}>
      <ClerkContextProvider
        initialState={initialState}
        isomorphicClerkOptions={{ frontendApi: frontendApi || '', Clerk, options }}
      >
        {children}
      </ClerkContextProvider>
    </StructureContext.Provider>
  );
}

const ClerkProvider = withMaxAllowedInstancesGuard(ClerkProviderBase, 'ClerkProvider', multipleClerkProvidersError);

ClerkProvider.displayName = 'ClerkProvider';

export { ClerkProvider };
