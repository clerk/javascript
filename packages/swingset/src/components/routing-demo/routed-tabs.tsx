'use client';

import { Tabs } from '@clerk/mosaic/components/tabs';
import type { ReactNode } from 'react';

export interface RoutedTab {
  value: string;
  label: string;
  content: ReactNode;
}

/** Mosaic's tabs, controlled from outside: the active tab is whatever the route says, and picking one is `go`. */
export function RoutedTabs({
  value,
  onValueChange,
  tabs,
}: {
  value: string;
  onValueChange: (value: string) => void;
  tabs: readonly RoutedTab[];
}) {
  return (
    <Tabs.Root
      value={value}
      onValueChange={onValueChange}
    >
      <Tabs.List>
        {tabs.map(tab => (
          <Tabs.Tab
            key={tab.value}
            value={tab.value}
          >
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      <Tabs.Panels>
        {tabs.map(tab => (
          <Tabs.Panel
            key={tab.value}
            value={tab.value}
          >
            <div className='py-3 text-sm'>{tab.content}</div>
          </Tabs.Panel>
        ))}
      </Tabs.Panels>
    </Tabs.Root>
  );
}
