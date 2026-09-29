import { useClerk, useUser } from '@clerk/shared/react';

import { useDestructiveController } from '../../../blocks/destructive/destructive.controller';
import { useReverify } from '../../reverification';
import { UserProfileDeleteSectionView } from './user-profile-delete-section.view';

export type UserProfileDeleteSectionProps = {
  fallback?: React.ReactNode;
};

export function UserProfileDeleteSection(props: UserProfileDeleteSectionProps) {
  // -- Model --
  const clerk = useClerk();
  const { setActive, client } = clerk;
  const { isLoaded, user } = useUser();
  const { reverify, prompt } = useReverify();

  // -- Controllers --
  const destructiveController = useDestructiveController(async ctx => {
    // Should never happen, just an extra guard
    if (!user?.delete || !user?.deleteSelfEnabled) {
      return;
    }

    await reverify(ctx, () => user.delete());

    const hasOtherSessions = client.signedInSessions.filter(s => s.user?.id !== user?.id).length > 0;
    const redirectUrl = hasOtherSessions
      ? clerk.buildAfterMultiSessionSingleSignOutUrl()
      : clerk.buildAfterSignOutUrl();

    await setActive({
      session: null,
      redirectUrl,
    });
  }, prompt);

  // -- View --
  if (!isLoaded) {
    return props.fallback ?? null;
  }

  if (!user?.deleteSelfEnabled) {
    return null;
  }

  return <UserProfileDeleteSectionView {...destructiveController} />;
}
