import { useClerk } from '@clerk/shared/react';
import React from 'react';

import { useEnvironment } from './use-environment';
import { useOptions } from './use-options';

export function useSupportEmail() {
  const Clerk = useClerk();
  const { supportEmail: supportEmailFromOptions } = useOptions();
  const { displayConfig } = useEnvironment();
  const { supportEmail: supportEmailFromEnvironment } = displayConfig;

  const supportEmail = React.useMemo(
    () =>
      supportEmailFromOptions ||
      supportEmailFromEnvironment ||
      ['support', '@', Clerk.frontendApi ? Clerk.frontendApi.replace('clerk.', '') : 'clerk.com'].join(''),
    [Clerk.frontendApi, supportEmailFromOptions, supportEmailFromEnvironment],
  );

  return supportEmail;
}
