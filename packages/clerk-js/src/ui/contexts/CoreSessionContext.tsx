import { assertContextExists, SessionContext, useSessionContext } from '@clerk/shared';
import type { SessionResource } from '@clerk/types';
import React from 'react';

import { clerkCoreErrorSessionIsNotDefined } from '../../core/errors';

export const CoreSessionContext = SessionContext;

export function useCoreSession(): SessionResource {
  const session = useSessionContext();
  if (!session) {
    clerkCoreErrorSessionIsNotDefined();
  }
  return session;
}

export function withCoreSessionSwitchGuard<P>(Component: React.ComponentType<P>): React.ComponentType<P> {
  const Hoc = (props: P) => {
    const ctx = React.useContext(CoreSessionContext);
    assertContextExists(ctx, CoreSessionContext);
    if (ctx.value === undefined) {
      return null;
    }
    return <Component {...(props as any)} />;
  };

  const displayName = Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;
  Hoc.displayName = displayName;
  return Hoc;
}
