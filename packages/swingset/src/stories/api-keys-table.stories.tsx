import { APIKeysTableView } from '@clerk/mosaic/features/api-keys/api-keys-table.view';

import type { StoryMeta } from '@/lib/types';

import { useAPIKeysTableFixture } from './fixtures/api-keys-table';

export { default as __source } from './api-keys-table.stories?raw';

export const meta: StoryMeta = {
  group: 'API Keys',
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

export function Empty() {
  const props = useAPIKeysTableFixture({ initialKeys: [] });
  return (
    <APIKeysTableView
      {...props}
      onCreate={undefined}
      onRevoke={undefined}
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
