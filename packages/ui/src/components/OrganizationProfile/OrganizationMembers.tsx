import { withCardStateProvider } from '@/ui/elements/contexts';

import { ActiveMembersList } from './ActiveMembersList';
import { MembersActionsRow } from './MembersActions';
import { MembersSearch } from './MembersSearch';
import { ACTIVE_MEMBERS_PAGE_SIZE } from './organization-members.constants';
import { useOrganizationMembersController } from './organization-members.controller';
import { useOrganizationMembersModel, useOrganizationMembersScope } from './organization-members.model';
import { OrganizationMembersView } from './organization-members.view';
import { OrganizationMembersTabInvitations } from './OrganizationMembersTabInvitations';
import { OrganizationMembersTabRequests } from './OrganizationMembersTabRequests';

export { ACTIVE_MEMBERS_PAGE_SIZE } from './organization-members.constants';

const OrganizationMembersContent = withCardStateProvider(() => {
  const controller = useOrganizationMembersController();
  const model = useOrganizationMembersModel(controller.query, ACTIVE_MEMBERS_PAGE_SIZE);

  if (model.isPending) {
    return null;
  }

  return (
    <OrganizationMembersView
      controller={controller}
      data={model.view}
      membersActions={
        <MembersActionsRow
          actionSlot={
            <MembersSearch
              query={controller.query}
              value={controller.search}
              memberships={model.searchQuery}
              onSearchChange={controller.setSearch}
              onQueryTrigger={controller.setQuery}
            />
          }
        />
      }
      activeMembers={<ActiveMembersList model={model.activeMembers} />}
      invitations={<OrganizationMembersTabInvitations />}
      requests={<OrganizationMembersTabRequests />}
    />
  );
});

export const OrganizationMembers = () => {
  const scope = useOrganizationMembersScope();
  return <OrganizationMembersContent key={`${scope.userId}:${scope.organizationId}`} />;
};
