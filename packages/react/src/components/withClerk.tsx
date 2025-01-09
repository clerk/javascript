import type { LoadedClerk, Without } from '@clerk/types';
import React from 'react';

import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';
import { useAssertWrappedByClerkProvider } from '../hooks/useAssertWrappedByClerkProvider';

export const withClerk = <P extends { clerk: LoadedClerk; component?: string }>(
  Component: React.ComponentType<P>,
  displayNameOrOptions?: string | { component: string; renderWhileLoading?: boolean },
) => {
  const passedDisplayedName =
    typeof displayNameOrOptions === 'string' ? displayNameOrOptions : displayNameOrOptions?.component;
  const displayName = passedDisplayedName || Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;

  const options = typeof displayNameOrOptions === 'string' ? undefined : displayNameOrOptions;

  const HOC = (props: Without<P, 'clerk'>) => {
    useAssertWrappedByClerkProvider(displayName || 'withClerk');

    const clerk = useIsomorphicClerkContext();

    if (!clerk.loaded && !options?.renderWhileLoading) {
      return null;
    }

    return (
      <Component
        {...(props as P)}
        component={displayName}
        clerk={clerk}
      />
    );
  };
  HOC.displayName = `withClerk(${displayName})`;
  return HOC;
};
