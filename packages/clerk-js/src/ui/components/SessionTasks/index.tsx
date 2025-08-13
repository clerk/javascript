import { useClerk } from '@clerk/shared/react';
import { eventComponentMounted } from '@clerk/shared/telemetry';
import { useContext, useEffect, useRef } from 'react';

import { Card } from '@/ui/elements/Card';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { LoadingCardContainer } from '@/ui/elements/LoadingCard';

import { INTERNAL_SESSION_TASK_ROUTE_BY_KEY } from '../../../core/sessionTasks';
import { SignInContext, SignUpContext } from '../../../ui/contexts';
import {
  SessionTasksContext,
  TaskChooseOrganizationContext,
  useSessionTasksContext,
} from '../../contexts/components/SessionTasks';
import { Route, Switch, useRouter } from '../../router';
import { TaskChooseOrganization } from './tasks/TaskChooseOrganization';

const SessionTasksStart = () => {
  const clerk = useClerk();
  const { navigate } = useRouter();
  const { redirectUrlComplete } = useSessionTasksContext();

  useEffect(() => {
    // Simulates additional latency to avoid a abrupt UI transition when navigating to the next task
    const timeoutId = setTimeout(() => {
      void clerk.__internal_navigateToTaskIfAvailable({ redirectUrlComplete });
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
  const ctx = useSessionTasksContext();

  return (
    <Switch>
      <Route path={INTERNAL_SESSION_TASK_ROUTE_BY_KEY['choose-organization']}>
        <TaskChooseOrganizationContext.Provider
          value={{ componentName: 'TaskChooseOrganization', redirectUrlComplete: ctx.redirectUrlComplete }}
        >
          <TaskChooseOrganization />
        </TaskChooseOrganizationContext.Provider>
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
  const currentTaskContainer = useRef<HTMLDivElement>(null);

  const redirectUrlComplete =
    signInContext?.afterSignInUrl ?? signUpContext?.afterSignUpUrl ?? clerk?.buildAfterSignInUrl();

  // If there are no pending tasks, navigate away from the tasks flow.
  // This handles cases where a user with an active session returns to the tasks URL,
  // for example by using browser back navigation. Since there are no pending tasks,
  // we redirect them to their intended destination.
  useEffect(() => {
    // Tasks can only exist on pending sessions, but we check both conditions
    // here to be defensive and ensure proper redirection
    const task = clerk.session?.currentTask;
    if (!task || clerk.session?.status === 'active') {
      void navigate(redirectUrlComplete);
      return;
    }

    clerk.telemetry?.record(eventComponentMounted('SessionTask', { task: task.key }));
  }, [clerk, navigate, redirectUrlComplete]);

  if (!clerk.session?.currentTask) {
    return (
      <Card.Root
        sx={() => ({
          minHeight: currentTaskContainer ? currentTaskContainer.current?.offsetHeight : undefined,
        })}
      >
        <Card.Content sx={() => ({ flex: 1 })}>
          <LoadingCardContainer />
        </Card.Content>
        <Card.Footer />
      </Card.Root>
    );
  }

  return (
    <SessionTasksContext.Provider value={{ redirectUrlComplete, currentTaskContainer }}>
      <SessionTaskRoutes />
    </SessionTasksContext.Provider>
  );
});
