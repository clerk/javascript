'use client';

import { Combobox } from '@clerk/mosaic/components/combobox';
import { Field } from '@clerk/mosaic/components/field';
import { InputGroup } from '@clerk/mosaic/components/input-group';
import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';

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
    <Combobox.Root>
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

export function Multiple() {
  const options = ['Apple', 'Apricot', 'Banana', 'Blackberry', 'Cherry', 'Fig', 'Grape', 'Pear', 'Plum'];
  const labelOf = (value: string) => options.find(option => option.toLowerCase() === value) ?? value;

  return (
    <Combobox.Root
      multiple
      defaultValue={['banana', 'fig']}
    >
      <Field.Root xstyle={styles.fieldWidth}>
        <Field.Label>Fruits</Field.Label>
        <Combobox.Chips>
          <Combobox.Value>
            {values =>
              values.map(value => (
                <Combobox.Chip
                  key={value}
                  value={value}
                  removeLabel={`Remove ${labelOf(value)}`}
                >
                  {labelOf(value)}
                </Combobox.Chip>
              ))
            }
          </Combobox.Value>
          <Combobox.Input placeholder='Search fruit…' />
        </Combobox.Chips>
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

export function MultipleCount() {
  const options = ['Apple', 'Apricot', 'Banana', 'Blackberry', 'Cherry', 'Fig', 'Grape', 'Pear', 'Plum'];

  return (
    <Combobox.Root
      multiple
      defaultValue={['apple', 'cherry']}
    >
      <Field.Root xstyle={styles.fieldWidth}>
        <Field.Label>Fruits</Field.Label>
        <InputGroup.Root>
          <Combobox.Input placeholder='Search fruit…' />
          <InputGroup.End>
            <Combobox.Value>{value => (value.length > 0 ? `${value.length} selected` : null)}</Combobox.Value>
            <Combobox.Clear aria-label='Clear fruits' />
            <Combobox.Trigger aria-label='Toggle fruit options' />
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

export function AlwaysOpen() {
  const projects = [
    'storybook',
    'clerk',
    'internal-compliance-portal',
    'clark-agent',
    'swingset',
    'clerk-js-sandbox',
    'roadmap-admin',
    'roadmap-portal',
  ];
  const [value, setValue] = useState<string[]>([]);

  return (
    <Combobox.Root
      multiple
      inline
      open
      value={value}
      onValueChange={setValue}
    >
      <Field.Root xstyle={styles.fieldWidth}>
        <Field.Label>Projects</Field.Label>
        <Combobox.Chips>
          <Combobox.Value>
            {values =>
              values.map(project => (
                <Combobox.Chip
                  key={project}
                  value={project}
                  removeLabel={`Remove ${project}`}
                >
                  {project}
                </Combobox.Chip>
              ))
            }
          </Combobox.Value>
          <Combobox.Input placeholder='Search projects' />
        </Combobox.Chips>
        <Combobox.List aria-label='Projects'>
          <Combobox.Collection
            items={projects.filter(project => !value.includes(project))}
            itemToStringLabel={project => project}
            empty={<Combobox.Empty>No projects found</Combobox.Empty>}
          >
            {project => (
              <Combobox.Option
                key={project}
                value={project}
                label={project}
              >
                {project}
              </Combobox.Option>
            )}
          </Combobox.Collection>
        </Combobox.List>
      </Field.Root>
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
            <Combobox.Clear aria-label='Clear fruit' />
            <Combobox.Trigger aria-label='Toggle fruit options' />
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
