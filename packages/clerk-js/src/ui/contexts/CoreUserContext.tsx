import { UserResource } from '@clerk/types';
import { clerkCoreErrorUserIsNotDefined } from 'core/errors';
import * as React from 'react';
import { assertContextExists } from 'ui/contexts/utils';

type CoreUserContextValue = { value: UserResource | undefined | null };
export const CoreUserContext = React.createContext<CoreUserContextValue | undefined>(undefined);
CoreUserContext.displayName = 'CoreUserContext';

export function useCoreUser(): UserResource {
  const context = React.useContext(CoreUserContext);
  assertContextExists(context, 'CoreUserContextProvider');
  if (!context.value) {
    clerkCoreErrorUserIsNotDefined();
  }
  return context.value;
}

export function withCoreUserGuard<P>(Component: React.ComponentType<P>): React.ComponentType<P> {
  const Hoc = (props: P) => {
    const context = React.useContext(CoreUserContext);
    assertContextExists(context, 'CoreUserContextProvider');
    const user = context.value;
    if (!user) {
      return null;
    }
    return <Component {...props} />;
  };

  const displayName = Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;
  Hoc.displayName = displayName;
  return Hoc;
}
