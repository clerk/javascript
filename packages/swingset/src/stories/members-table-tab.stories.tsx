import { MembersTableTabView } from '@clerk/mosaic/features/organization-profile/members-table-tab.view';

import type { StoryMeta } from '@/lib/types';

import { useMembersTableFixture } from './fixtures/members-table-tab';

export { default as __source } from './members-table-tab.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  status: 'wip',
  substatus: 'needs wire-up',
  title: 'MembersTableTab',
  label: 'Members table tab',
  navigation: { category: 'Tabs' },
  source: 'packages/mosaic/src/features/organization-profile/members-table-tab.view.tsx',
};

export function Legacy() {
  const props = useMembersTableFixture();
  return <MembersTableTabView {...props} />;
}

export function Proposed() {
  const props = useMembersTableFixture({ proposed: true });
  return <MembersTableTabView {...props} />;
}

export function Empty() {
  const props = useMembersTableFixture({ empty: true });
  return <MembersTableTabView {...props} />;
}
