import { withCardStateProvider } from '@/elements/contexts';

import {
  useSessionTasksController,
  useSessionTasksRoutesController,
  useSessionTasksStartController,
} from './session-tasks.controller';
import { useSessionTasksModel } from './session-tasks.model';
import {
  SessionTasksLoadingView,
  SessionTasksRoutesView,
  SessionTasksStartView,
  SessionTasksView,
} from './session-tasks.view';

const SessionTasksStart = () => {
  const model = useSessionTasksModel();
  useSessionTasksStartController(model);
  return <SessionTasksStartView />;
};

function SessionTasksRoutes(): JSX.Element {
  const model = useSessionTasksModel();
  const controller = useSessionTasksRoutesController(model);

  if (controller.showLoading) {
    return <SessionTasksLoadingView />;
  }

  return (
    <SessionTasksRoutesView
      redirectUrlComplete={controller.redirectUrlComplete}
      routes={model.routes}
      start={<SessionTasksStart />}
    />
  );
}

type SessionTasksProps = {
  redirectUrlComplete: string;
};

/**
 * @internal
 */
export const SessionTasks = withCardStateProvider(({ redirectUrlComplete }: SessionTasksProps) => {
  const controller = useSessionTasksController();
  return (
    <SessionTasksView
      redirectUrlComplete={redirectUrlComplete}
      redirectOnActiveSessionRef={controller.redirectOnActiveSessionRef}
    >
      <SessionTasksRoutes />
    </SessionTasksView>
  );
});
