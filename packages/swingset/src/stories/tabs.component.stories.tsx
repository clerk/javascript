/** @jsxImportSource @emotion/react */
import { Tabs } from '@clerk/ui/mosaic/components/tabs';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Tabs',
  source: 'packages/ui/src/mosaic/components/tabs.tsx',
};

export function Default() {
  return (
    <Tabs.Root defaultValue='account'>
      <Tabs.List>
        <Tabs.Tab value='account'>Account</Tabs.Tab>
        <Tabs.Tab value='password'>Password</Tabs.Tab>
        <Tabs.Tab
          value='disabled'
          disabled
        >
          Disabled
        </Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Panel value='account'>Manage your account settings here.</Tabs.Panel>
      <Tabs.Panel value='password'>Change your password here.</Tabs.Panel>
      <Tabs.Panel value='disabled'>This panel is unreachable.</Tabs.Panel>
    </Tabs.Root>
  );
}

export function Stacked() {
  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
      <Tabs.Root
        defaultValue='account'
        orientation='vertical'
      >
        <Tabs.List style={{ width: '12rem' }}>
          <Tabs.Tab value='account'>Account</Tabs.Tab>
          <Tabs.Tab value='password'>Password</Tabs.Tab>
          <Tabs.Tab value='notifications'>Notifications</Tabs.Tab>
          <Tabs.Indicator />
        </Tabs.List>
        <div style={{ flex: 1 }}>
          <Tabs.Panel value='account'>Manage your account settings here.</Tabs.Panel>
          <Tabs.Panel value='password'>Change your password here.</Tabs.Panel>
          <Tabs.Panel value='notifications'>Choose what you get notified about.</Tabs.Panel>
        </div>
      </Tabs.Root>
    </div>
  );
}
