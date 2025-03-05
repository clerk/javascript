import type { SessionTask } from '@clerk/types';
import { type ComponentType } from 'react';

import { OrganizationListContext } from '../../contexts';
import { OrganizationList } from '../OrganizationList';

/**
 * @internal
 */
const SessionTaskRegistry: Record<SessionTask['key'], ComponentType> = {
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
  const Content = SessionTaskRegistry[task];
  return <Content />;
}
