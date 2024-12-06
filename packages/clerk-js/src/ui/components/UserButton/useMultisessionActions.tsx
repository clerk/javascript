import { useClerk } from '@clerk/shared/react';
import type { ActiveSessionResource, UserButtonProps, UserResource } from '@clerk/types';

import { windowNavigate } from '../../../utils/windowNavigate';
import { useCardState } from '../../elements';
import { useMultipleSessions } from '../../hooks/useMultipleSessions';
import { useRouter } from '../../router';
import { sleep } from '../../utils';

type UseMultisessionActionsParams = {
  user: UserResource | null | undefined;
  actionCompleteCallback?: () => void;
  navigateAfterSignOut?: () => any;
  navigateAfterMultiSessionSingleSignOut?: () => any;
  afterSwitchSession?: string;
  userProfileUrl?: string;
  signInUrl?: string;
} & Pick<UserButtonProps, 'userProfileMode' | 'appearance' | 'userProfileProps'>;

export const useMultisessionActions = (opts: UseMultisessionActionsParams) => {
  const { setActive, signOut, openUserProfile } = useClerk();
  const card = useCardState();
  const { activeSessions, otherSessions } = useMultipleSessions({ user: opts.user });
  const { navigate } = useRouter();

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
    openUserProfile(opts.userProfileProps);
    return opts.actionCompleteCallback?.();
  };

  const handleUserProfileActionClicked = (__experimental_startPath?: string) => {
    if (opts.userProfileMode === 'navigation') {
      return navigate(opts.userProfileUrl || '').finally(() => {
        void (async () => {
          await sleep(300);
          opts.actionCompleteCallback?.();
        })();
      });
    }
    openUserProfile({
      ...opts.userProfileProps,
      ...(__experimental_startPath && { __experimental_startPath }),
    });

    return opts.actionCompleteCallback?.();
  };

  const handleSignOutAllClicked = () => {
    return signOut(opts.navigateAfterSignOut);
  };

  const handleSessionClicked = (session: ActiveSessionResource) => async () => {
    card.setLoading();
    return setActive({ session, redirectUrl: opts.afterSwitchSession }).finally(() => {
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
    handleUserProfileActionClicked,
    handleSignOutAllClicked,
    handleSessionClicked,
    handleAddAccountClicked,
    otherSessions,
    activeSessions,
  };
};
