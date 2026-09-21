import { OrganizationProfileInvitationsTabView } from '@clerk/mosaic/features/organization-profile/organization-profile-invitations-tab.view';

import type { StoryMeta } from '@/lib/types';

import { useOrganizationMembersFixture } from './fixtures/organization-profile';

export { default as __source } from './organization-profile-invitations-tab.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  status: 'wip',
  substatus: 'needs wire-up',
  title: 'OrganizationProfileInvitationsTab',
  label: 'Invitations',
  navigation: { category: 'Sections' },
  layout: 'wide',
  source: 'packages/mosaic/src/features/organization-profile/organization-profile-invitations-tab.view.tsx',
};

export function Default() {
  const { invitations = [], roles, onChangeInvitationRole, onRevokeInvitation } = useOrganizationMembersFixture();
  return (
    <OrganizationProfileInvitationsTabView
      invitations={invitations}
      roles={roles}
      search=''
      roleFilter={null}
      overlay={null}
      onChangeRole={onChangeInvitationRole}
      onRevoke={onRevokeInvitation}
    />
  );
}
