import { useClerk } from '@clerk/shared/react';
import { useEffect } from 'react';

import { Card } from '@/ui/elements/Card';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { LoadingCardContainer } from '@/ui/elements/LoadingCard';

import { SESSION_TASK_ROUTE_BY_KEY } from '../../../core/sessionTasks';
import { useCurrentTaskContext } from '../../contexts/components/CurrentTask';
import { Route, Switch } from '../../router';
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

export const CurrentTask = withCardStateProvider(() => <CurrentTaskRoutes />);
