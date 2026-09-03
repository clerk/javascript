'use client';

import { Combobox } from '@clerk/ui/mosaic/components/combobox';
import { Field } from '@clerk/ui/mosaic/components/field';
import { Icon } from '@clerk/ui/mosaic/components/icon';
import { InputGroup } from '@clerk/ui/mosaic/components/input-group';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './combobox.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Combobox',
  source: 'packages/ui/src/mosaic/components/combobox/combobox.tsx',
};

const fruits = ['Apple', 'Apricot', 'Banana', 'Blackberry', 'Cherry', 'Fig', 'Grape', 'Pear', 'Plum'];

function FruitCombobox({ options = fruits }: { options?: string[] }) {
  const [query, setQuery] = useState('');
  const filtered = options.filter(option => option.toLowerCase().includes(query.toLowerCase()));

  return (
    <Combobox.Root
      inputValue={query}
      onInputValueChange={setQuery}
    >
      <Field.Root style={{ width: 320 }}>
        <Field.Label>Fruit</Field.Label>
        <InputGroup.Root>
          <Combobox.Input
            variant='headless'
            placeholder='Search fruit…'
          />
          <Combobox.Trigger
            aria-label='Toggle fruit options'
            render={
              <InputGroup.Action
                size='xs'
                shape='square'
              />
            }
          >
            <Icon
              name='chevron-down'
              size='sm'
              aria-hidden='true'
            />
          </Combobox.Trigger>
        </InputGroup.Root>
      </Field.Root>
      <Combobox.Popup>
        {filtered.length > 0 ? (
          filtered.map(option => (
            <Combobox.Option
              key={option}
              value={option.toLowerCase()}
              label={option}
            >
              {option}
            </Combobox.Option>
          ))
        ) : (
          <Combobox.Empty>No fruit found</Combobox.Empty>
        )}
      </Combobox.Popup>
    </Combobox.Root>
  );
}

export function Default() {
  return <FruitCombobox />;
}

const manyFruits = Array.from({ length: 40 }, (_, index) => `Fruit ${index + 1}`);

export function Scrolling() {
  return <FruitCombobox options={manyFruits} />;
}
