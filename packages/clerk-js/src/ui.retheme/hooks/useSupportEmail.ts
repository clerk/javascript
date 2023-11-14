import React from 'react';

import { buildEmailAddress } from '../../utils';
import { useCoreClerk, useEnvironment, useOptions } from '../contexts';

export function useSupportEmail(): string {
  const Clerk = useCoreClerk();
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
