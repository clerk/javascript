import { InitialState } from '@clerk/types';
import React, { useEffect, useMemo, useState } from 'react';

import { multipleClerkProvidersError } from '../errors';
import IsomorphicClerk from '../isomorphicClerk';
import type { ClerkProp, IsomorphicClerkOptions } from '../types';
import { withMaxAllowedInstancesGuard } from '../utils';
import { ClerkContextProvider } from './ClerkContextProvider';
import { StructureContext, StructureContextStates } from './StructureContext';

export interface ClerkProviderProps extends IsomorphicClerkOptions {
  frontendApi?: string;
  Clerk?: ClerkProp;
  initialState?: InitialState;
}

function ClerkProviderBase(props: React.PropsWithChildren<ClerkProviderProps>) {
  const [clerkLoaded, setClerkLoaded] = useState(false);
  const clerk = useMemo(() => {
    const {
      frontendApi = '',
      Clerk: ClerkConstructor,
      initialState,
      ...rest
    } = props;
    return new IsomorphicClerk(
      frontendApi,
      rest,
      ClerkConstructor,
      initialState,
    );
  }, []);

  useEffect(() => {
    void clerk.loadClerkJS().then(() => setClerkLoaded(true));
  }, []);

  return (
    <StructureContext.Provider value={StructureContextStates.noGuarantees}>
      <ClerkContextProvider isomorphicClerk={clerk} clerkLoaded={clerkLoaded}>
        {props.children}
      </ClerkContextProvider>
    </StructureContext.Provider>
  );
}

const ClerkProvider = withMaxAllowedInstancesGuard(
  ClerkProviderBase,
  'ClerkProvider',
  multipleClerkProvidersError,
);

ClerkProvider.displayName = 'ClerkProvider';

export { ClerkProvider };
