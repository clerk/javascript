import { useClerk, useUser } from '@clerk/shared/react';

import { useReverificationFlow } from '../../reverification';
import { type UserProfileActionContext, useUserProfileUserAccess } from '../user-profile-user.model';

export function useUserProfileDeleteActions(context?: UserProfileActionContext) {
  const clerk = useClerk();
  const model = useUserProfileUserAccess(context);
  const [deleteAccount, reverification] = useReverificationFlow(async () => {
    if (model.status !== 'ready') {
      throw new Error('User unavailable.');
    }
    const user = model.currentUser();
    if (!user.deleteSelfEnabled) {
      throw new Error('Account deletion unavailable.');
    }
    const sessionId = clerk.session?.id;
    const instanceKey = JSON.stringify([clerk.publishableKey, clerk.frontendApi, clerk.proxyUrl ?? '', clerk.domain]);
    await user.delete();
    if (
      (clerk.session && clerk.session.id !== sessionId) ||
      (clerk.user && clerk.user.id !== user.id) ||
      JSON.stringify([clerk.publishableKey, clerk.frontendApi, clerk.proxyUrl ?? '', clerk.domain]) !== instanceKey
    ) {
      return;
    }
    const hasOtherSessions = clerk.client.signedInSessions.some(session => session.user?.id !== user.id);
    await clerk.setActive({
      session: null,
      redirectUrl: hasOtherSessions ? clerk.buildAfterMultiSessionSingleSignOutUrl() : clerk.buildAfterSignOutUrl(),
    });
  });
  return { ready: model.status === 'ready' && model.user.deleteSelfEnabled, onDelete: deleteAccount, reverification };
}

export function useUserProfileDeleteDisplay() {
  const { isLoaded, user } = useUser();
  return { isLoaded, visible: Boolean(user?.deleteSelfEnabled) };
}
