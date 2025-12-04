import { buildEmailAddress } from '@clerk/shared/internal/clerk-js/email';
import { useClerk } from '@clerk/shared/react';
import React from 'react';

import { useEnvironment, useOptions } from '../contexts';

export function useSupportEmail(): string {
  const Clerk = useClerk();
  const { supportEmail: supportEmailFromOptions } = useOptions();
  const { displayConfig } = useEnvironment();
  const { supportEmail: supportEmailFromEnvironment } = displayConfig;

  const supportDomain = React.useMemo(
    () =>
      supportEmailFromOptions ||
      supportEmailFromEnvironment ||
      buildEmailAddress({
        localPart: 'support',
        frontendApi: Clerk.frontendApi,
      }),
    [Clerk.frontendApi, supportEmailFromOptions, supportEmailFromEnvironment],
  );

  return supportDomain;
}
