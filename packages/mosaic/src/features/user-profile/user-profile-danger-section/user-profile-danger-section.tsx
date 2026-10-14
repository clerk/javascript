import { useClerk, useUser } from '@clerk/shared/react';

import { useConfirmController } from '../../../blocks/confirm';
import { useReverificationFlow } from '../../reverification';
import { UserProfileDangerSectionView } from './user-profile-danger-section.view';

export type UserProfileDangerSectionProps = {
  fallback?: React.ReactNode;
};

export function UserProfileDangerSection(props: UserProfileDangerSectionProps) {
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
    const redirectUrl = hasOtherSessions
      ? clerk.buildAfterMultiSessionSingleSignOutUrl()
      : clerk.buildAfterSignOutUrl();

    return await setActive({
      session: null,
      redirectUrl,
    });
  };

  // -- Controllers --
  const [deleteAccountWithReverification, reverification] = useReverificationFlow(deleteAccount);
  const controller = useConfirmController({ onConfirm: deleteAccountWithReverification, reverification });

  // -- View --
  if (!isLoaded) {
    return props.fallback ?? null;
  }

  if (!user?.deleteSelfEnabled) {
    return null;
  }

  return <UserProfileDangerSectionView controller={controller} />;
}
