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

export const useTaskChooseOrganizationContext = (): TaskChooseOrganizationCtx => {
  const context = useContext(TaskChooseOrganizationContext);

  if (context === null) {
    throw new Error(
      'Clerk: useTaskChooseOrganizationContext called outside of the mounted TaskChooseOrganization component.',
    );
  }

  return context;
};
