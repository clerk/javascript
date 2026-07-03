import { Select } from '@clerk/headless/select';

import type { StoryMeta } from '@/lib/types';

// Headless primitives ship no styles. This single demo renders the primitive raw —
// unstyled — so it faithfully reflects what `@clerk/headless` provides: behavior, state,
// positioning, keyboard navigation, and ARIA wiring via the `data-cl-*` attributes each
// part emits, with zero appearance. It is embedded once into the overview via `<Story>`
// in the MDX (the one thing prose can't convey: that it opens and selecting updates the
// value). There is no interactive knob canvas for headless primitives.

export const meta: StoryMeta = {
  group: 'Primitives',
  title: 'Select',
  source: 'packages/headless/src/primitives/select/index.ts',
};

export function Default() {
  return (
    <Select.Root>
      <Select.Trigger>
        <Select.Value placeholder='Choose a fruit…' />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Popup>
            <Select.Option
              value='apple'
              label='Apple'
            >
              Apple
            </Select.Option>
            <Select.Option
              value='banana'
              label='Banana'
            >
              Banana
            </Select.Option>
            <Select.Option
              value='cherry'
              label='Cherry'
            >
              Cherry
            </Select.Option>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
