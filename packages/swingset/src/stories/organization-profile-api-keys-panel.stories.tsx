import { OrganizationProfileApiKeysPanelView } from '@clerk/mosaic/features/organization-profile/organization-profile-api-keys-panel.view';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './organization-profile-api-keys-panel.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  status: 'wip',
  substatus: 'needs design',
  title: 'OrganizationProfileApiKeysPanel',
  label: 'API Keys panel',
  navigation: { category: 'Panels' },
  source: 'packages/mosaic/src/features/organization-profile/organization-profile-api-keys-panel.view.tsx',
};

export function Default() {
  return <OrganizationProfileApiKeysPanelView />;
}
