import { Button } from '@clerk/mosaic/components/button';
import { UserProfileApiKeysPanelSkeleton } from '@clerk/mosaic/features/user-profile/user-profile-api-keys-panel.skeleton';
import { UserProfileApiKeysPanelView } from '@clerk/mosaic/features/user-profile/user-profile-api-keys-panel.view';
import { space } from '@clerk/mosaic/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { useEffect, useState } from 'react';

import type { StoryMeta } from '@/lib/types';

import { useUserProfileAPIKeysFixture } from './fixtures/user-profile-api-keys';

export { default as __source } from './user-profile-api-keys-panel.stories?raw';

const styles = stylex.create({
  loadingStack: {
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    gap: space['4'],
    width: '100%',
  },
});

export const meta: StoryMeta = {
  group: 'User Profile',
  status: 'wip',
  title: 'UserProfileApiKeysPanel',
  label: 'API keys panel',
  navigation: { category: 'Panels' },
  source: 'packages/mosaic/src/features/user-profile/user-profile-api-keys-panel.view.tsx',
};

export function Default() {
  const props = useUserProfileAPIKeysFixture();
  return <UserProfileApiKeysPanelView {...props} />;
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
  const props = useUserProfileAPIKeysFixture({ enableSorting: true });
  return (
    <UserProfileApiKeysPanelView
      {...props}
      onBulkAction={() => undefined}
    />
  );
}

export function Loading() {
  const props = useUserProfileAPIKeysFixture();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      return;
    }
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <div {...stylex.props(styles.loadingStack)}>
      <Button
        color='neutral'
        size='sm'
        variant='outline'
        disabled={loading}
        onClick={() => setLoading(true)}
      >
        Reload
      </Button>
      {loading ? (
        <UserProfileApiKeysPanelSkeleton pageSize={props.pageSize} />
      ) : (
        <UserProfileApiKeysPanelView {...props} />
      )}
    </div>
  );
}
