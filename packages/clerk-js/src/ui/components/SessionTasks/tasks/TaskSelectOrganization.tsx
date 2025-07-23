import { OrganizationListContext } from '@/ui/contexts';
import { useTaskSelectOrganizationContext } from '@/ui/contexts/components/SessionTasks';
import { withCardStateProvider } from '@/ui/elements/contexts';

import { OrganizationList } from '../../OrganizationList';

export const TaskSelectOrganization = withCardStateProvider(() => {
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
});
