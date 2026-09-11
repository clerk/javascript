'use client';

import { Button } from '@clerk/ui/mosaic/components/button';
import { Combobox } from '@clerk/ui/mosaic/components/combobox';
import { Field } from '@clerk/ui/mosaic/components/field';
import { Icon } from '@clerk/ui/mosaic/components/icon';
import { InputGroup } from '@clerk/ui/mosaic/components/input-group';
import * as stylex from '@stylexjs/stylex';

import type { StoryMeta } from '@/lib/types';

const styles = stylex.create({
  fieldWidth: { width: 320 },
});

export { default as __source } from './combobox.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'wip',
  title: 'Combobox',
  source: 'packages/ui/src/mosaic/components/combobox/combobox.tsx',
};

export function Default() {
  const options = ['Apple', 'Apricot', 'Banana', 'Blackberry', 'Cherry', 'Fig', 'Grape', 'Pear', 'Plum'];

  return (
    <Combobox.Root>
      <Field.Root xstyle={styles.fieldWidth}>
        <Field.Label>Fruit</Field.Label>
        <InputGroup.Root>
          <Combobox.Input placeholder='Search fruit…' />
          <InputGroup.End>
            <Combobox.Trigger
              aria-label='Toggle fruit options'
              render={<Button />}
            >
              <Icon
                name='chevron-down'
                size='sm'
                aria-hidden='true'
              />
            </Combobox.Trigger>
          </InputGroup.End>
        </InputGroup.Root>
      </Field.Root>
      <Combobox.Popup>
        <Combobox.Collection
          items={options}
          itemToStringLabel={option => option}
          empty={<Combobox.Empty>No fruit found</Combobox.Empty>}
        >
          {option => (
            <Combobox.Option
              key={option}
              value={option.toLowerCase()}
              label={option}
            >
              {option}
              <Combobox.OptionIndicator />
            </Combobox.Option>
          )}
        </Combobox.Collection>
      </Combobox.Popup>
    </Combobox.Root>
  );
}

export function Scrolling() {
  const options = Array.from({ length: 40 }, (_, index) => `Fruit ${index + 1}`);

  return (
    <Combobox.Root>
      <Field.Root xstyle={styles.fieldWidth}>
        <Field.Label>Fruit</Field.Label>
        <InputGroup.Root>
          <Combobox.Input placeholder='Search fruit…' />
          <InputGroup.End>
            <Combobox.Trigger
              aria-label='Toggle fruit options'
              render={<Button />}
            >
              <Icon
                name='chevron-down'
                size='sm'
                aria-hidden='true'
              />
            </Combobox.Trigger>
          </InputGroup.End>
        </InputGroup.Root>
      </Field.Root>
      <Combobox.Popup>
        <Combobox.Collection
          items={options}
          itemToStringLabel={option => option}
          empty={<Combobox.Empty>No fruit found</Combobox.Empty>}
        >
          {option => (
            <Combobox.Option
              key={option}
              value={option.toLowerCase()}
              label={option}
            >
              {option}
              <Combobox.OptionIndicator />
            </Combobox.Option>
          )}
        </Combobox.Collection>
      </Combobox.Popup>
    </Combobox.Root>
  );
}
