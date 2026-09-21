import { Tabs } from '@clerk/mosaic/components/tabs';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'stable',
  title: 'Tabs',
  source: 'packages/mosaic/src/components/tabs/tabs.tsx',
};

export function Default() {
  return (
    <Tabs.Root defaultValue='account'>
      <Tabs.List>
        <Tabs.Tab value='account'>Account</Tabs.Tab>
        <Tabs.Tab value='security'>Security</Tabs.Tab>
        <Tabs.Tab value='notifications'>Notifications</Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Panel value='account'>Manage your account details.</Tabs.Panel>
      <Tabs.Panel value='security'>Update your password and sessions.</Tabs.Panel>
      <Tabs.Panel value='notifications'>Choose what you get notified about.</Tabs.Panel>
    </Tabs.Root>
  );
}
