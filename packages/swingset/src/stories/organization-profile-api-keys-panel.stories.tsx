import { OrganizationProfileApiKeysPanelView } from '@clerk/ui/mosaic/organization-profile/organization-profile-api-keys-panel.view';

import type { StoryMeta } from '@/lib/types';

import { apiKeys } from './organization-profile-api-keys-section.stories';

export { default as __source } from './organization-profile-api-keys-panel.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  title: 'OrganizationProfileApiKeysPanel',
  label: 'API Keys panel',
  navigation: { category: 'Panels' },
  source: 'packages/ui/src/mosaic/organization-profile/organization-profile-api-keys-panel.view.tsx',
};

export function Default() {
  return (
    <OrganizationProfileApiKeysPanelView
      apiKeys={apiKeys}
      pagination={{ page: 1, pageCount: 2, pageSize: 10, pageSizeOptions: [10, 25, 50] }}
      searchValue=''
      selectedIds={[]}
      onCreate={() => undefined}
      onManage={() => undefined}
      onPageChange={() => undefined}
      onPageSizeChange={() => undefined}
      onSearchChange={() => undefined}
      onSelectionChange={() => undefined}
    />
  );
}
