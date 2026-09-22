import { OrganizationProfileMembersPanelView } from '@clerk/mosaic/features/organization-profile/organization-profile-members-panel.view';

import type { StoryMeta } from '@/lib/types';

import { useOrganizationMembersFixture } from './fixtures/organization-profile';

export { default as __source } from './organization-profile-members-panel.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  status: 'wip',
  substatus: 'needs wire-up',
  title: 'OrganizationProfileMembersPanel',
  label: 'Members panel',
  navigation: { category: 'Panels' },
  layout: 'wide',
  source: 'packages/mosaic/src/features/organization-profile/organization-profile-members-panel.view.tsx',
};

export function Default() {
  const props = useOrganizationMembersFixture();
  return <OrganizationProfileMembersPanelView {...props} />;
}

export function EmptyMembers() {
  const props = useOrganizationMembersFixture({ members: [] });
  return (
    <OrganizationProfileMembersPanelView
      {...props}
      defaultTab='members'
    />
  );
}

export function EmptyInvitations() {
  const props = useOrganizationMembersFixture({ invitations: [] });
  return (
    <OrganizationProfileMembersPanelView
      {...props}
      defaultTab='invitations'
    />
  );
}

export function EmptyRequests() {
  const props = useOrganizationMembersFixture({ requests: [] });
  return (
    <OrganizationProfileMembersPanelView
      {...props}
      defaultTab='requests'
    />
  );
}
