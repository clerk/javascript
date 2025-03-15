import { useClerk } from '@clerk/shared/react/index';
import { eventComponentMounted } from '@clerk/shared/telemetry';
import type { SessionTask } from '@clerk/types';
import { useEffect } from 'react';

import { useRouter } from '../../../ui/router';
import { OrganizationListContext } from '../../contexts';
import { OrganizationList } from '../OrganizationList';

interface SessionTaskProps {
  task: SessionTask['key'];
  redirectUrlComplete: string;
}

const ContentRegistry: Record<SessionTask['key'], React.ComponentType> = {
  org: () => (
    // TODO - Hide personal workspace within organization list context based on environment
    <OrganizationListContext.Provider
      value={{
        componentName: 'OrganizationList',
        hidePersonal: true,
        skipInvitationScreen: true,
        afterSelectOrganizationUrl: undefined,
        afterCreateOrganizationUrl: undefined,
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
  const { navigate } = useRouter();

  useEffect(() => {
    if (clerk.session?.currentTask) {
      return;
    }

    void navigate(redirectUrlComplete);
  }, [clerk.session?.currentTask, navigate, redirectUrlComplete]);

  clerk.telemetry?.record(eventComponentMounted('SessionTask', { task }));

  const Content = ContentRegistry[task];

  return <Content />;
}
