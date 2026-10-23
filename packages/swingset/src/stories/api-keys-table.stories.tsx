import { Button } from '@clerk/mosaic/components/button';
import { APIKeysTableSkeleton } from '@clerk/mosaic/features/api-keys/api-keys-table.skeleton';
import { APIKeysTableView } from '@clerk/mosaic/features/api-keys/api-keys-table.view';
import { space } from '@clerk/mosaic/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { useEffect, useState } from 'react';

import type { StoryMeta } from '@/lib/types';

import { useAPIKeysTableFixture } from './fixtures/api-keys-table';

export { default as __source } from './api-keys-table.stories?raw';

const styles = stylex.create({
  loadingStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: space['4'],
  },
});

export const meta: StoryMeta = {
  group: 'Misc',
  status: 'wip',
  title: 'APIKeysTable',
  label: 'API keys table',
  source: 'packages/mosaic/src/features/api-keys/api-keys-table.view.tsx',
};

export function Default() {
  const props = useAPIKeysTableFixture();
  return <APIKeysTableView {...props} />;
}

export function Organization() {
  const props = useAPIKeysTableFixture({ subjectKind: 'organization', initialKeys: [] });
  return <APIKeysTableView {...props} />;
}

export function Description() {
  const props = useAPIKeysTableFixture({ showDescription: true });
  return <APIKeysTableView {...props} />;
}

export function Empty() {
  const props = useAPIKeysTableFixture({ initialKeys: [] });
  return (
    <APIKeysTableView
      {...props}
      onCreate={undefined}
      revoke={undefined}
    />
  );
}

export function ProposedTable() {
  const props = useAPIKeysTableFixture({ enableSorting: true });
  return (
    <APIKeysTableView
      {...props}
      onBulkAction={() => undefined}
    />
  );
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
      <div>
        <Button
          color='neutral'
          size='sm'
          variant='outline'
          disabled={loading}
          onClick={() => setLoading(true)}
        >
          Reload
        </Button>
      </div>
      {loading ? (
        <APIKeysTableSkeleton
          messages={props.messages}
          canManage
        />
      ) : (
        <APIKeysTableView {...props} />
      )}
    </div>
  );
}
