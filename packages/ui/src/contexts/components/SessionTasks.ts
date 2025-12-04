import { getTaskEndpoint } from '@clerk/shared/internal/clerk-js/sessionTasks';
import type { SessionResource } from '@clerk/shared/types';
import { createContext, useContext } from 'react';

import { useRouter } from '@/ui/router';

import type { SessionTasksCtx, TaskChooseOrganizationCtx, TaskResetPasswordCtx } from '../../types';

export const SessionTasksContext = createContext<SessionTasksCtx | null>(null);

type SessionTasksContextType = SessionTasksCtx & {
  navigateOnSetActive: (opts: { session: SessionResource; redirectUrlComplete: string }) => Promise<unknown>;
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
  }: {
    session: SessionResource;
    redirectUrlComplete: string;
  }) => {
    const currentTask = session.currentTask;
    if (!currentTask) {
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
