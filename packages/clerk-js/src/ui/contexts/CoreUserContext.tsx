import { useUserContext } from '@clerk/shared/react';
import React from 'react';

export function withCoreUserGuard<P>(Component: React.ComponentType<P>): React.ComponentType<P> {
  const Hoc = (props: P) => {
    const user = useUserContext();

    if (!user) {
      return null;
    }

    return <Component {...(props as any)} />;
  };

  const displayName = Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;
  Hoc.displayName = displayName;
  return Hoc;
}
