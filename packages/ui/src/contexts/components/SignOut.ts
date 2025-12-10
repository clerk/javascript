import { useClerk } from '@clerk/shared/react';

import { useRouter } from '../../router';

export type SignOutContextType = {
  navigateAfterSignOut: () => any;
  navigateAfterMultiSessionSingleSignOutUrl: () => any;
  afterSignOutUrl: string;
  afterMultiSessionSingleSignOutUrl: string;
};

export const useSignOutContext = (): SignOutContextType => {
  const { navigate } = useRouter();
  const clerk = useClerk();
  const navigateAfterSignOut = () => navigate(clerk.buildAfterSignOutUrl());
  const navigateAfterMultiSessionSingleSignOutUrl = () => navigate(clerk.buildAfterMultiSessionSingleSignOutUrl());
  return {
    navigateAfterSignOut,
    navigateAfterMultiSessionSingleSignOutUrl,
    afterSignOutUrl: clerk.buildAfterSignOutUrl(),
    afterMultiSessionSingleSignOutUrl: clerk.buildAfterMultiSessionSingleSignOutUrl(),
  };
};
