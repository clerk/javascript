import type { LoadedClerk, Without } from '@clerk/types';
import React from 'react';

import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';
import { errorThrower } from '../errors/errorThrower';
import { hocChildrenNotAFunctionError } from '../errors/messages';
import { useAssertWrappedByClerkProvider } from '../hooks/useAssertWrappedByClerkProvider';

export const withClerk = <P extends { clerk: LoadedClerk }>(
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
        clerk={clerk}
      />
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

  return <>{children(clerk as unknown as LoadedClerk)}</>;
};
