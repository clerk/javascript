import type { StoryMeta } from '@/lib/types';

import { APIKeysPanelExample, useAPIKeysTableFixture } from './fixtures/api-keys-table';

export { default as __source } from './organization-profile-api-keys-panel.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  status: 'wip',
  title: 'OrganizationProfileApiKeysPanel',
  label: 'API keys panel',
  navigation: { category: 'Panels' },
  source: 'packages/mosaic/src/features/organization-profile/organization-profile-api-keys-panel.tsx',
};

export function Default() {
  const props = useAPIKeysTableFixture({ subjectKind: 'organization' });
  return <APIKeysPanelExample {...props} />;
}

export function Empty() {
  const props = useAPIKeysTableFixture({ subjectKind: 'organization', initialKeys: [] });
  return <APIKeysPanelExample {...props} />;
}
