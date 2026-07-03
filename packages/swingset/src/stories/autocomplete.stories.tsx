'use client';

import { Autocomplete } from '@clerk/headless/autocomplete';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

// Headless primitives ship no styles. This single demo renders the primitive raw —
// unstyled — so it faithfully reflects what `@clerk/headless` provides: behavior, state,
// positioning, keyboard navigation, and ARIA wiring via the `data-cl-*` attributes each
// part emits, with zero appearance. It is embedded once into the overview via `<Story>`
// in the MDX (the one thing prose can't convey: that typing filters the list the consumer
// supplies). There is no interactive knob canvas for headless primitives.
//
// Autocomplete owns no filtering of its own — the consumer reads `inputValue` and renders
// the surviving options. This demo is `'use client'` because that filtering uses `useState`.

const FRUITS = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig'];

export const meta: StoryMeta = {
  group: 'Primitives',
  title: 'Autocomplete',
  source: 'packages/headless/src/primitives/autocomplete/index.ts',
};

export function Default() {
  const [inputValue, setInputValue] = useState('');
  const filtered = FRUITS.filter(fruit => fruit.toLowerCase().includes(inputValue.toLowerCase()));

  return (
    <Autocomplete.Root
      inputValue={inputValue}
      onInputValueChange={setInputValue}
    >
      <Autocomplete.Input placeholder='Search fruits…' />
      <Autocomplete.Portal>
        <Autocomplete.Positioner>
          <Autocomplete.Popup>
            <Autocomplete.List>
              {filtered.map(fruit => (
                <Autocomplete.Option
                  key={fruit}
                  value={fruit}
                  label={fruit}
                >
                  {fruit}
                </Autocomplete.Option>
              ))}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
}
