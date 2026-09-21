import { UserProfileApiKeysPanelView } from '@clerk/mosaic/features/user-profile/user-profile-api-keys-panel.view';
import { UserProfileCreateAPIKeyDialog } from '@clerk/mosaic/features/user-profile/user-profile-create-api-key.dialog';

import type { StoryMeta } from '@/lib/types';

import { useUserProfileAPIKeysFixture } from './fixtures/user-profile-api-keys';

export { default as __source } from './user-profile-api-keys-panel.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  status: 'wip',
  title: 'UserProfileApiKeysPanel',
  label: 'API keys panel',
  navigation: { category: 'Panels' },
  source: 'packages/mosaic/src/features/user-profile/user-profile-api-keys-panel.view.tsx',
};

export function Default() {
  const { createDialog, ...props } = useUserProfileAPIKeysFixture();
  return (
    <>
      <UserProfileApiKeysPanelView {...props} />
      <UserProfileCreateAPIKeyDialog {...createDialog} />
    </>
  );
}

export function Empty() {
  const props = useUserProfileAPIKeysFixture({ initialKeys: [] });
  return (
    <UserProfileApiKeysPanelView
      {...props}
      onCreate={undefined}
      onRevoke={undefined}
    />
  );
}

export function ProposedTable() {
  const { createDialog, ...props } = useUserProfileAPIKeysFixture({ enableSorting: true });
  return (
    <>
      <UserProfileApiKeysPanelView
        {...props}
        onBulkAction={() => undefined}
      />
      <UserProfileCreateAPIKeyDialog {...createDialog} />
    </>
  );
}
