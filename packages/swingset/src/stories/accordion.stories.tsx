import { Accordion } from '@clerk/headless/accordion';

import type { StoryMeta } from '@/lib/types';

// Headless primitives ship no styles. This single demo renders the primitive raw —
// unstyled — so it faithfully reflects what `@clerk/headless` provides: behavior, state,
// and ARIA wiring via the `data-cl-*` attributes each part emits, with zero appearance.
// It is embedded once into the overview via `<Story>` in the MDX (the one thing prose
// can't convey: that items actually expand/collapse). There is no interactive knob canvas
// for headless primitives.

export const meta: StoryMeta = {
  group: 'Primitives',
  title: 'Accordion',
  source: 'packages/headless/src/primitives/accordion/index.ts',
};

export function Default() {
  return (
    <Accordion.Root
      type='single'
      defaultValue={['what']}
    >
      <Accordion.Item value='what'>
        <Accordion.Header>
          <Accordion.Trigger>What is a headless component?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>
          A headless component provides behavior, state management, and accessibility without imposing any styles — you
          bring your own CSS via the <code>data-cl-slot</code> attributes it emits.
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value='why'>
        <Accordion.Header>
          <Accordion.Trigger>Why an accordion over a collapsible?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>
          An accordion coordinates a set of items: in <code>single</code> mode opening one closes the others, and arrow
          keys move focus between triggers.
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  );
}
