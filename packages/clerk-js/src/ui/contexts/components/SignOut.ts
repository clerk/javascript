import { useClerk } from '@clerk/shared/react';

export type SignOutContextType = {
  afterSignOutUrl: string;
  afterMultiSessionSingleSignOutUrl: string;
};

export const useSignOutContext = (): SignOutContextType => {
  const clerk = useClerk();

  return {
    afterSignOutUrl: clerk.buildAfterSignOutUrl(),
    afterMultiSessionSingleSignOutUrl: clerk.buildAfterMultiSessionSingleSignOutUrl(),
  };
};
