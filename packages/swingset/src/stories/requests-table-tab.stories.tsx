import { RequestsTableTabView } from '@clerk/mosaic/features/organization-profile/requests-table-tab.view';

import type { StoryMeta } from '@/lib/types';

import { useRequestsTableFixture } from './fixtures/requests-table-tab';

export { default as __source } from './requests-table-tab.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  status: 'wip',
  substatus: 'needs wire-up',
  title: 'RequestsTableTab',
  label: 'Requests table',
  navigation: { category: 'Panels' },
  source: 'packages/mosaic/src/features/organization-profile/requests-table-tab.view.tsx',
};

export function Legacy() {
  const props = useRequestsTableFixture();
  return <RequestsTableTabView {...props} />;
}

export function Proposed() {
  const props = useRequestsTableFixture({ proposed: true });
  return <RequestsTableTabView {...props} />;
}

export function Empty() {
  const props = useRequestsTableFixture({ empty: true });
  return <RequestsTableTabView {...props} />;
}
