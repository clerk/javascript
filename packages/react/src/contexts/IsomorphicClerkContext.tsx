import type { LoadedClerk } from '@clerk/types';
import React, { useContext } from 'react';

import {
  StructureContext,
  StructureContextStates,
} from '../contexts/StructureContext';
import { hocChildrenNotAFunctionError } from '../errors';
import IsomorphicClerk from '../isomorphicClerk';
import { inBrowser } from '../utils';
import {
  assertClerkLoadedGuarantee,
  assertWrappedByClerkProvider,
} from './assertHelpers';

type IsomorphicClerkContextValue = {
  value: IsomorphicClerk;
};
export const IsomorphicClerkContext = React.createContext<
  IsomorphicClerkContextValue | undefined
>(undefined);
IsomorphicClerkContext.displayName = 'IsomorphicClerkContext';

export const useClerk = (): LoadedClerk => {
  const structureCtx = useContext(StructureContext);
  const clerkCtx = useContext(IsomorphicClerkContext);
  assertWrappedByClerkProvider(structureCtx);
  assertWrappedByClerkProvider(clerkCtx);
  assertClerkLoadedGuarantee(structureCtx.guaranteedLoaded, 'useClerk()');
  assertClerkLoadedGuarantee(clerkCtx.value, 'useClerk()');
  //  The value is an instance of IsomorphicClerk, not Clerk
  // TODO: Remove type cast
  return (clerkCtx.value as unknown) as LoadedClerk;
};

export const withClerk = <P extends { clerk: LoadedClerk }>(
  Component: React.ComponentType<P>,
  displayName?: string,
) => {
  displayName =
    displayName || Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;
  const HOC = (props: Omit<P, 'clerk'>) => {
    const structureCtx = useContext(StructureContext);
    const clerkCtx = useContext(IsomorphicClerkContext);

    if (!inBrowser()) {
      return null;
    }

    assertWrappedByClerkProvider(structureCtx);
    assertWrappedByClerkProvider(clerkCtx);

    const clerk = (clerkCtx.value as unknown) as LoadedClerk;
    if (!clerk) {
      return null;
    }

    if (structureCtx.guaranteedLoaded) {
      return <Component {...(props as P)} clerk={clerk} />;
    }

    if (clerk.client) {
      return (
        <StructureContext.Provider
          value={StructureContextStates.guaranteedLoaded}
        >
          <Component {...(props as P)} clerk={clerk} />
        </StructureContext.Provider>
      );
    }

    return null;
  };
  HOC.displayName = `withClerk(${displayName})`;
  return HOC;
};

export const WithClerk: React.FC<{
  children: (clerk: LoadedClerk) => React.ReactNode;
}> = ({ children }) => (
  <StructureContext.Consumer>
    {structureCtx => (
      <IsomorphicClerkContext.Consumer>
        {clerkCtx => {
          if (typeof children !== 'function') {
            throw new Error(hocChildrenNotAFunctionError);
          }

          assertWrappedByClerkProvider(structureCtx);
          assertWrappedByClerkProvider(clerkCtx);

          const clerk = (clerkCtx.value as unknown) as LoadedClerk;
          if (!clerk) {
            return null;
          }

          if (structureCtx.guaranteedLoaded) {
            return children(clerk);
          }

          if (clerk.client) {
            return (
              <StructureContext.Provider
                value={StructureContextStates.guaranteedLoaded}
              >
                {children(clerk)}
              </StructureContext.Provider>
            );
          }

          return null;
        }}
      </IsomorphicClerkContext.Consumer>
    )}
  </StructureContext.Consumer>
);
