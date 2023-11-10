import { useSessionContext } from '@clerk/shared/react';
import React from 'react';

export function withCoreSessionSwitchGuard<P>(Component: React.ComponentType<P>): React.ComponentType<P> {
  const Hoc = (props: P) => {
    const session = useSessionContext();

    if (!session) {
      return null;
    }

    return <Component {...(props as any)} />;
  };

  const displayName = Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;
  Hoc.displayName = displayName;
  return Hoc;
}
