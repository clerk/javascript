import { useEffect, useRef } from 'react';

import { useSessionTasksContext } from '@/contexts/components/SessionTasks';
import { useRouter } from '@/router';

import type { useSessionTasksModel } from './session-tasks.model';

export const useSessionTasksStartController = (model: ReturnType<typeof useSessionTasksModel>) => {
  const { navigate } = useRouter();
  const { redirectUrlComplete } = useSessionTasksContext();
  const { getCurrentTaskRoute } = model;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const route = getCurrentTaskRoute();
      if (route !== null) {
        void navigate(`./${route}`);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [navigate, getCurrentTaskRoute, redirectUrlComplete]);
};

export const useSessionTasksRoutesController = (model: ReturnType<typeof useSessionTasksModel>) => {
  const ctx = useSessionTasksContext();
  const { navigate, currentPath } = useRouter();
  const { taskKey, isSessionActive, recordTaskMounted } = model;

  useEffect(() => {
    if (!taskKey || isSessionActive) {
      if (ctx.redirectOnActiveSession?.current) {
        void navigate(ctx.redirectUrlComplete);
      }
      return;
    }

    recordTaskMounted();
  }, [
    taskKey,
    isSessionActive,
    recordTaskMounted,
    currentPath,
    navigate,
    ctx.redirectUrlComplete,
    ctx.redirectOnActiveSession,
  ]);

  return {
    redirectUrlComplete: ctx.redirectUrlComplete,
    showLoading: !model.taskKey && Boolean(ctx.redirectOnActiveSession?.current),
  };
};

export const useSessionTasksController = () => {
  const redirectOnActiveSessionRef = useRef<boolean>(true);
  return { redirectOnActiveSessionRef };
};
