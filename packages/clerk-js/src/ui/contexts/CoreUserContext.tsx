import { assertContextExists, UserContext, useUserContext } from '@clerk/shared';
import React, { useContext } from 'react';

import { clerkCoreErrorUserIsNotDefined } from '../../core/errors';

export const CoreUserContext = UserContext;

export const useCoreUser = () => {
  const user = useUserContext();
  if (!user) {
    clerkCoreErrorUserIsNotDefined();
  }
  return user;
};

export function withCoreUserGuard<P>(Component: React.ComponentType<P>): React.ComponentType<P> {
  const Hoc = (props: P) => {
    const ctx = useContext(CoreUserContext);
    assertContextExists(ctx, CoreUserContext);
    if (!ctx.value) {
      return null;
    }
    return <Component {...(props as any)} />;
  };

  const displayName = Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;
  Hoc.displayName = displayName;
  return Hoc;
}
