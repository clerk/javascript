import { navigateIfTaskExists } from '@clerk/shared/internal/clerk-js/sessionTasks';
import { useClerk, usePortalRoot, useSession, useUser } from '@clerk/shared/react';
import type { UserButtonProps } from '@clerk/shared/types';
import { useRef } from 'react';

import { useEnvironment } from '@/ui/contexts';
import { clerkWindowNavigate } from '@/ui/utils/windowNavigate';

import { useRouter } from '../../router';
import type { MultisessionModel } from './multisession.types';
import { toUserButtonPreview } from './user-button.preview';

export type UseMultisessionActionsParams = {
  userId: string | undefined;
  navigateAfterSignOut?: () => void | Promise<unknown>;
  navigateAfterMultiSessionSingleSignOut?: () => void | Promise<unknown>;
  afterSwitchSessionUrl?: string;
  userProfileUrl?: string;
  signInUrl?: string;
  taskUrl?: string | null;
} & Pick<UserButtonProps, 'userProfileMode' | 'appearance' | 'userProfileProps'>;

export const useMultisessionModel = (opts: UseMultisessionActionsParams): MultisessionModel => {
  const clerk = useClerk();
  const { user } = useUser();
  const { session: activeSession } = useSession();
  const { navigate } = useRouter();
  const { displayConfig } = useEnvironment();
  const getContainer = usePortalRoot();
  const actor = user?.id;
  const activeSessionId = activeSession?.id;
  const clientId = clerk.client.id;
  const scopeKey = JSON.stringify([actor, activeSessionId, clientId, opts.userId]);
  const current = useRef({ scopeKey, version: 0 });
  const scopeVersion = current.current.version + (current.current.scopeKey === scopeKey ? 0 : 1);
  current.current = { scopeKey, version: scopeVersion };
  const canRun = () =>
    current.current.version === scopeVersion &&
    current.current.scopeKey === scopeKey &&
    clerk.user?.id === actor &&
    clerk.session?.id === activeSessionId &&
    clerk.client.id === clientId;
  const signedInSessions = clerk.client.signedInSessions;
  const otherSessions = signedInSessions.filter(session => session.user?.id !== opts.userId);
  const findSession = (sessionId: string) =>
    canRun() ? clerk.client.signedInSessions.find(session => session.id === sessionId) : undefined;

  return {
    scopeKey,
    canRun,
    signedInSessions: signedInSessions.map(session => ({ id: session.id, preview: toUserButtonPreview(session.user) })),
    otherSessions: otherSessions.map(session => ({ id: session.id, preview: toUserButtonPreview(session.user) })),
    signOutSession: async sessionId => {
      if (!findSession(sessionId)) {
        return false;
      }
      const others = clerk.client.signedInSessions.filter(session => session.user?.id !== opts.userId);
      if (others.length === 0) {
        await clerk.signOut(opts.navigateAfterSignOut);
      } else {
        await clerk.signOut(opts.navigateAfterMultiSessionSingleSignOut, { sessionId });
      }
      return true;
    },
    navigateToUserProfile: async () => {
      if (!canRun()) {
        return false;
      }
      await navigate(opts.userProfileUrl || '');
      return true;
    },
    openUserProfile: startPath => {
      if (!canRun()) {
        return false;
      }
      clerk.openUserProfile({
        getContainer,
        ...opts.userProfileProps,
        ...(startPath && { __experimental_startPath: startPath }),
      });
      return true;
    },
    signOutAll: async () => {
      if (!canRun()) {
        return false;
      }
      await clerk.signOut(opts.navigateAfterSignOut);
      return true;
    },
    switchSession: async sessionId => {
      const selected = findSession(sessionId);
      if (!selected) {
        return false;
      }
      await clerk.setActive({
        session: selected,
        navigate: async ({ session }) => {
          if (
            session.id !== sessionId ||
            clerk.client.id !== clientId ||
            (clerk.session?.id !== sessionId && !canRun())
          ) {
            return;
          }
          if (!session.currentTask && opts.afterSwitchSessionUrl) {
            await navigate(opts.afterSwitchSessionUrl);
            return;
          }
          if (opts.taskUrl) {
            await navigate(opts.taskUrl);
            return;
          }
          await navigateIfTaskExists(session, { baseUrl: opts.signInUrl ?? displayConfig.signInUrl, navigate });
        },
      });
      return true;
    },
    addAccount: () => {
      if (!canRun()) {
        return false;
      }
      clerkWindowNavigate(clerk, opts.signInUrl || window.location.href);
      return true;
    },
  };
};
