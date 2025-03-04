import { useClerk } from '@clerk/shared/react';
import React from 'react';

import { buildEmailAddress } from '../../utils';
import { useEnvironment, useOptions } from '../contexts';

export function useSupportEmail(): string {
  const Clerk = useClerk();
  const { supportEmail: supportEmailFromOptions } = useOptions();
  const { supportEmail: supportEmailFromEnvironment } = useEnvironment()?.displayConfig ?? {};

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
