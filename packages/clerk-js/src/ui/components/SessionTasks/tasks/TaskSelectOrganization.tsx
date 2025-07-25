import { OrganizationListContext, withCoreSessionSwitchGuard } from '@/ui/contexts';
import { useTaskSelectOrganizationContext } from '@/ui/contexts/components/SessionTasks';
import { withCardStateProvider } from '@/ui/elements/contexts';

import { OrganizationList } from '../../OrganizationList';
import { withTaskGuard } from './withTaskGuard';

const TaskSelectOrganizationInternal = () => {
  const ctx = useTaskSelectOrganizationContext();

  return (
    <OrganizationListContext.Provider
      value={{
        componentName: 'OrganizationList',
        skipInvitationScreen: true,
        appearance: ctx?.appearance,
      }}
    >
      <OrganizationList />
    </OrganizationListContext.Provider>
  );
};

export const TaskSelectOrganization = withCoreSessionSwitchGuard(
  withTaskGuard(withCardStateProvider(TaskSelectOrganizationInternal)),
);
