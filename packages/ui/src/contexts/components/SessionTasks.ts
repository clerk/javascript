import { buildTaskUrl, getTaskEndpoint } from '@clerk/shared/internal/clerk-js/sessionTasks';
import { windowNavigate } from '@clerk/shared/internal/clerk-js/windowNavigate';
import { useClerk } from '@clerk/shared/react';
import type { DecorateUrl, SessionResource } from '@clerk/shared/types';
import { createContext, useContext } from 'react';

import { useRouter, VIRTUAL_ROUTER_BASE_PATH } from '@/ui/router';

import type { SessionTasksCtx, TaskChooseOrganizationCtx, TaskResetPasswordCtx, TaskSetupMFACtx } from '../../types';

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
  const clerk = useClerk();

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

      // If decorateUrl modified the URL (Safari ITP fix), do a full page navigation
      // The touch endpoint URL will be an absolute URL starting with http:// or https://
      if (decoratedUrl !== redirectUrlComplete && /^https?:\/\//.test(decoratedUrl)) {
        windowNavigate(decoratedUrl);
        return;
      }

      return navigate(redirectUrlComplete);
    }

    // Check if there's a custom taskUrl configured for this task
    const customTaskUrl = clerk.__internal_getOption('taskUrls')?.[currentTask.key];
    if (customTaskUrl) {
      return navigate(customTaskUrl);
    }

    const taskEndpoint = getTaskEndpoint(currentTask);
    if (basePath === VIRTUAL_ROUTER_BASE_PATH) {
      return navigate(`/${basePath + startPath + taskEndpoint}`);
    }

    // If there's no custom taskUrl, and we are not using virtual routing
    // we can just navigate to the task endpoint directly.
    const signInUrl = clerk.buildSignInUrl();
    return navigate(buildTaskUrl(currentTask, { base: signInUrl }));
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

export const TaskSetupMFAContext = createContext<TaskSetupMFACtx | null>(null);

export const useTaskSetupMFAContext = (): TaskSetupMFACtx => {
  const context = useContext(TaskSetupMFAContext);

  if (context === null) {
    throw new Error('Clerk: useTaskSetupMFAContext called outside of the mounted TaskSetupMFA component.');
  }

  return context;
};
