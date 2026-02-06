import { __internal_useSessionBase } from '@clerk/shared/react';
import React from 'react';

export function withCoreSessionSwitchGuard<P>(Component: React.ComponentType<P>): React.ComponentType<P> {
  const Hoc = (props: P) => {
    const session = __internal_useSessionBase();

    /**
     * Avoid simply checking if session is falsy, checking against undefined is preferable as it means that clerk has not loaded yet
     */
    if (typeof session === 'undefined') {
      return null;
    }

    return <Component {...(props as any)} />;
  };

  const displayName = Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;
  Hoc.displayName = displayName;
  return Hoc;
}
