import { useClerk } from '@clerk/shared/react/index';
import { eventComponentMounted } from '@clerk/shared/telemetry';
import type { SessionTask } from '@clerk/types';

import { OrganizationListContext } from '../../contexts';
import { OrganizationList } from '../OrganizationList';

const ContentRegistry: Record<SessionTask['key'], React.ComponentType> = {
  org: () => (
    // TODO - Hide personal workspace within organization list context based on environment
    <OrganizationListContext.Provider value={{ componentName: 'OrganizationList', hidePersonal: true }}>
      <OrganizationList />
    </OrganizationListContext.Provider>
  ),
};

/**
 * @internal
 */
export function SessionTask({ task }: { task: SessionTask['key'] }): React.ReactNode {
  const clerk = useClerk();

  clerk.telemetry?.record(eventComponentMounted('SessionTask', { task }));

  const Content = ContentRegistry[task];

  return <Content />;
}
