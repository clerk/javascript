import { useClerkInstanceContext } from '@clerk/shared/react';
import React from 'react';

import { useEnvironment } from './EnvironmentContext';

export function withOrganizationsEnabledGuard<P>(Component: React.ComponentType<P>): React.ComponentType<P> {
  const Hoc = (props: P) => {
    const clerk = useClerkInstanceContext();
    const environment = useEnvironment();

    if (!clerk.loaded) {
      return null;
    }

    const organizationsEnabled = environment?.organizationSettings?.enabled ?? false;

    if (!organizationsEnabled) {
      // TODO - Mount modal
      return null;
    }

    return <Component {...(props as any)} />;
  };

  const displayName = Component.displayName || Component.name || 'Component';
  Hoc.displayName = `withOrganizationsEnabledGuard(${displayName})`;
  return Hoc;
}
