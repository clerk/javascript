import { INTERNAL_SESSION_TASK_ROUTE_BY_KEY } from '@clerk/shared/internal/clerk-js/sessionTasks';
import { useClerk } from '@clerk/shared/react';
import { eventComponentMounted } from '@clerk/shared/telemetry';
import { useCallback } from 'react';

export const useSessionTasksModel = () => {
  const clerk = useClerk();
  const taskKey = clerk.session?.currentTask?.key;
  const recordTaskMounted = useCallback(() => {
    if (taskKey) {
      clerk.telemetry?.record(eventComponentMounted('SessionTask', { task: taskKey }));
    }
  }, [clerk, taskKey]);
  const getCurrentTaskRoute = useCallback(() => {
    const currentTaskKey = clerk.session?.currentTask?.key;
    return currentTaskKey ? INTERNAL_SESSION_TASK_ROUTE_BY_KEY[currentTaskKey] : null;
  }, [clerk]);

  return {
    taskKey,
    getCurrentTaskRoute,
    routes: {
      chooseOrganization: INTERNAL_SESSION_TASK_ROUTE_BY_KEY['choose-organization'],
      resetPassword: INTERNAL_SESSION_TASK_ROUTE_BY_KEY['reset-password'],
      setupMfa: INTERNAL_SESSION_TASK_ROUTE_BY_KEY['setup-mfa'],
    },
    isSessionActive: clerk.session?.status === 'active',
    recordTaskMounted,
  };
};
