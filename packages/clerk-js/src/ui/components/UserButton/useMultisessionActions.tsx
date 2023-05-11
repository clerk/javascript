import type { ActiveSessionResource, UserButtonProps, UserResource } from '@clerk/types';

import { windowNavigate } from '../../../utils/windowNavigate';
import { useCoreClerk, useCoreSessionList } from '../../contexts';
import { useCardState } from '../../elements';
import { useRouter } from '../../router';
import { sleep } from '../../utils';

type UseMultisessionActionsParams = {
  user: UserResource | undefined;
  actionCompleteCallback?: () => void;
  navigateAfterSignOut?: () => any;
  navigateAfterMultiSessionSingleSignOut?: () => any;
  navigateAfterSwitchSession?: () => any;
  userProfileUrl?: string;
  signInUrl?: string;
} & Pick<UserButtonProps, 'userProfileMode' | 'appearance' | 'userProfileProps'>;

export const useMultisessionActions = (opts: UseMultisessionActionsParams) => {
  const { setActive, signOut, openUserProfile } = useCoreClerk();
  const card = useCardState();
  const sessions = useCoreSessionList();
  const { navigate } = useRouter();
  const activeSessions = sessions.filter(s => s.status === 'active') as ActiveSessionResource[];
  const otherSessions = activeSessions.filter(s => s.user?.id !== opts.user?.id);

  const handleSignOutSessionClicked = (session: ActiveSessionResource) => () => {
    if (otherSessions.length === 0) {
      return signOut(opts.navigateAfterSignOut);
    }
    return signOut(opts.navigateAfterMultiSessionSingleSignOut, { sessionId: session.id }).finally(() =>
      card.setIdle(),
    );
  };

  const handleManageAccountClicked = () => {
    if (opts.userProfileMode === 'navigation') {
      return navigate(opts.userProfileUrl || '').finally(() => {
        void (async () => {
          await sleep(300);
          opts.actionCompleteCallback?.();
        })();
      });
    }

    // The UserButton can also accept an appearance object for the nested UserProfile modal
    openUserProfile({ ...opts.userProfileProps, appearance: opts.appearance?.userProfile });
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
