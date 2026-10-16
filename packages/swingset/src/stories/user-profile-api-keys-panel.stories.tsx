import type { StoryMeta } from '@/lib/types';

import { APIKeysPanelExample, useAPIKeysTableFixture } from './fixtures/api-keys-table';

export { default as __source } from './user-profile-api-keys-panel.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  status: 'wip',
  title: 'UserProfileApiKeysPanel',
  label: 'API keys panel',
  navigation: { category: 'Panels' },
  source: 'packages/mosaic/src/features/user-profile/user-profile-api-keys-panel.tsx',
};

export function Default() {
  const props = useAPIKeysTableFixture();
  return <APIKeysPanelExample {...props} />;
}

export function Empty() {
  const props = useAPIKeysTableFixture({ initialKeys: [] });
  return <APIKeysPanelExample {...props} />;
}
