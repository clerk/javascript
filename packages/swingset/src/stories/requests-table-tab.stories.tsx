import { Tabs } from '@clerk/mosaic/components/tabs';
import { RequestsTableTabView } from '@clerk/mosaic/features/organization-profile/requests-table-tab.view';
import type { ReactNode } from 'react';

import type { StoryMeta } from '@/lib/types';

import { useRequestsTableFixture } from './fixtures/requests-table-tab';

export { default as __source } from './requests-table-tab.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  status: 'wip',
  substatus: 'needs wire-up',
  title: 'RequestsTableTab',
  label: 'Requests table tab',
  navigation: { category: 'Tabs' },
  source: 'packages/mosaic/src/features/organization-profile/requests-table-tab.view.tsx',
};

function RequestsTab({ children }: { children: ReactNode }) {
  return (
    <Tabs.Root defaultValue='requests'>
      <Tabs.List aria-label='Organization requests'>
        <Tabs.Tab value='requests'>Requests</Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Panel value='requests'>{children}</Tabs.Panel>
    </Tabs.Root>
  );
}

export function Legacy() {
  const props = useRequestsTableFixture();
  return (
    <RequestsTab>
      <RequestsTableTabView {...props} />
    </RequestsTab>
  );
}

export function Proposed() {
  const props = useRequestsTableFixture({ proposed: true });
  return (
    <RequestsTab>
      <RequestsTableTabView {...props} />
    </RequestsTab>
  );
}

export function Empty() {
  const props = useRequestsTableFixture({ empty: true });
  return (
    <RequestsTab>
      <RequestsTableTabView {...props} />
    </RequestsTab>
  );
}
