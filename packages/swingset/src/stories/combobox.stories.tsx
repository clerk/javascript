'use client';

import { Combobox } from '@clerk/mosaic/components/combobox';
import { Field } from '@clerk/mosaic/components/field';
import { InputGroup } from '@clerk/mosaic/components/input-group';
import * as stylex from '@stylexjs/stylex';

import type { StoryMeta } from '@/lib/types';

const styles = stylex.create({
  fieldWidth: { width: 320 },
});

export { default as __source } from './combobox.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'stable',
  title: 'Combobox',
  source: 'packages/mosaic/src/components/combobox/combobox.tsx',
};

export function Default() {
  const options = ['Apple', 'Apricot', 'Banana', 'Blackberry', 'Cherry', 'Fig', 'Grape', 'Pear', 'Plum'];

  return (
    <Combobox.Root
      items={options}
      itemToStringLabel={option => option}
    >
      <Field.Root xstyle={styles.fieldWidth}>
        <Field.Label>Fruit</Field.Label>
        <InputGroup.Root>
          <Combobox.Input placeholder='Search fruit…' />
          <InputGroup.End>
            <Combobox.Clear aria-label='Clear fruit' />
            <Combobox.Trigger aria-label='Toggle fruit options' />
          </InputGroup.End>
        </InputGroup.Root>
      </Field.Root>
      <Combobox.Popup>
        <Combobox.Empty>No fruit found</Combobox.Empty>
        <Combobox.Collection>
          {(option: string) => (
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
    <Combobox.Root
      items={options}
      itemToStringLabel={option => option}
    >
      <Field.Root xstyle={styles.fieldWidth}>
        <Field.Label>Fruit</Field.Label>
        <InputGroup.Root>
          <Combobox.Input placeholder='Search fruit…' />
          <InputGroup.End>
            <Combobox.Clear aria-label='Clear fruit' />
            <Combobox.Trigger aria-label='Toggle fruit options' />
          </InputGroup.End>
        </InputGroup.Root>
      </Field.Root>
      <Combobox.Popup>
        <Combobox.Empty>No fruit found</Combobox.Empty>
        <Combobox.Collection>
          {(option: string) => (
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

export function OptionParts() {
  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CHF', name: 'Swiss Franc with a long name that truncates', symbol: '₣' },
  ];

  return (
    <Combobox.Root
      items={currencies}
      itemToStringLabel={currency => currency.name}
    >
      <Field.Root xstyle={styles.fieldWidth}>
        <Field.Label>Currency</Field.Label>
        <InputGroup.Root>
          <Combobox.Input placeholder='Search currencies…' />
          <InputGroup.End>
            <Combobox.Trigger aria-label='Toggle currency options' />
          </InputGroup.End>
        </InputGroup.Root>
      </Field.Root>
      <Combobox.Popup>
        <Combobox.Empty>No currency found</Combobox.Empty>
        <Combobox.Collection>
          {(currency: (typeof currencies)[number]) => (
            <Combobox.Option
              key={currency.code}
              value={currency.code}
              label={currency.name}
            >
              <Combobox.Media aria-hidden='true'>{currency.symbol}</Combobox.Media>
              <Combobox.Label>{currency.name}</Combobox.Label>
              <Combobox.Detail>{currency.code}</Combobox.Detail>
              <Combobox.OptionIndicator />
            </Combobox.Option>
          )}
        </Combobox.Collection>
      </Combobox.Popup>
    </Combobox.Root>
  );
}
