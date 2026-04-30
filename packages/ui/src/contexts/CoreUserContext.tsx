import { __internal_useUserBase } from '@clerk/shared/react';
import React from 'react';

export function withCoreUserGuard<P>(Component: React.ComponentType<P>): React.ComponentType<P> {
  const Hoc = (props: P) => {
    const user = __internal_useUserBase();

    // DIAG: instrument userButton mount regression
    // eslint-disable-next-line no-console
    console.log('[CLERK_DIAG] withCoreUserGuard render', {
      component: Component.displayName || Component.name,
      hasUser: !!user,
      userId: user?.id,
    });

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
