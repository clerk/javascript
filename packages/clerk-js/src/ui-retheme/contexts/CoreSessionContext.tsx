import { assertContextExists, SessionContext } from '@clerk/shared/react';
import React from 'react';

export function withCoreSessionSwitchGuard<P>(Component: React.ComponentType<P>): React.ComponentType<P> {
  const Hoc = (props: P) => {
    const ctx = React.useContext(SessionContext);
    assertContextExists(ctx, SessionContext);
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
