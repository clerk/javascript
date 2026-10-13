import { SegmentedControl } from '@clerk/mosaic/components/segmented-control';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './segmented-control.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'stable',
  title: 'Segmented Control',
  source: 'packages/mosaic/src/components/segmented-control/segmented-control.tsx',
};

export function Default() {
  return (
    <SegmentedControl.Root
      aria-label='Billing period'
      defaultValue='monthly'
    >
      <SegmentedControl.Item value='monthly'>Monthly</SegmentedControl.Item>
      <SegmentedControl.Item value='annual'>Annual</SegmentedControl.Item>
    </SegmentedControl.Root>
  );
}

export function Disabled() {
  return (
    <SegmentedControl.Root
      aria-label='View'
      defaultValue='list'
    >
      <SegmentedControl.Item value='list'>List</SegmentedControl.Item>
      <SegmentedControl.Item value='grid'>Grid</SegmentedControl.Item>
      <SegmentedControl.Item
        value='board'
        disabled
      >
        Board
      </SegmentedControl.Item>
    </SegmentedControl.Root>
  );
}
