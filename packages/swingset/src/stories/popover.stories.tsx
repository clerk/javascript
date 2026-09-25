import { Popover } from '@clerk/mosaic/primitives/popover';

import type { StoryMeta } from '@/lib/types';

// Headless primitives ship no styles. This single demo renders the primitive raw —
// unstyled — so it faithfully reflects what the primitive provides: behavior, state,
// positioning, and ARIA wiring via the `data-*` attributes each part emits, with zero
// appearance. It is embedded once into the overview via `<Story>` in the MDX (the one
// thing prose can't convey: that it anchors to the trigger and dismisses). There is no
// interactive knob canvas for headless primitives.

export const meta: StoryMeta = {
  group: 'Primitives',
  status: 'stable',
  title: 'Popover',
  source: 'packages/mosaic/src/primitives/popover/index.ts',
};

export function Default() {
  return (
    <Popover.Root>
      <Popover.Trigger>Open popover</Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner>
          <Popover.Popup>
            <Popover.Title>Preferences</Popover.Title>
            <Popover.Description>An unstyled popover anchored to its trigger.</Popover.Description>
            <Popover.Close>Done</Popover.Close>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
