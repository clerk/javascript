import { useClerk } from '@clerk/shared/react';
import type {
  SignedInSessionResource,
  UserButtonProps,
  UserProfileModalProps,
  UserResource,
} from '@clerk/shared/types';

import { navigateIfTaskExists } from '@/core/sessionTasks';
import { useEnvironment } from '@/ui/contexts';
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
  taskUrl?: string | null;
} & Pick<UserButtonProps, 'userProfileMode' | 'appearance' | 'userProfileProps' | 'portal'>;

export const useMultisessionActions = (opts: UseMultisessionActionsParams) => {
  const { setActive, signOut, openUserProfile } = useClerk();
  const card = useCardState();
  const { signedInSessions, otherSessions } = useMultipleSessions({ user: opts.user });
  const { navigate } = useRouter();
  const { displayConfig } = useEnvironment();

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
    openUserProfile({
      ...opts.userProfileProps,
      portal: opts.portal,
    } as UserProfileModalProps);
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
      portal: opts.portal,
    } as UserProfileModalProps);

    return opts.actionCompleteCallback?.();
  };

  const handleSignOutAllClicked = () => {
    return signOut(opts.navigateAfterSignOut);
  };

  const handleSessionClicked = (session: SignedInSessionResource) => async () => {
    card.setLoading();

    return setActive({
      session,
      navigate: async ({ session }) => {
        if (!session.currentTask && opts.afterSwitchSessionUrl) {
          await navigate(opts.afterSwitchSessionUrl);
          return;
        }

        if (opts.taskUrl) {
          await navigate(opts.taskUrl);
          return;
        }

        await navigateIfTaskExists(session, {
          baseUrl: opts.signInUrl ?? displayConfig.signInUrl,
          navigate,
        });
      },
    }).finally(() => {
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
