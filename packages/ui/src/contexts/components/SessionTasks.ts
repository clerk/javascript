import { getTaskEndpoint } from '@clerk/shared/internal/clerk-js/sessionTasks';
import type { DecorateUrl, SessionResource } from '@clerk/shared/types';
import { createContext, useContext } from 'react';

import { useRouter } from '@/ui/router';

import type { SessionTasksCtx, TaskChooseOrganizationCtx, TaskResetPasswordCtx } from '../../types';

export const SessionTasksContext = createContext<SessionTasksCtx | null>(null);

type SessionTasksContextType = SessionTasksCtx & {
  navigateOnSetActive: (opts: {
    session: SessionResource;
    redirectUrlComplete: string;
    decorateUrl: DecorateUrl;
  }) => Promise<unknown>;
};

export const useSessionTasksContext = (): SessionTasksContextType => {
  const context = useContext(SessionTasksContext);
  const { navigate, basePath, startPath } = useRouter();

  if (context === null) {
    throw new Error('Clerk: useSessionTasksContext called outside of the mounted SessionTasks component.');
  }

  const navigateOnSetActive = async ({
    session,
    redirectUrlComplete,
    decorateUrl,
  }: {
    session: SessionResource;
    redirectUrlComplete: string;
    decorateUrl: DecorateUrl;
  }) => {
    const currentTask = session.currentTask;
    if (!currentTask) {
      // Use decorateUrl to enable Safari ITP cookie refresh when needed
      const decoratedUrl = decorateUrl(redirectUrlComplete);

      // If decorateUrl returns an external URL (Safari ITP fix), do a full page navigation
      if (decoratedUrl.startsWith('https://')) {
        window.location.href = decoratedUrl;
        return;
      }

      return navigate(redirectUrlComplete);
    }

    const taskEndpoint = getTaskEndpoint(currentTask);

    // Base path is required for virtual routing with start path
    // eg: to navigate from /sign-in/factor-one to /sign-in/tasks/choose-organization
    return navigate(`/${basePath + startPath + taskEndpoint}`);
  };

  return { ...context, navigateOnSetActive };
};

export const TaskChooseOrganizationContext = createContext<TaskChooseOrganizationCtx | null>(null);

export const useTaskChooseOrganizationContext = (): TaskChooseOrganizationCtx => {
  const context = useContext(TaskChooseOrganizationContext);

  if (context === null) {
    throw new Error(
      'Clerk: useTaskChooseOrganizationContext called outside of the mounted TaskChooseOrganization component.',
    );
  }

  return context;
};

export const TaskResetPasswordContext = createContext<TaskResetPasswordCtx | null>(null);

export const useTaskResetPasswordContext = (): TaskResetPasswordCtx => {
  const context = useContext(TaskResetPasswordContext);

  if (context === null) {
    throw new Error('Clerk: useTaskResetPasswordContext called outside of the mounted TaskResetPassword component.');
  }

  return context;
};
