import { useClerk, useReverification, useSafeLayoutEffect, useSession, useUser } from '@clerk/shared/react';
import { useRef } from 'react';

import { useEnvironment, useSignOutContext } from '@/ui/contexts';
import { useSessionTasksContext, useTaskResetPasswordContext } from '@/ui/contexts/components/SessionTasks';

export const useTaskResetPasswordModel = () => {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const actor = user?.id;
  const sessionId = session?.id;
  const clientId = clerk.client?.id;
  const {
    userSettings: { passwordSettings },
  } = useEnvironment();
  const { redirectUrlComplete } = useTaskResetPasswordContext();
  const signOutContext = useSignOutContext();
  const { navigateOnSetActive } = useSessionTasksContext();
  const target = JSON.stringify([
    redirectUrlComplete,
    signOutContext.afterSignOutUrl,
    signOutContext.afterMultiSessionSingleSignOutUrl,
  ]);
  const identity = JSON.stringify([actor, sessionId, clientId, target]);
  const latest = useRef({ navigateOnSetActive, signOutContext });
  latest.current = { navigateOnSetActive, signOutContext };
  const mounted = useRef(true);
  const activating = useRef<{ closedForTransition: boolean; navigated: boolean }>();
  const current = useRef({ identity, version: 0, clientId, target, clerk });
  const inOwnedTransition =
    !!activating.current &&
    clerk.__internal_setActiveInProgress &&
    clerk.user === undefined &&
    clerk.session === undefined &&
    current.current.clientId === clientId &&
    current.current.target === target &&
    current.current.clerk === clerk;
  const scopeIdentity = inOwnedTransition ? current.current.identity : identity;
  if (current.current.identity !== scopeIdentity || current.current.clerk !== clerk) {
    current.current = { identity: scopeIdentity, version: current.current.version + 1, clientId, target, clerk };
    activating.current = undefined;
  }
  const owner = current.current;
  const ownsAccount = () =>
    current.current === owner &&
    !!actor &&
    !!sessionId &&
    clerk.user?.id === actor &&
    clerk.session?.id === sessionId &&
    clerk.client?.id === clientId;
  const canRun = () => mounted.current && ownsAccount();
  useSafeLayoutEffect(() => {
    mounted.current = true;
    return () => {
      if (activating.current) {
        activating.current.closedForTransition =
          clerk.__internal_setActiveInProgress && clerk.user === undefined && clerk.session === undefined;
      }
      mounted.current = false;
    };
  }, [clerk]);
  const updatePasswordWithReverification = useReverification(
    async (newPassword: string, signOutOfOtherSessions: boolean | undefined, isCurrent: () => boolean) => {
      const currentUser = clerk.user;
      if (!currentUser || !isCurrent()) {
        return false;
      }
      await currentUser.updatePassword({ newPassword, signOutOfOtherSessions });
      return isCurrent();
    },
  );

  return {
    scopeKey: JSON.stringify([scopeIdentity, owner.version]),
    canRun,
    passwordSettings,
    identifier: user?.primaryEmailAddress?.emailAddress ?? user?.username,
    hiddenIdentifier: user?.primaryEmailAddress?.emailAddress || user?.username || '',
    signOut: async (canContinue = () => true) => {
      if (!canRun() || !canContinue()) {
        return;
      }
      const otherAccounts = clerk.client?.signedInSessions.some(item => item.user?.id !== actor);
      let navigated = false;
      let active = true;
      try {
        await clerk.signOut(
          () => {
            if (
              active &&
              !navigated &&
              current.current === owner &&
              (!clerk.client?.id || clerk.client.id === clientId) &&
              ((mounted.current && canContinue()) || (!clerk.user && !clerk.session)) &&
              (!clerk.user || clerk.user.id === actor) &&
              (!clerk.session || clerk.session.id === sessionId)
            ) {
              navigated = true;
              const context = latest.current.signOutContext;
              return otherAccounts
                ? context.navigateAfterMultiSessionSingleSignOutUrl()
                : context.navigateAfterSignOut();
            }
          },
          otherAccounts ? { sessionId } : undefined,
        );
      } finally {
        active = false;
      }
    },
    updatePassword: async (
      newPassword: string,
      signOutOfOtherSessions: boolean | undefined,
      canContinue = () => true,
    ) => {
      const isCurrent = () => canRun() && canContinue();
      if (!isCurrent()) {
        return;
      }
      const activation = { closedForTransition: false, navigated: false };
      try {
        const updated = await updatePasswordWithReverification(newPassword, signOutOfOtherSessions, isCurrent);
        if (!updated || !isCurrent()) {
          return;
        }
        activating.current = activation;
        await clerk.setActive({
          session: sessionId,
          navigate: async ({ session, decorateUrl }) => {
            const inTransition =
              clerk.__internal_setActiveInProgress && clerk.user === undefined && clerk.session === undefined;
            if (
              activating.current === activation &&
              !activation.navigated &&
              current.current === owner &&
              ((mounted.current && canContinue()) || activation.closedForTransition) &&
              clerk.client?.id === clientId &&
              session.id === sessionId &&
              session.user?.id === actor &&
              (ownsAccount() || inTransition)
            ) {
              activation.navigated = true;
              await latest.current.navigateOnSetActive({ session, redirectUrlComplete, decorateUrl });
            }
          },
        });
      } catch (error) {
        if (isCurrent()) {
          throw error;
        }
      } finally {
        if (activating.current === activation) {
          activating.current = undefined;
        }
      }
    },
  };
};
