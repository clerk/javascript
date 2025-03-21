import { useClerk } from '@clerk/shared/react';
import { eventComponentMounted } from '@clerk/shared/telemetry';
import type { SessionTask } from '@clerk/types';
import { useCallback, useEffect } from 'react';

import { SESSION_TASK_ROUTE_BY_KEY } from '../../../core/sessionTasks';
import { SessionTaskContext as SessionTaskContext } from '../../contexts/components/SessionTask';
import { Route, Switch, useRouter } from '../../router';
import { LazyOrganizationSelectionTask } from './lazyTasks';
import { usePreloadTasks } from './usePreloadTasks';

function SessionTaskRoutes(): JSX.Element {
  return (
    <Switch>
      <Route path={SESSION_TASK_ROUTE_BY_KEY['org']}>
        <LazyOrganizationSelectionTask />
      </Route>
    </Switch>
  );
}

/**
 * @internal
 */
export function SessionTask({ redirectUrlComplete }: { redirectUrlComplete: string }): JSX.Element {
  usePreloadTasks();

  const { __experimental_nextTask, session, telemetry } = useClerk();
  const { navigate } = useRouter();

  const task = session?.currentTask;

  useEffect(() => {
    if (task) {
      telemetry?.record(eventComponentMounted('SessionTask', { task: task.key }));
      return;
    }

    void navigate(redirectUrlComplete);
  }, [task, telemetry, navigate, redirectUrlComplete]);

  const nextTask = useCallback(
    () => __experimental_nextTask({ redirectUrlComplete }),
    [__experimental_nextTask, redirectUrlComplete],
  );

  return (
    <SessionTaskContext.Provider value={{ nextTask }}>
      <SessionTaskRoutes />
    </SessionTaskContext.Provider>
  );
}
