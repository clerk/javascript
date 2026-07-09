import { Collapsible } from '@clerk/headless/collapsible';

import type { StoryMeta } from '@/lib/types';

// Headless primitives ship no styles. This single demo renders the primitive raw —
// unstyled — so it faithfully reflects what `@clerk/headless` provides: behavior, state,
// and ARIA wiring via the `data-cl-*` attributes each part emits, with zero appearance.
// It is embedded once into the overview via `<Story>` in the MDX (the one thing prose
// can't convey: that it actually expands/collapses). There is no interactive knob canvas
// for headless primitives.

export const meta: StoryMeta = {
  group: 'Primitives',
  title: 'Collapsible',
  source: 'packages/headless/src/primitives/collapsible/index.ts',
};

export function Default() {
  return (
    <Collapsible.Root>
      <Collapsible.Trigger>What is a headless component?</Collapsible.Trigger>
      <Collapsible.Panel>
        A headless component provides behavior, state management, and accessibility without imposing any styles — you
        bring your own CSS via the <code>data-cl-slot</code> attributes it emits.
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}
