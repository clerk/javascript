'use client';

import { Combobox } from '@clerk/headless/combobox';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Primitives',
  status: 'wip',
  title: 'Combobox',
  source: 'packages/headless/src/primitives/combobox/index.ts',
};

const FRUITS = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig'];

export function Default() {
  return (
    <Combobox.Root>
      <Combobox.Input
        aria-label='Fruit'
        placeholder='Choose a fruit…'
      />
      <Combobox.Trigger aria-label='Toggle fruit options'>⌄</Combobox.Trigger>
      <Combobox.Portal>
        <Combobox.Positioner>
          <Combobox.Popup>
            <Combobox.Collection
              items={FRUITS}
              itemToStringLabel={fruit => fruit}
              empty='No fruit found'
            >
              {fruit => (
                <Combobox.Option
                  key={fruit}
                  value={fruit}
                >
                  {fruit}
                  <Combobox.OptionIndicator>✓</Combobox.OptionIndicator>
                </Combobox.Option>
              )}
            </Combobox.Collection>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
