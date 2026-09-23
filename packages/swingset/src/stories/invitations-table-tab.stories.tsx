import { Tabs } from '@clerk/mosaic/components/tabs';
import { InvitationsTableTabView } from '@clerk/mosaic/features/organization-profile/invitations-table-tab.view';
import type { ReactNode } from 'react';

import type { StoryMeta } from '@/lib/types';

import { useInvitationsTableFixture } from './fixtures/invitations-table-tab';

export { default as __source } from './invitations-table-tab.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  status: 'wip',
  substatus: 'needs wire-up',
  title: 'InvitationsTableTab',
  label: 'Invitations table tab',
  navigation: { category: 'Tabs' },
  source: 'packages/mosaic/src/features/organization-profile/invitations-table-tab.view.tsx',
};

function InvitationsTab({ children }: { children: ReactNode }) {
  return (
    <Tabs.Root defaultValue='invitations'>
      <Tabs.List aria-label='Organization invitations'>
        <Tabs.Tab value='invitations'>Invitations</Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Panel value='invitations'>{children}</Tabs.Panel>
    </Tabs.Root>
  );
}

export function Legacy() {
  const props = useInvitationsTableFixture();
  return (
    <InvitationsTab>
      <InvitationsTableTabView {...props} />
    </InvitationsTab>
  );
}

export function Proposed() {
  const props = useInvitationsTableFixture({ proposed: true });
  return (
    <InvitationsTab>
      <InvitationsTableTabView {...props} />
    </InvitationsTab>
  );
}

export function Empty() {
  const props = useInvitationsTableFixture({ empty: true });
  return (
    <InvitationsTab>
      <InvitationsTableTabView {...props} />
    </InvitationsTab>
  );
}
