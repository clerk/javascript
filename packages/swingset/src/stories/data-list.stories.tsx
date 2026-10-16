import { DataList } from '@clerk/mosaic/components/data-list';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './data-list.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'stable',
  title: 'DataList',
  label: 'Data list',
  source: 'packages/mosaic/src/components/data-list/data-list.tsx',
};

export function Default() {
  return (
    <DataList.Root>
      <DataList.Item>
        <DataList.Label>Device</DataList.Label>
        <DataList.Value>Macbook Pro</DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label>Browser</DataList.Label>
        <DataList.Value>Chrome 150.0.0.0</DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label>IP address</DataList.Label>
        <DataList.Value>2600:100e:b10b:787b:e8ae:6e75</DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label>Last location</DataList.Label>
        <DataList.Value>🇺🇸 Salt Lake City, UT, United States</DataList.Value>
      </DataList.Item>
    </DataList.Root>
  );
}

export function Plain() {
  return (
    <DataList.Root divided={false}>
      <DataList.Item>
        <DataList.Label>Plan</DataList.Label>
        <DataList.Value>Pro</DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label>Renews</DataList.Label>
        <DataList.Value>July 5th, 2026</DataList.Value>
      </DataList.Item>
    </DataList.Root>
  );
}
