import { useClerk } from '@clerk/shared/react';
import { eventComponentMounted } from '@clerk/shared/telemetry';
import { useEffect } from 'react';

import { Card } from '@/ui/elements/Card';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { LoadingCardContainer } from '@/ui/elements/LoadingCard';

import { SESSION_TASK_ROUTE_BY_KEY } from '../../../core/sessionTasks';
import { useCurrentTaskContext } from '../../contexts/components/CurrentTask';
import { Route, Switch, useRouter } from '../../router';
import { ForceOrganizationSelectionTask } from './tasks/ForceOrganizationSelection';

/**
 * Used by server-side redirects from `@clerk/backend` in order to determine
 * which task to resolve when reaching the client
 */
const CurrentTaskStart = () => {
  const clerk = useClerk();
  const { nextTask } = useCurrentTaskContext();

  useEffect(() => {
    // Simulates additional latency to avoid a abrupt UI transition when navigating to the next task
    const timeoutId = setTimeout(() => {
      void nextTask();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [clerk]);

  return (
    <Card.Root>
      <Card.Content>
        <LoadingCardContainer />
      </Card.Content>
      <Card.Footer />
    </Card.Root>
  );
};

function CurrentTaskRoutes(): JSX.Element {
  return (
    <Switch>
      <Route path={SESSION_TASK_ROUTE_BY_KEY['org']}>
        <ForceOrganizationSelectionTask />
      </Route>
      <Route index>
        <CurrentTaskStart />
      </Route>
    </Switch>
  );
}

export const CurrentTask = withCardStateProvider(() => {
  const { session, telemetry } = useClerk();
  const { navigate } = useRouter();
  const { redirectUrlComplete, currentTaskContainer } = useCurrentTaskContext();

  // If there are no pending tasks, navigate away from the tasks flow.
  // This handles cases where a user with an active session returns to the tasks URL,
  // for example by using browser back navigation. Since there are no pending tasks,
  // we redirect them to their intended destination.
  useEffect(() => {
    // Tasks can only exist on pending sessions, but we check both conditions
    // here to be defensive and ensure proper redirection
    const task = session?.currentTask;
    if (!task || session?.status === 'active') {
      void navigate(redirectUrlComplete);
      return;
    }

    telemetry?.record(eventComponentMounted('CurrentTask', { task: task.key }));
  }, [session, telemetry, navigate, redirectUrlComplete]);

  if (!session?.currentTask) {
    return (
      <Card.Root
        sx={() => ({
          // Maintain the same height of the latest active task container when navigating to `redirectUrlComplete`
          // which avoids layout shift
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

  return <CurrentTaskRoutes />;
});
