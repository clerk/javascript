import { Tooltip } from '@clerk/headless/tooltip';

import type { StoryMeta } from '@/lib/types';

// Headless primitives ship no styles. This single demo renders the primitive raw —
// unstyled — so it faithfully reflects what `@clerk/headless` provides: behavior, state,
// positioning, and ARIA wiring via the `data-cl-*` attributes each part emits, with zero
// appearance. It is embedded once into the overview via `<Story>` in the MDX (the one
// thing prose can't convey: that it shows on hover/focus after a delay). There is no
// interactive knob canvas for headless primitives.

export const meta: StoryMeta = {
  group: 'Primitives',
  title: 'Tooltip',
  source: 'packages/headless/src/primitives/tooltip/index.ts',
};

export function Default() {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger>Hover or focus me</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner>
          <Tooltip.Popup>An unstyled tooltip.</Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
