/** @jsxImportSource @emotion/react */
import { Tabs } from '@clerk/ui/mosaic/components/tabs';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './tabs.component.stories?raw';

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
