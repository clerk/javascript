import { ActiveSessionResource, UserButtonProps } from '@clerk/types';
import React from 'react';

import { useCoreClerk, useCoreSessionList, useCoreUser } from '../../ui/contexts';
import { useNavigate } from '../../ui/hooks';
import { windowNavigate } from '../../utils/windowNavigate';
import { useCardState } from '../elements';
import { sleep } from '../utils';

type UseMultisessionActionsParams = {
  actionCompleteCallback?: () => void;
  navigateAfterSignOut?: () => any;
  navigateAfterMultiSessionSingleSignOut?: () => any;
  navigateAfterSwitchSession?: () => any;
  userProfileUrl?: string;
  signInUrl?: string;
} & Pick<UserButtonProps, 'userProfileMode' | 'appearance'>;

export const useMultisessionActions = (opts: UseMultisessionActionsParams) => {
  const { setActive, signOut, openUserProfile } = useCoreClerk();
  const card = useCardState();
  const sessions = useCoreSessionList();
  const { navigate } = useNavigate();
  const user = useCoreUser();
  const activeSessions = sessions.filter(s => s.status === 'active') as ActiveSessionResource[];
  const otherSessions = activeSessions.filter(s => s.user?.id !== user.id);

  const handleSignOutSessionClicked = (session: ActiveSessionResource) => () => {
    if (otherSessions.length === 0) {
      return signOut(opts.navigateAfterSignOut);
    }
    return signOut(opts.navigateAfterMultiSessionSingleSignOut, { sessionId: session.id }).finally(() =>
      card.setIdle(),
    );
  };

  const handleManageAccountClicked: React.MouseEventHandler<HTMLButtonElement> = () => {
    if (opts.userProfileMode === 'navigation') {
      return navigate(opts.userProfileUrl).finally(async () => {
        await sleep(1000);
        opts.actionCompleteCallback?.();
      });
    }

    // The UserButton can also accept an appearance object for the nested UserProfile modal
    openUserProfile({ appearance: opts.appearance?.userProfile });
    return opts.actionCompleteCallback?.();
  };

  const handleSignOutAllClicked = () => {
    return signOut(opts.navigateAfterSignOut);
  };

  const handleSessionClicked = (session: ActiveSessionResource) => async () => {
    card.setLoading();
    return setActive({ session, beforeEmit: opts.navigateAfterSwitchSession }).finally(() => {
      card.setIdle();
      opts.actionCompleteCallback?.();
    });
  };

  const handleAddAccountClicked = () => {
    windowNavigate(opts.signInUrl || window.location.href);
    return sleep(2000);
  };

  return {
    handleSignOutSessionClicked,
    handleManageAccountClicked,
    handleSignOutAllClicked,
    handleSessionClicked,
    handleAddAccountClicked,
    otherSessions,
    activeSessions,
  };
};
