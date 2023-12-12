import type { LoadedClerk, Without } from '@clerk/types';
import React from 'react';

import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';
import { LoadedGuarantee } from '../contexts/StructureContext';
import { errorThrower } from '../errors/errorThrower';
import { hocChildrenNotAFunctionError } from '../errors/messages';
import { useAssertWrappedByClerkProvider } from '../hooks/useAssertWrappedByClerkProvider';

export const withClerk = <P extends { clerk: LoadedClerk }>(
  Component: React.ComponentType<P>,
  displayName?: string,
) => {
  displayName = displayName || Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;
  const HOC = (props: Without<P, 'clerk'>) => {
    useAssertWrappedByClerkProvider(displayName || 'withClerk');

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
    errorThrower.throw(hocChildrenNotAFunctionError);
  }

  if (!clerk.loaded) {
    return null;
  }

  return <LoadedGuarantee>{children(clerk as unknown as LoadedClerk)}</LoadedGuarantee>;
};
