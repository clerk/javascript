import { createContext, useContext } from 'react';

import type { SessionTasksCtx, TaskSelectOrganizationCtx } from '../../types';

export const SessionTasksContext = createContext<SessionTasksCtx | null>(null);

export const useSessionTasksContext = (): SessionTasksCtx => {
  const context = useContext(SessionTasksContext);

  if (context === null) {
    throw new Error('Clerk: useSessionTasksContext called outside of the mounted SessionTasks component.');
  }

  return context;
};

export const TaskSelectOrganizationContext = createContext<TaskSelectOrganizationCtx | null>(null);
