import { useClerk } from '@clerk/shared/react';
import { eventComponentMounted } from '@clerk/shared/telemetry';
import type { __internal_SessionTaskModalProps, SessionTask } from '@clerk/types';
import { useCallback, useEffect } from 'react';

import { OrganizationListContext } from '../../contexts';
import { SessionTaskContext as SessionTaskContext } from '../../contexts/components/SessionTask';
import { useRouter } from '../../router';
import { OrganizationList } from '../OrganizationList';

interface SessionTaskProps {
  task: SessionTask['key'];
  redirectUrlComplete: string;
}

const ContentRegistry: Record<SessionTask['key'], React.ComponentType> = {
  org: () => (
    <OrganizationListContext.Provider
      value={{
        componentName: 'OrganizationList',
        skipInvitationScreen: true,
      }}
    >
      <OrganizationList />
    </OrganizationListContext.Provider>
  ),
};

/**
 * @internal
 */
export function SessionTask({ task, redirectUrlComplete }: SessionTaskProps): React.ReactNode {
  const { session, telemetry, __experimental_nextTask } = useClerk();
  const { navigate } = useRouter();

  useEffect(() => {
    if (session?.currentTask) {
      return;
    }

    void navigate(redirectUrlComplete);
  }, [session?.currentTask, navigate, redirectUrlComplete]);

  telemetry?.record(eventComponentMounted('SessionTask', { task }));

  const nextTask = useCallback(
    () => __experimental_nextTask({ redirectUrlComplete }),
    [__experimental_nextTask, redirectUrlComplete],
  );

  const Content = ContentRegistry[task];

  return (
    <SessionTaskContext.Provider value={{ nextTask }}>
      <Content />
    </SessionTaskContext.Provider>
  );
}

/**
 * @internal
 */
export function SessionTaskModal({ task }: __internal_SessionTaskModalProps): JSX.Element | null {
  if (!task) {
    return null;
  }

  const clerk = useClerk();

  clerk.telemetry?.record(eventComponentMounted('SessionTaskModal', { task }));

  const Content = ContentRegistry[task];

  // TODO -> Introduce basic routing to navigate between tasks
  return <Content />;
}
