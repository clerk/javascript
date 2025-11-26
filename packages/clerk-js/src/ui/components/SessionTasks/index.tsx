import { useClerk } from '@clerk/shared/react';
import { eventComponentMounted } from '@clerk/shared/telemetry';
import type { SessionResource } from '@clerk/shared/types';
import { useEffect, useRef } from 'react';

import { Flow } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { LoadingCardContainer } from '@/ui/elements/LoadingCard';

import { INTERNAL_SESSION_TASK_ROUTE_BY_KEY } from '../../../core/sessionTasks';
import {
  SessionTasksContext,
  TaskChooseOrganizationContext,
  TaskResetPasswordContext,
  useSessionTasksContext,
} from '../../contexts/components/SessionTasks';
import { Route, Switch, useRouter } from '../../router';
import { TaskChooseOrganization } from './tasks/TaskChooseOrganization';
import { TaskResetPassword } from './tasks/TaskResetPassword';

const SessionTasksStart = () => {
  const clerk = useClerk();
  const { navigate } = useRouter();
  const { redirectUrlComplete } = useSessionTasksContext();

  useEffect(() => {
    // Simulates additional latency to avoid a abrupt UI transition when navigating to the next task
    const timeoutId = setTimeout(() => {
      const currentTaskKey = clerk.session?.currentTask?.key;
      if (!currentTaskKey) {
        return;
      }

      void navigate(`./${INTERNAL_SESSION_TASK_ROUTE_BY_KEY[currentTaskKey]}`);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [navigate, clerk, redirectUrlComplete]);

  return (
    <Flow.Part part='start'>
      <Card.Root>
        <Card.Content>
          <LoadingCardContainer />
        </Card.Content>
        <Card.Footer />
      </Card.Root>
    </Flow.Part>
  );
};

function SessionTasksRoutes(): JSX.Element {
  const ctx = useSessionTasksContext();

  return (
    <Flow.Root flow='tasks'>
      <Switch>
        <Route path={INTERNAL_SESSION_TASK_ROUTE_BY_KEY['choose-organization']}>
          <TaskChooseOrganizationContext.Provider
            value={{ componentName: 'TaskChooseOrganization', redirectUrlComplete: ctx.redirectUrlComplete }}
          >
            <TaskChooseOrganization />
          </TaskChooseOrganizationContext.Provider>
        </Route>
        <Route path={INTERNAL_SESSION_TASK_ROUTE_BY_KEY['reset-password']}>
          <TaskResetPasswordContext.Provider
            value={{ componentName: 'TaskResetPassword', redirectUrlComplete: ctx.redirectUrlComplete }}
          >
            <TaskResetPassword />
          </TaskResetPasswordContext.Provider>
        </Route>
        <Route index>
          <SessionTasksStart />
        </Route>
      </Switch>
    </Flow.Root>
  );
}

type SessionTasksProps = {
  redirectUrlComplete: string;
};

/**
 * @internal
 */
export const SessionTasks = withCardStateProvider(({ redirectUrlComplete }: SessionTasksProps) => {
  const clerk = useClerk();
  const { navigate, matches } = useRouter();
  const currentTaskContainer = useRef<HTMLDivElement>(null);

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
  }, [clerk, matches, navigate, redirectUrlComplete]);

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

  const navigateOnSetActive = async ({ session }: { session: SessionResource }) => {
    const currentTask = session.currentTask;
    if (!currentTask) {
      return navigate(redirectUrlComplete);
    }

    return navigate(`./${INTERNAL_SESSION_TASK_ROUTE_BY_KEY[currentTask.key]}`);
  };

  return (
    <SessionTasksContext.Provider value={{ redirectUrlComplete, currentTaskContainer, navigateOnSetActive }}>
      <SessionTasksRoutes />
    </SessionTasksContext.Provider>
  );
});
