import type { MutableRefObject, ReactNode } from 'react';

import {
  SessionTasksContext,
  TaskChooseOrganizationContext,
  TaskResetPasswordContext,
  TaskSetupMFAContext,
} from '@/contexts/components/SessionTasks';
import { Flow } from '@/customizables';
import { Card } from '@/elements/Card';
import { LoadingCardContainer } from '@/elements/LoadingCard';
import { Route, Switch } from '@/router';

import { TaskChooseOrganization } from './tasks/TaskChooseOrganization';
import { TaskResetPassword } from './tasks/TaskResetPassword';
import { TaskSetupMFA } from './tasks/TaskSetupMfa';

export const SessionTasksStartView = () => (
  <Flow.Part part='start'>
    <Card.Root>
      <Card.Content>
        <LoadingCardContainer />
      </Card.Content>
      <Card.Footer />
    </Card.Root>
  </Flow.Part>
);

export const SessionTasksLoadingView = () => (
  <Card.Root>
    <Card.Content sx={() => ({ flex: 1 })}>
      <LoadingCardContainer />
    </Card.Content>
    <Card.Footer />
  </Card.Root>
);

export const SessionTasksRoutesView = ({
  redirectUrlComplete,
  routes,
  start,
}: {
  redirectUrlComplete: string;
  routes: { chooseOrganization: string; resetPassword: string; setupMfa: string };
  start: ReactNode;
}) => (
  <Flow.Root flow='tasks'>
    <Switch>
      <Route path={routes.chooseOrganization}>
        <TaskChooseOrganizationContext.Provider
          value={{ componentName: 'TaskChooseOrganization', redirectUrlComplete }}
        >
          <TaskChooseOrganization />
        </TaskChooseOrganizationContext.Provider>
      </Route>
      <Route path={routes.resetPassword}>
        <TaskResetPasswordContext.Provider value={{ componentName: 'TaskResetPassword', redirectUrlComplete }}>
          <TaskResetPassword />
        </TaskResetPasswordContext.Provider>
      </Route>
      <Route path={routes.setupMfa}>
        <TaskSetupMFAContext.Provider value={{ componentName: 'TaskSetupMFA', redirectUrlComplete }}>
          <TaskSetupMFA />
        </TaskSetupMFAContext.Provider>
      </Route>
      <Route index>{start}</Route>
    </Switch>
  </Flow.Root>
);

export const SessionTasksView = ({
  redirectUrlComplete,
  redirectOnActiveSessionRef,
  children,
}: {
  redirectUrlComplete: string;
  redirectOnActiveSessionRef: MutableRefObject<boolean>;
  children: ReactNode;
}) => (
  <SessionTasksContext.Provider value={{ redirectUrlComplete, redirectOnActiveSession: redirectOnActiveSessionRef }}>
    {children}
  </SessionTasksContext.Provider>
);
