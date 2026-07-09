import { Menu } from '@clerk/headless/menu';

import type { StoryMeta } from '@/lib/types';

// Headless primitives ship no styles. This single demo renders the primitive raw —
// unstyled — so it faithfully reflects what `@clerk/headless` provides: behavior, state,
// positioning, keyboard navigation, and ARIA wiring via the `data-cl-*` attributes each
// part emits, with zero appearance. It is embedded once into the overview via `<Story>`
// in the MDX (the one thing prose can't convey: that it opens and items are keyboard
// navigable). There is no interactive knob canvas for headless primitives.

export const meta: StoryMeta = {
  group: 'Primitives',
  title: 'Menu',
  source: 'packages/headless/src/primitives/menu/index.ts',
};

export function Default() {
  return (
    <Menu.Root>
      <Menu.Trigger>Actions</Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner>
          <Menu.Popup>
            <Menu.Item label='Edit'>Edit</Menu.Item>
            <Menu.Item label='Duplicate'>Duplicate</Menu.Item>
            <Menu.Separator />
            <Menu.Item label='Delete'>Delete</Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
