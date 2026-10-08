import { withCardStateProvider } from '@/ui/elements/contexts';

import { InvitedMembersList } from './InvitedMembersList';
import { OrganizationMembersTab } from './organization-members-tab';

export const OrganizationMembersTabInvitations = withCardStateProvider(() => (
  <OrganizationMembersTab
    kind='invitations'
    list={<InvitedMembersList />}
  />
));
