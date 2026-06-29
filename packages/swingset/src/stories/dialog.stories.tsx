import { Dialog } from '@clerk/headless/dialog';

import type { StoryMeta } from '@/lib/types';

// Headless primitives ship no styles. This single demo renders the primitive raw —
// unstyled — so it faithfully reflects what `@clerk/headless` provides: behavior, state,
// and ARIA wiring via the `data-cl-*` attributes each part emits, with zero appearance.
// It is embedded once into the overview via `<Story>` in the MDX (the one thing prose
// can't convey: that it opens, traps focus, and dismisses). There is no interactive knob
// canvas for headless primitives.

export const meta: StoryMeta = {
  group: 'Primitives',
  title: 'Dialog',
  source: 'packages/headless/src/primitives/dialog/index.ts',
};

export function Default() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Open dialog</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop>
          <Dialog.Popup>
            <Dialog.Title>Confirm action</Dialog.Title>
            <Dialog.Description>
              This is an unstyled dialog. Press Escape or click outside to dismiss.
            </Dialog.Description>
            <Dialog.Close>Cancel</Dialog.Close>
          </Dialog.Popup>
        </Dialog.Backdrop>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
