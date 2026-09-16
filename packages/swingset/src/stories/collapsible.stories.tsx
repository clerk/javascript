import { Collapsible } from '@clerk/mosaic/primitives/collapsible';

import type { StoryMeta } from '@/lib/types';

// Headless primitives ship no styles. This single demo renders the primitive raw —
// unstyled — so it faithfully reflects what `@clerk/mosaic/primitives` provides: behavior, state,
// and ARIA wiring via the `data-*` attributes each part emits, with zero appearance.
// It is embedded once into the overview via `<Story>` in the MDX (the one thing prose
// can't convey: that it actually expands/collapses). There is no interactive knob canvas
// for headless primitives.

export const meta: StoryMeta = {
  group: 'Primitives',
  status: 'stable',
  title: 'Collapsible',
  source: 'packages/mosaic/src/primitives/collapsible/index.ts',
};

export function Default() {
  return (
    <Collapsible.Root>
      <Collapsible.Trigger>What is a headless component?</Collapsible.Trigger>
      <Collapsible.Panel>
        A headless component provides behavior, state management, and accessibility without imposing any styles — you
        bring your own classNames and target the <code>data-*</code> state attributes it emits.
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}
