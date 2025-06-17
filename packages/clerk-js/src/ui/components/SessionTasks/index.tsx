import { useClerk } from '@clerk/shared/react';
import { eventComponentMounted } from '@clerk/shared/telemetry';
import { useCallback, useContext, useEffect } from 'react';

import { Card } from '@/ui/elements/Card';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { LoadingCardContainer } from '@/ui/elements/LoadingCard';

import { SESSION_TASK_ROUTE_BY_KEY } from '../../../core/sessionTasks';
import { SignInContext, SignUpContext } from '../../../ui/contexts';
import { SessionTasksContext, useSessionTasksContext } from '../../contexts/components/SessionTasks';
import { Route, Switch, useRouter } from '../../router';
import { ForceOrganizationSelectionTask } from './tasks/ForceOrganizationSelection';

const SessionTasksStart = () => {
  const clerk = useClerk();
  const { navigate } = useRouter();
  const { redirectUrlComplete } = useSessionTasksContext();

  useEffect(() => {
    // Simulates additional latency to avoid a abrupt UI transition when navigating to the next task
    const timeoutId = setTimeout(() => {
      void clerk.__experimental_navigateToTask({ redirectUrlComplete });
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [navigate, clerk, redirectUrlComplete]);

  return (
    <Card.Root>
      <Card.Content>
        <LoadingCardContainer />
      </Card.Content>
      <Card.Footer />
    </Card.Root>
  );
};

function SessionTaskRoutes(): JSX.Element {
  return (
    <Switch>
      <Route path={SESSION_TASK_ROUTE_BY_KEY['org']}>
        <ForceOrganizationSelectionTask />
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
export const SessionTask = withCardStateProvider(() => {
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

  const nextTask = useCallback(() => {
    return clerk.__experimental_navigateToTask({ redirectUrlComplete });
  }, [clerk, redirectUrlComplete]);

  if (!clerk.session?.currentTask) {
    return (
      <Card.Root>
        <Card.Content>
          <LoadingCardContainer />
        </Card.Content>
        <Card.Footer />
      </Card.Root>
    );
  }

  return (
    <SessionTasksContext.Provider value={{ nextTask, redirectUrlComplete }}>
      <SessionTaskRoutes />
    </SessionTasksContext.Provider>
  );
});
