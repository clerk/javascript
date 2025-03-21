import { useClerk } from '@clerk/shared/react';
import { eventComponentMounted } from '@clerk/shared/telemetry';
import type { SessionTask } from '@clerk/types';
import { SESSION_TASK_ROUTE_BY_KEY } from 'core/sessionTasks';
import { useCallback, useEffect } from 'react';

import { Flow } from '../../../ui/customizables';
import { OrganizationListContext } from '../../contexts';
import { SessionTaskContext as SessionTaskContext } from '../../contexts/components/SessionTask';
import { Route, Switch, useRouter } from '../../router';
import { OrganizationList } from '../OrganizationList';

function SessionTaskRoutes(): JSX.Element {
  const { telemetry, session } = useClerk();

  telemetry?.record(eventComponentMounted('SessionTask', { task: session?.currentTask?.key as string }));

  return (
    <Flow.Root flow='tasks'>
      <Switch>
        <Route path={SESSION_TASK_ROUTE_BY_KEY['org']}>
          <OrganizationListContext.Provider
            value={{
              componentName: 'OrganizationList',
              skipInvitationScreen: true,
            }}
          >
            <OrganizationList />
          </OrganizationListContext.Provider>
        </Route>
      </Switch>
    </Flow.Root>
  );
}

/**
 * @internal
 */
export function SessionTask({ redirectUrlComplete }: { redirectUrlComplete: string }): JSX.Element {
  const { __experimental_nextTask, session } = useClerk();
  const { navigate } = useRouter();

  useEffect(() => {
    if (session?.currentTask) {
      return;
    }

    void navigate(redirectUrlComplete);
  }, [session?.currentTask, navigate, redirectUrlComplete]);

  const nextTask = useCallback(
    () => __experimental_nextTask({ redirectUrlComplete }),
    [__experimental_nextTask, redirectUrlComplete],
  );

  return (
    <SessionTaskContext.Provider value={{ nextTask, componentName: 'SessionTask' }}>
      <SessionTaskRoutes />
    </SessionTaskContext.Provider>
  );
}

/**
 * @internal
 */
export function SessionTaskModal(): JSX.Element {
  const { __experimental_nextTask, __internal_closeSessionTask } = useClerk();

  const nextTask = useCallback(
    () => __experimental_nextTask({ onComplete: __internal_closeSessionTask }),
    [__experimental_nextTask, __internal_closeSessionTask],
  );

  return (
    <Route path='tasks'>
      <SessionTaskContext.Provider value={{ nextTask, mode: 'modal', componentName: 'SessionTask' }}>
        <SessionTaskRoutes />
      </SessionTaskContext.Provider>
    </Route>
  );
}
