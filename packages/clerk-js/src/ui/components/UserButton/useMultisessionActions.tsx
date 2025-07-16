import { useClerk } from '@clerk/shared/react';
import type { SignedInSessionResource, UserButtonProps, UserResource } from '@clerk/types';

import { useCardState } from '@/ui/elements/contexts';
import { sleep } from '@/ui/utils/sleep';

import { windowNavigate } from '../../../utils/windowNavigate';
import { useMultipleSessions } from '../../hooks/useMultipleSessions';
import { useRouter } from '../../router';

type UseMultisessionActionsParams = {
  user: UserResource | null | undefined;
  actionCompleteCallback?: () => void;
  navigateAfterSignOut?: () => any;
  navigateAfterMultiSessionSingleSignOut?: () => any;
  afterSwitchSessionUrl?: string;
  userProfileUrl?: string;
  signInUrl?: string;
} & Pick<UserButtonProps, 'userProfileMode' | 'appearance' | 'userProfileProps'>;

export const useMultisessionActions = (opts: UseMultisessionActionsParams) => {
  const { setActive, signOut, openUserProfile, __internal_navigateToTaskIfAvailable } = useClerk();
  const card = useCardState();
  const { signedInSessions, otherSessions } = useMultipleSessions({ user: opts.user });
  const { navigate } = useRouter();

  const handleSignOutSessionClicked = (session: SignedInSessionResource) => () => {
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

  const handleSessionClicked = (session: SignedInSessionResource) => async () => {
    card.setLoading();

    return setActive({ session, redirectUrl: opts.afterSwitchSessionUrl })
      .then(() => __internal_navigateToTaskIfAvailable())
      .finally(() => {
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
    signedInSessions,
  };
};
