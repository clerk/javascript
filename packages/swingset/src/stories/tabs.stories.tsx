import { Tabs } from '@clerk/headless/tabs';

import type { StoryMeta } from '@/lib/types';

// Headless primitives ship no styles. This single demo renders the primitive raw —
// unstyled — so it faithfully reflects what `@clerk/headless` provides: behavior, state,
// and ARIA wiring via the `data-cl-*` attributes each part emits, with zero appearance.
// It is embedded once into the overview via `<Story>` in the MDX (the one thing prose
// can't convey: that selecting a tab swaps the panel). There is no interactive knob canvas
// for headless primitives.

export const meta: StoryMeta = {
  group: 'Primitives',
  title: 'Tabs',
  source: 'packages/headless/src/primitives/tabs/index.ts',
};

export function Default() {
  return (
    <Tabs.Root defaultValue='account'>
      <Tabs.List>
        <Tabs.Tab value='account'>Account</Tabs.Tab>
        <Tabs.Tab value='security'>Security</Tabs.Tab>
        <Tabs.Tab value='notifications'>Notifications</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value='account'>Manage your account details.</Tabs.Panel>
      <Tabs.Panel value='security'>Update your password and sessions.</Tabs.Panel>
      <Tabs.Panel value='notifications'>Choose what you get notified about.</Tabs.Panel>
    </Tabs.Root>
  );
}
