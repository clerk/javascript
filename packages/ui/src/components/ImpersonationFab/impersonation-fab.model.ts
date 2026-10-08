import { getFullName, getIdentifier } from '@clerk/shared/internal/clerk-js/user';
import { useClerk, useSession, useUser } from '@clerk/shared/react';

import { useSignOutContext } from '../../contexts';
import { useMultipleSessions } from '../../hooks/useMultipleSessions';

export type ImpersonationFabModel =
  | { status: 'hidden' }
  | {
      status: 'ready';
      identifier: string;
      onSignOut: () => void;
    };

export function useImpersonationFabModel(): ImpersonationFabModel {
  const { session } = useSession();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { otherSessions } = useMultipleSessions({ user });
  const { navigateAfterSignOut, navigateAfterMultiSessionSingleSignOutUrl } = useSignOutContext();

  if (!session?.actor || session.agent || !session.user) {
    return { status: 'hidden' };
  }

  return {
    status: 'ready',
    identifier: getFullName(session.user) || getIdentifier(session.user),
    onSignOut: () => {
      if (otherSessions.length === 0) {
        void signOut(navigateAfterSignOut);
        return;
      }
      void signOut(navigateAfterMultiSessionSingleSignOutUrl, { sessionId: session.id });
    },
  };
}
