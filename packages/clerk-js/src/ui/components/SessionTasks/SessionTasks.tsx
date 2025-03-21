import { useClerk } from '@clerk/shared/react';
import { eventComponentMounted } from '@clerk/shared/telemetry';
import type { SessionTask } from '@clerk/types';
import { useCallback, useEffect } from 'react';

import { SESSION_TASK_ROUTE_BY_KEY } from '../../../core/sessionTasks';
import { OrganizationListContext } from '../../contexts';
import { SessionTaskContext as SessionTaskContext } from '../../contexts/components/SessionTask';
import { Route, Switch, useRouter } from '../../router';
import { OrganizationList } from '../OrganizationList';

// TODO -> Lazy load individual routes per environment config
function SessionTaskRoutes(): JSX.Element {
  return (
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
  );
}

/**
 * @internal
 */
export function SessionTask({ redirectUrlComplete }: { redirectUrlComplete: string }): JSX.Element {
  const { __experimental_nextTask, session, telemetry } = useClerk();
  const { navigate } = useRouter();

  telemetry?.record(eventComponentMounted('SessionTask', { task: session?.currentTask?.key as string }));

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
    <SessionTaskContext.Provider value={{ nextTask }}>
      <SessionTaskRoutes />
    </SessionTaskContext.Provider>
  );
}
