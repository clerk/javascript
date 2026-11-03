import { Field } from '@clerk/mosaic/components/field';
import { Radio } from '@clerk/mosaic/components/radio';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './radio.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'stable',
  title: 'Radio',
  source: 'packages/mosaic/src/components/radio/radio.tsx',
};

export function Default() {
  return (
    <Radio.Group
      aria-label='Plan'
      defaultValue='monthly'
    >
      <Field.Root orientation='horizontal'>
        <Radio.Item value='monthly' />
        <Field.Label>Monthly</Field.Label>
      </Field.Root>
      <Field.Root orientation='horizontal'>
        <Radio.Item value='yearly' />
        <Field.Label>Yearly</Field.Label>
      </Field.Root>
    </Radio.Group>
  );
}

export function Descriptions() {
  return (
    <Radio.Group
      aria-label='Repository access'
      defaultValue='all'
    >
      <Field.Root orientation='horizontal'>
        <Radio.Item value='all' />
        <Field.Content>
          <Field.Label>All repositories</Field.Label>
          <Field.Description>Applies to every current and future repository.</Field.Description>
        </Field.Content>
      </Field.Root>
      <Field.Root orientation='horizontal'>
        <Radio.Item value='selected' />
        <Field.Content>
          <Field.Label>Only select repositories</Field.Label>
          <Field.Description>Select at least one repository.</Field.Description>
        </Field.Content>
      </Field.Root>
    </Radio.Group>
  );
}

export function States() {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      <Radio.Item aria-label='Unchecked' />
      <Radio.Item
        aria-label='Checked'
        defaultChecked
      />
      <Radio.Item
        aria-label='Disabled'
        disabled
      />
      <Radio.Item
        aria-label='Disabled checked'
        disabled
        defaultChecked
      />
    </div>
  );
}

export function Sizes() {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Radio.Item
        aria-label='Small'
        size='sm'
        defaultChecked
      />
      <Radio.Item
        aria-label='Medium'
        size='md'
        defaultChecked
      />
    </div>
  );
}
