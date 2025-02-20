import { useSessionContext } from '@clerk/shared/react/index';
import type { Route } from '@clerk/shared/router';
import type { ComponentProps } from 'react';

import { sessionTaskRoutePaths } from '../../common/tasks';
import { Task } from './Task';

/**
 * Maps a task key to routing props and content
 * @internal
 */
export function useTaskRoute(): ComponentProps<typeof Route> | null {
  const session = useSessionContext();

  if (!session?.currentTask) {
    return null;
  }

  const [task] = session.tasks ?? [];

  return {
    children: <Task />,
    path: sessionTaskRoutePaths[task.key],
  };
}
