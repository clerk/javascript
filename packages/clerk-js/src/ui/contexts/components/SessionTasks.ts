import type { OrganizationResource, SessionResource } from '@clerk/types';
import { createContext, useContext } from 'react';

import type { SessionTasksCtx, TaskChooseOrganizationCtx } from '../../types';

export const SessionTasksContext = createContext<SessionTasksCtx | null>(null);

export const useSessionTasksContext = (): SessionTasksCtx => {
  const context = useContext(SessionTasksContext);

  if (context === null) {
    throw new Error('Clerk: useSessionTasksContext called outside of the mounted SessionTasks component.');
  }

  return context;
};

export const TaskChooseOrganizationContext = createContext<TaskChooseOrganizationCtx | null>(null);

type TaskChooseOrganizationContextType = TaskChooseOrganizationCtx & {
  navigateOnSetActive: (opts: { session: SessionResource; organization: OrganizationResource }) => Promise<unknown>;
};

export const useTaskChooseOrganizationContext = (): TaskChooseOrganizationContextType => {
  const context = useContext(TaskChooseOrganizationContext);

  if (context === null) {
    throw new Error(
      'Clerk: useTaskChooseOrganizationContext called outside of the mounted TaskChooseOrganization component.',
    );
  }

  const { onNextTask, onComplete } = context;

  const navigateOnSetActive = ({
    session,
    organization,
  }: {
    session: SessionResource;
    organization: OrganizationResource;
  }) => {
    if (session.currentTask) {
      return onNextTask(session.currentTask);
    }

    return onComplete(organization);
  };

  return {
    ...context,
    navigateOnSetActive,
  };
};
