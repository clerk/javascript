import { useClerk } from '@clerk/shared/react/index';
import { createContext, useCallback, useContext } from 'react';

import type { SessionTasksCtx, TaskSelectOrganizationCtx } from '../../types';

export const SessionTasksContext = createContext<SessionTasksCtx | null>(null);

export type SessionTasksContextType = SessionTasksCtx & {
  navigateToTaskIfAvailable: () => Promise<void>;
};

export const useSessionTasksContext = (): SessionTasksContextType => {
  const clerk = useClerk();
  const ctx = useContext(SessionTasksContext);

  if (ctx === null) {
    throw new Error('Clerk: useSessionTasksContext called outside of the mounted SessionTasks component.');
  }

  const redirectUrlComplete = ctx.redirectUrlComplete;

  const navigateToTaskIfAvailable = useCallback(() => {
    return clerk.__internal_navigateToTaskIfAvailable({ redirectUrlComplete });
  }, [clerk, redirectUrlComplete]);

  return {
    ...ctx,
    navigateToTaskIfAvailable,
  };
};

export const TaskSelectOrganizationContext = createContext<TaskSelectOrganizationCtx | null>(null);
