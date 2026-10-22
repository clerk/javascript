import type { StoryMeta } from '@/lib/types';

import { LogsPanelExample, useLogsTableFixture } from './fixtures/logs-table';

export { default as __source } from './organization-profile-logs-panel.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  status: 'wip',
  substatus: 'needs wire-up',
  title: 'OrganizationProfileLogsPanel',
  label: 'Logs panel',
  navigation: { category: 'Panels' },
  source: 'packages/mosaic/src/features/organization-profile/organization-profile-logs-panel.tsx',
};

export function Default() {
  const props = useLogsTableFixture();
  return <LogsPanelExample {...props} />;
}
