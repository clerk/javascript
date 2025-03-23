import { useClerk } from '@clerk/shared/react';
import { eventComponentMounted } from '@clerk/shared/telemetry';
import type { SessionTask } from '@clerk/types';
import { useCallback, useContext, useEffect } from 'react';

import { SESSION_TASK_ROUTE_BY_KEY } from '../../../core/sessionTasks';
import { OrganizationListContext, SignInContext, SignUpContext } from '../../../ui/contexts';
import { Card, LoadingCardContainer, withCardStateProvider } from '../../../ui/elements';
import { SessionTasksContext as SessionTasksContext } from '../../contexts/components/SessionTasks';
import { Route, Switch, useRouter } from '../../router';
import { OrganizationList } from '../OrganizationList';

const SessionTasksStart = withCardStateProvider(() => {
  const clerk = useClerk();
  const { navigate } = useRouter();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void clerk.session?.reload().then(session => {
        if (!session.currentTask?.key) {
          void navigate(clerk.buildAfterSignInUrl());
          return;
        }

        void navigate(SESSION_TASK_ROUTE_BY_KEY[session.currentTask?.key]);
      });
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [navigate, clerk]);

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
      <Route index>
        <SessionTasksStart />
      </Route>
    </Switch>
  );
}

/**
 * @internal
 */
export function SessionTask(): JSX.Element {
  const clerk = useClerk();
  const { navigate } = useRouter();
  const signInContext = useContext(SignInContext);
  const signUpContext = useContext(SignUpContext);

  const redirectUrlComplete =
    signInContext?.afterSignInUrl ?? signUpContext?.afterSignUpUrl ?? clerk?.buildAfterSignInUrl();

  useEffect(() => {
    const task = clerk.session?.currentTask;

    if (!task) {
      void navigate(redirectUrlComplete);
      return;
    }

    clerk.telemetry?.record(eventComponentMounted('SessionTask', { task: task.key }));
  }, [clerk, navigate, redirectUrlComplete]);

  const nextTask = useCallback(
    () => clerk.__experimental_nextTask({ redirectUrlComplete: redirectUrlComplete }),
    [clerk, redirectUrlComplete],
  );

  return (
    <SessionTasksContext.Provider value={{ nextTask }}>
      <SessionTaskRoutes />
    </SessionTasksContext.Provider>
  );
}
