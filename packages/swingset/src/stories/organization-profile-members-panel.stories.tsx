import { OrganizationProfileMembersPanelView } from '@clerk/mosaic/features/organization-profile/organization-profile-members-panel.view';

import type { StoryMeta } from '@/lib/types';

import { useMembersTableFixture } from './fixtures/members-table-tab';

export { default as __source } from './organization-profile-members-panel.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  status: 'wip',
  substatus: 'needs wire-up',
  title: 'OrganizationProfileMembersPanel',
  label: 'Members panel',
  navigation: { category: 'Panels' },
  source: 'packages/mosaic/src/features/organization-profile/organization-profile-members-panel.view.tsx',
};

export function Legacy() {
  const props = useMembersTableFixture();
  return <OrganizationProfileMembersPanelView members={props} />;
}

export function Proposed() {
  const props = useMembersTableFixture({ proposed: true });
  return <OrganizationProfileMembersPanelView members={props} />;
}

export function Empty() {
  const props = useMembersTableFixture({ empty: true });
  return <OrganizationProfileMembersPanelView members={props} />;
}
