import { useSessionContext } from '@clerk/shared/react/index';
import type { SessionTask } from '@clerk/types';
import type { ComponentType } from 'react';

import { OrganizationListContext } from '../../contexts';
import { OrganizationList } from '../OrganizationList';

const TaskRegistry: Record<SessionTask['key'], ComponentType> = {
  org: () => (
    <OrganizationListContext.Provider value={{ componentName: 'OrganizationList', hidePersonal: true }}>
      <OrganizationList />
    </OrganizationListContext.Provider>
  ),
};

/**
 * @internal
 */
export function Task(): React.ReactNode {
  const session = useSessionContext();

  if (!session?.hasTask) {
    return null;
  }

  const [task] = session.tasks ?? [];
  const Content = TaskRegistry[task.key];

  return <Content />;
}
