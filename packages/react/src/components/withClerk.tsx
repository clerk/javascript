import { LoadedClerk } from '@clerk/types';
import React from 'react';

import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';
import { LoadedGuarantee } from '../contexts/StructureContext';
import { hocChildrenNotAFunctionError } from '../errors';

export const withClerk = <P extends { clerk: LoadedClerk }>(
  Component: React.ComponentType<P>,
  displayName?: string,
) => {
  displayName = displayName || Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;
  const HOC = (props: Omit<P, 'clerk'>) => {
    const clerk = useIsomorphicClerkContext();

    if (!clerk.loaded) {
      return null;
    }

    return (
      <LoadedGuarantee>
        <Component
          {...(props as P)}
          clerk={clerk}
        />
      </LoadedGuarantee>
    );
  };
  HOC.displayName = `withClerk(${displayName})`;
  return HOC;
};

export const WithClerk: React.FC<{
  children: (clerk: LoadedClerk) => React.ReactNode;
}> = ({ children }) => {
  const clerk = useIsomorphicClerkContext();

  if (typeof children !== 'function') {
    throw new Error(hocChildrenNotAFunctionError);
  }

  if (!clerk.loaded) {
    return null;
  }

  return <LoadedGuarantee>{children(clerk as unknown as LoadedClerk)}</LoadedGuarantee>;
};
