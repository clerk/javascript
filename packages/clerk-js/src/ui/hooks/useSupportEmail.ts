import React from 'react';
import { useCoreClerk } from 'ui/contexts';
import { buildEmailAddress } from 'utils';

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
