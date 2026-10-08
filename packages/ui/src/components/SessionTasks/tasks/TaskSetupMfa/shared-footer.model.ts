import { useClerk, useSession, useUser } from '@clerk/shared/react';
import type { UserResource } from '@clerk/shared/types';
import { useMemo } from 'react';

import { useSignOutContext } from '@/contexts';
import { useMultipleSessions } from '@/hooks/useMultipleSessions';
import { stringToFormattedPhoneString } from '@/utils/phoneUtils';

export const commonIdentifier = (user: UserResource) => {
  const formattedPhoneNumber = user.primaryPhoneNumber?.phoneNumber
    ? stringToFormattedPhoneString(user.primaryPhoneNumber?.phoneNumber)
    : null;
  return user.primaryEmailAddress?.emailAddress ?? user.username ?? formattedPhoneNumber;
};

export const useSharedFooterModel = () => {
  const { user } = useUser();
  const clerk = useClerk();
  const { session } = useSession();
  const { otherSessions } = useMultipleSessions({ user });
  const { navigateAfterSignOut, navigateAfterMultiSessionSingleSignOutUrl } = useSignOutContext();
  const identifier = useMemo(() => (user ? commonIdentifier(user) : null), [user]);

  return {
    identifier,
    signOut: () =>
      otherSessions.length === 0
        ? clerk.signOut(navigateAfterSignOut)
        : clerk.signOut(navigateAfterMultiSessionSingleSignOutUrl, { sessionId: session?.id }),
  };
};
