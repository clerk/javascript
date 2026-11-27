'use client';

import { SegmentedControl } from '@clerk/mosaic/components/segmented-control';

export default function SegmentedControlExample() {
  return (
    <>
      <SegmentedControl.Root
        aria-label='Billing period'
        defaultValue='month'
      >
        <SegmentedControl.Item value='month'>Monthly</SegmentedControl.Item>
        <SegmentedControl.Item value='annual'>Yearly</SegmentedControl.Item>
      </SegmentedControl.Root>
      <SegmentedControl.Root
        aria-label='Theme'
        defaultValue='light'
      >
        <SegmentedControl.Item value='light'>Light</SegmentedControl.Item>
        <SegmentedControl.Item value='dark'>Dark</SegmentedControl.Item>
        <SegmentedControl.Item
          value='system'
          disabled
        >
          System
        </SegmentedControl.Item>
      </SegmentedControl.Root>
    </>
  );
}
