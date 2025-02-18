import { useSessionContext } from '@clerk/shared/react/index';
import type { SessionTask } from '@clerk/types';
import type { ComponentType } from 'react';
import { withRedirectToAfterSignIn } from 'ui/common';

import { Route } from '../../../ui/router';
import { OrganizationList } from '../OrganizationList';

const paths: Record<SessionTask['key'], string> = {
  orgs: 'select-organization',
};

const TaskRegistry: Record<SessionTask['key'], ComponentType> = {
  orgs: OrganizationList,
};

function usePendingTask() {
  const session = useSessionContext();

  if (!session) {
    return null;
  }

  const [pendingTask] = session.tasks ?? [];

  return pendingTask;
}

export function _PendingTask() {
  const pendingTask = usePendingTask();

  if (!pendingTask) {
    return null;
  }

  const Task = TaskRegistry['orgs'];
  const path = paths[pendingTask.key];

  return (
    <Route path={path}>
      <Task />
    </Route>
  );
}

export const PendingTask = withRedirectToAfterSignIn(_PendingTask);
