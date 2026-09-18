import type { CheckboxProps } from '@clerk/mosaic/components/checkbox';
import { Checkbox } from '@clerk/mosaic/components/checkbox';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './checkbox.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'wip',
  title: 'Checkbox',
  source: 'packages/mosaic/src/components/checkbox/checkbox.tsx',
  styles: {
    _variants: {
      size: { sm: {}, md: {} },
      indeterminate: { true: {}, false: {} },
      disabled: { true: {}, false: {} },
    },
    _defaultVariants: {
      size: 'md',
      indeterminate: 'false',
      disabled: 'false',
    },
  },
};

function knobsAsProps(props: Record<string, unknown>) {
  const { indeterminate, disabled, ...rest } = props;
  return {
    ...rest,
    indeterminate: indeterminate === true || indeterminate === 'true',
    disabled: disabled === true || disabled === 'true',
  } as unknown as CheckboxProps;
}

export function Default(props: Record<string, unknown>) {
  return (
    <Checkbox
      aria-label='Select row'
      {...knobsAsProps(props)}
    />
  );
}

export function States() {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      <Checkbox aria-label='Unchecked' />
      <Checkbox
        aria-label='Checked'
        defaultChecked
      />
      <Checkbox
        aria-label='Indeterminate'
        indeterminate
      />
      <Checkbox
        aria-label='Disabled'
        disabled
      />
      <Checkbox
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
      <Checkbox
        aria-label='Small'
        size='sm'
        defaultChecked
      />
      <Checkbox
        aria-label='Medium'
        size='md'
        defaultChecked
      />
    </div>
  );
}
