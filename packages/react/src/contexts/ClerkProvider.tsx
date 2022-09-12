import { InitialState } from '@clerk/types';
import React from 'react';

import { multipleClerkProvidersError } from '../errors';
import type { IsomorphicClerkOptions } from '../types';
import { withMaxAllowedInstancesGuard } from '../utils';
import { ClerkContextProvider } from './ClerkContextProvider';
import { StructureContext, StructureContextStates } from './StructureContext';

export interface ClerkProviderProps extends IsomorphicClerkOptions {
  children: React.ReactNode;
  initialState?: InitialState;
  publishableKey?: string;
  frontendApi?: string;
}

function ClerkProviderBase(props: ClerkProviderProps): JSX.Element {
  const { initialState, children, Clerk, frontendApi, publishableKey, ...options } = props;

  // TODO: There should be a better way to type this
  let keyOptions;
  if (typeof frontendApi === 'string' && typeof publishableKey === 'undefined') {
    keyOptions = { frontendApi: frontendApi, publishableKey: publishableKey };
  } else if (typeof frontendApi === 'undefined' && typeof publishableKey === 'string') {
    keyOptions = { frontendApi: frontendApi, publishableKey: publishableKey };
  } else {
    throw new Error('One of frontendApi or publishableKey must be set.');
  }

  return (
    <StructureContext.Provider value={StructureContextStates.noGuarantees}>
      <ClerkContextProvider
        initialState={initialState}
        isomorphicClerkOptions={{ ...keyOptions, Clerk, options }}
      >
        {children}
      </ClerkContextProvider>
    </StructureContext.Provider>
  );
}

const ClerkProvider = withMaxAllowedInstancesGuard(ClerkProviderBase, 'ClerkProvider', multipleClerkProvidersError);

ClerkProvider.displayName = 'ClerkProvider';

export { ClerkProvider };
