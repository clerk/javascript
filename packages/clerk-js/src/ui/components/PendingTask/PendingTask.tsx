import { useSessionContext } from '@clerk/shared/react/index';
import type { SessionTasks } from '@clerk/types';
import type { ComponentType } from 'react';
import { withRedirectToAfterSignIn } from 'ui/common';

import { Route } from '../../../ui/router';
import { OrganizationList } from '../OrganizationList';

const paths: Record<keyof SessionTasks, string> = {
  orgs: 'select-organization',
};

const TaskRegistry: Record<keyof SessionTasks, ComponentType> = {
  orgs: OrganizationList,
};

function usePendingTask() {
  const session = useSessionContext();

  if (!session) {
    return null;
  }

  const [pendingTask] = Object.entries(session.tasks ?? {}).map(([task, value]) => ({
    task,
    ...value,
  }));

  return pendingTask;
}

export function _PendingTask() {
  const pendingTask = usePendingTask();

  if (!pendingTask) {
    return null;
  }

  const Task = TaskRegistry['orgs'];
  // @ts-ignore
  const path = paths[pendingTask.task];

  return (
    <Route path={path}>
      <Task />
    </Route>
  );
}

export const PendingTask = withRedirectToAfterSignIn(_PendingTask);
