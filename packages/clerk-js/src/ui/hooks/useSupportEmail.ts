import React from 'react';

import { buildEmailAddress } from '../../utils';
import { useCoreClerk } from '../contexts';

export function useSupportEmail(): string {
  const Clerk = useCoreClerk();

  const supportDomain = React.useMemo(
    () =>
      buildEmailAddress({
        localPart: 'support',
        frontendApi: Clerk.frontendApi,
      }),
    [Clerk.frontendApi],
  );

  return supportDomain;
}
