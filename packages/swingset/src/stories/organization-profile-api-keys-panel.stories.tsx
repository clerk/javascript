import { OrganizationProfileApiKeysPanelView } from '@clerk/mosaic/features/organization-profile/organization-profile-api-keys-panel.view';

import type { StoryMeta } from '@/lib/types';

import { useOrganizationProfileAPIKeysFixture } from './fixtures/organization-profile-api-keys';

export { default as __source } from './organization-profile-api-keys-panel.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  status: 'wip',
  title: 'OrganizationProfileApiKeysPanel',
  label: 'API keys panel',
  navigation: { category: 'Panels' },
  source: 'packages/mosaic/src/features/organization-profile/organization-profile-api-keys-panel.view.tsx',
};

export function Default() {
  const props = useOrganizationProfileAPIKeysFixture();
  return <OrganizationProfileApiKeysPanelView {...props} />;
}

export function Empty() {
  const props = useOrganizationProfileAPIKeysFixture({ initialKeys: [] });
  return (
    <OrganizationProfileApiKeysPanelView
      {...props}
      onCreate={undefined}
      onRevoke={undefined}
    />
  );
}
