import React, { useEffect, useMemo, useState } from 'react';

import { multipleClerkProvidersError } from '../errors';
import IsomorphicClerk from '../isomorphicClerk';
import type { ClerkProp, IsomorphicClerkOptions } from '../types';
import { withMaxAllowedInstancesGuard } from '../utils';
import { ClerkContextWrapper } from './ClerkContextWrapper';
import { StructureContext, StructureContextStates } from './StructureContext';

export interface ClerkProviderProps extends IsomorphicClerkOptions {
  frontendApi?: string;
  Clerk?: ClerkProp;
}

function ClerkProviderBase(props: React.PropsWithChildren<ClerkProviderProps>) {
  const clerk = useMemo(() => {
    const { frontendApi = '', Clerk: ClerkConstructor, ...rest } = props;
    return new IsomorphicClerk(frontendApi, rest, ClerkConstructor);
  }, []);

  const [clerkLoaded, setClerkLoaded] = useState(false);

  useEffect(() => {
    void clerk.loadClerkJS().then(() => setClerkLoaded(true));
  }, []);

  return (
    <StructureContext.Provider value={StructureContextStates.noGuarantees}>
      {clerk instanceof IsomorphicClerk && clerk.ssrData && (
        <script
          type='application/json'
          data-clerk='SSR'
          dangerouslySetInnerHTML={{ __html: clerk.ssrData }}
        />
      )}
      <ClerkContextWrapper isomorphicClerk={clerk} clerkLoaded={clerkLoaded}>
        {props.children}
      </ClerkContextWrapper>
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
