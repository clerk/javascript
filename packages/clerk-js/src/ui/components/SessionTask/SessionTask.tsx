import { useClerk } from '@clerk/shared/react/index';
import { eventComponentMounted } from '@clerk/shared/telemetry';
import type { SessionTask } from '@clerk/types';

import { OrganizationListContext } from '../../contexts';
import { OrganizationList } from '../OrganizationList';

interface SessionTaskProps {
  task: SessionTask['key'];
  redirectUrlComplete: string;
}

const ContentRegistry: Record<
  SessionTask['key'],
  React.ComponentType<Pick<SessionTaskProps, 'redirectUrlComplete'>>
> = {
  org: ({ redirectUrlComplete }) => (
    // TODO - Hide personal workspace within organization list context based on environment
    <OrganizationListContext.Provider
      value={{
        componentName: 'OrganizationList',
        hidePersonal: true,
        skipInvitationScreen: true,
        afterSelectOrganizationUrl: redirectUrlComplete,
        afterCreateOrganizationUrl: redirectUrlComplete,
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
  const clerk = useClerk();

  clerk.telemetry?.record(eventComponentMounted('SessionTask', { task }));

  const Content = ContentRegistry[task];

  return <Content redirectUrlComplete={redirectUrlComplete} />;
}
