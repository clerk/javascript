import React from 'react';

import { useEnvironment } from '../contexts';
import { useRouter } from '../router';

export function withOrganizationsEnabledGuard<P>(
  WrappedComponent: React.ComponentType<P>,
  name: string,
  options: { mode: 'redirect' | 'hide' },
): React.ComponentType<P> {
  const Hoc = (props: P) => {
    const { navigate } = useRouter();
    const { organizationSettings, displayConfig } = useEnvironment();

    React.useEffect(() => {
      if (options.mode === 'redirect' && !organizationSettings.enabled) {
        void navigate(displayConfig.homeUrl);
      }
    }, []);

    if (options.mode === 'hide' && !organizationSettings.enabled) {
      return null;
    }

    return <WrappedComponent {...(props as any)} />;
  };
  Hoc.displayName = name;
  return Hoc;
}
