import { Tabs } from '@clerk/mosaic/components/tabs';
import { MembersTableTabView } from '@clerk/mosaic/features/organization-profile/members-table-tab.view';
import type { ReactNode } from 'react';

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

function MembersTab({ children }: { children: ReactNode }) {
  return (
    <Tabs.Root defaultValue='members'>
      <Tabs.List aria-label='Organization members'>
        <Tabs.Tab value='members'>Members</Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Panel value='members'>{children}</Tabs.Panel>
    </Tabs.Root>
  );
}

export function Legacy() {
  const props = useMembersTableFixture();
  return (
    <MembersTab>
      <MembersTableTabView {...props} />
    </MembersTab>
  );
}

export function Proposed() {
  const props = useMembersTableFixture({ proposed: true });
  return (
    <MembersTab>
      <MembersTableTabView {...props} />
    </MembersTab>
  );
}

export function Empty() {
  const props = useMembersTableFixture({ empty: true });
  return (
    <MembersTab>
      <MembersTableTabView {...props} />
    </MembersTab>
  );
}
