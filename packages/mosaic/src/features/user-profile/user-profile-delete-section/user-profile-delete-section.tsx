import { useClerk, useUser } from '@clerk/shared/react';

import { useDestructiveController } from '../../../blocks/destructive/destructive.controller';
import { useReverificationFlow } from '../../reverification';
import { UserProfileDeleteSectionView } from './user-profile-delete-section.view';

export type UserProfileDeleteSectionProps = {
  fallback?: React.ReactNode;
}

export function UserProfileDeleteSection(props: UserProfileDeleteSectionProps) {
  // -- Model --
  const clerk = useClerk();
  const { setActive, client } = clerk;
  const { isLoaded, user } = useUser();

  // Because this is wrapped in reverification, it's important that it doesn't catch
  // reverification hints or cancellation errors
  const deleteAccount = async () => {
    // Should never happen, just an extra guard
    if (!user?.delete || !user?.deleteSelfEnabled) {
      return undefined;
    }

    await user.delete();

    const hasOtherSessions = client.signedInSessions.filter(s => s.user?.id !== user?.id).length > 0;
    const redirectUrl = hasOtherSessions ?
      clerk.buildAfterMultiSessionSingleSignOutUrl() :
      clerk.buildAfterSignOutUrl();

    return await setActive({
      session: null,
      redirectUrl,
    });
  }

  // -- Controllers --
  const [deleteAccountWithReverification, reverificationState] = useReverificationFlow(deleteAccount);
  const destructiveController = useDestructiveController({
    onDelete: deleteAccountWithReverification,
    reverification: reverificationState,
  })

  // -- View --
  if (!isLoaded) {
    return props.fallback ?? null;
  }

  if (!user?.deleteSelfEnabled) {
    return null;
  }

  return <UserProfileDeleteSectionView {...destructiveController} />;
}
