import React from 'react';

import { buildEmailAddress } from '../../utils';
import { useCoreClerk, useOptions } from '../contexts';

export function useSupportEmail(): string {
  const Clerk = useCoreClerk();
  const { supportEmail } = useOptions();

  const supportDomain = React.useMemo(
    () =>
      supportEmail ||
      buildEmailAddress({
        localPart: 'support',
        frontendApi: Clerk.frontendApi,
      }),
    [Clerk.frontendApi, supportEmail],
  );

  return supportDomain;
}
