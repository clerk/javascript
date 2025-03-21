import { useClerk } from '@clerk/shared/react';
import { eventComponentMounted } from '@clerk/shared/telemetry';
import type { SessionTask } from '@clerk/types';
import { useCallback, useEffect } from 'react';

import { SESSION_TASK_ROUTE_BY_KEY } from '../../../core/sessionTasks';
import { Flow } from '../../../ui/customizables';
import { Card, LoadingCardContainer, withCardStateProvider } from '../../../ui/elements';
import { OrganizationListContext } from '../../contexts';
import { SessionTaskContext as SessionTaskContext } from '../../contexts/components/SessionTask';
import { Route, Switch, useRouter } from '../../router';
import { OrganizationList } from '../OrganizationList';

const SessionTaskRoot = withCardStateProvider(() => {
  const { session } = useClerk();
  const { navigate } = useRouter();

  useEffect(() => {
    if (!session) {
      return;
    }

    const timeoutId = setTimeout(() => {
      void session.touch().then(session => {
        if (!session.currentTask?.key) {
          return;
        }

        void navigate(`${SESSION_TASK_ROUTE_BY_KEY[session.currentTask?.key]}`);
      });
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [navigate, session]);

  return (
    <Card.Root>
      <Card.Content>
        <LoadingCardContainer />
      </Card.Content>
      <Card.Footer />
    </Card.Root>
  );
});

function SessionTaskRoutes(): JSX.Element {
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
      <Route index>
        <SessionTaskRoot />
      </Route>
    </Flow.Root>
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
      <SessionTaskContext.Provider value={{ nextTask, componentName: 'SessionTask', mode: 'modal' }}>
        <SessionTaskRoutes />
      </SessionTaskContext.Provider>
    </Route>
  );
}
