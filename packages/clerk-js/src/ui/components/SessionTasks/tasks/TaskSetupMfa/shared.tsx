import { useClerk, useSession, useUser } from '@clerk/shared/react';
import type { UserResource } from '@clerk/shared/types';
import React from 'react';

import { useSignOutContext } from '@/ui/contexts';
import { localizationKeys } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { useMultipleSessions } from '@/ui/hooks/useMultipleSessions';
import { stringToFormattedPhoneString } from '@/ui/utils/phoneUtils';

export const commonIdentifier = (user: UserResource) => {
  const formattedPhoneNumber = user.primaryPhoneNumber?.phoneNumber
    ? stringToFormattedPhoneString(user.primaryPhoneNumber?.phoneNumber)
    : null;
  return user.primaryEmailAddress?.emailAddress ?? user.username ?? formattedPhoneNumber;
};

export function SharedFooterActionForSignOut() {
  const { user } = useUser();
  const clerk = useClerk();
  const { session } = useSession();
  const { otherSessions } = useMultipleSessions({ user });
  const { navigateAfterSignOut, navigateAfterMultiSessionSingleSignOutUrl } = useSignOutContext();

  const handleSignOut = () => {
    if (otherSessions.length === 0) {
      return clerk.signOut(navigateAfterSignOut);
    }
    return clerk.signOut(navigateAfterMultiSessionSingleSignOutUrl, { sessionId: session?.id });
  };

  const identifier = React.useMemo(() => (user ? commonIdentifier(user) : null), [user]);

  return (
    <Card.Action
      elementId='signOut'
      gap={4}
      justify='center'
      sx={() => ({ width: '100%' })}
    >
      {identifier && (
        <Card.ActionText
          truncate
          localizationKey={localizationKeys('taskSetupMfa.signOut.actionText', {
            identifier,
          })}
        />
      )}
      <Card.ActionLink
        sx={() => ({ flexShrink: 0 })}
        onClick={() => void handleSignOut()}
        localizationKey={localizationKeys('taskSetupMfa.signOut.actionLink')}
      />
    </Card.Action>
  );
}
