import { Drawer } from '@clerk/mosaic/primitives/drawer';

import type { StoryMeta } from '@/lib/types';

// Headless primitives ship no styles. This single demo renders the primitive raw —
// unstyled — so it faithfully reflects what `@clerk/mosaic/primitives` provides: behavior, state,
// the drag-to-dismiss gesture, and ARIA wiring via the `data-*` attributes each part
// emits, with zero appearance. It is embedded once into the overview via `<Story>` in the
// MDX (the one thing prose can't convey: that it opens, traps focus, and dismisses on drag
// / Escape / outside press). There is no interactive knob canvas for headless primitives.

export const meta: StoryMeta = {
  group: 'Primitives',
  status: 'stable',
  title: 'Drawer',
  source: 'packages/mosaic/src/primitives/drawer/index.ts',
};

export function Default() {
  return (
    <Drawer.Root>
      <Drawer.Trigger>Open drawer</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop />
        <Drawer.Viewport>
          <Drawer.Popup>
            <Drawer.Handle />
            <Drawer.Title>Sheet title</Drawer.Title>
            <Drawer.Description>
              This is an unstyled bottom sheet. Drag it down, press Escape, or click outside to dismiss.
            </Drawer.Description>
            <Drawer.Close>Close</Drawer.Close>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
