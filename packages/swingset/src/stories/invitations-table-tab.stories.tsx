import { InvitationsTableTabView } from '@clerk/mosaic/features/organization-profile/invitations-table-tab.view';

import type { StoryMeta } from '@/lib/types';

import { useInvitationsTableFixture } from './fixtures/invitations-table-tab';

export { default as __source } from './invitations-table-tab.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  status: 'wip',
  substatus: 'needs wire-up',
  title: 'InvitationsTableTab',
  label: 'Invitations table',
  navigation: { category: 'Panels' },
  source: 'packages/mosaic/src/features/organization-profile/invitations-table-tab.view.tsx',
};

export function Legacy() {
  const props = useInvitationsTableFixture();
  return <InvitationsTableTabView {...props} />;
}

export function Proposed() {
  const props = useInvitationsTableFixture({ proposed: true });
  return <InvitationsTableTabView {...props} />;
}

export function Empty() {
  const props = useInvitationsTableFixture({ empty: true });
  return <InvitationsTableTabView {...props} />;
}
