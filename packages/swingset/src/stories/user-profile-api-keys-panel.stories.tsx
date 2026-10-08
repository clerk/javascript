import { Button } from '@clerk/mosaic/components/button';
import { UserProfileApiKeysPanelSkeleton } from '@clerk/mosaic/features/user-profile/user-profile-api-keys-panel.skeleton';
import { space } from '@clerk/mosaic/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { useEffect, useState } from 'react';

import type { StoryMeta } from '@/lib/types';

import { APIKeysPanelExample, useAPIKeysTableFixture } from './fixtures/api-keys-table';

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

export function Loading() {
  const props = useAPIKeysTableFixture();
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
      {loading ? <UserProfileApiKeysPanelSkeleton /> : <APIKeysPanelExample {...props} />}
    </div>
  );
}

export function PageChange() {
  const props = useAPIKeysTableFixture({ fetchDelay: 2000 });
  return (
    <APIKeysPanelExample
      {...props}
      refetchSkeleton
    />
  );
}
