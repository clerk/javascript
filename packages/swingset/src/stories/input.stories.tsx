import type { InputProps } from '@clerk/ui/mosaic/components/input';
import { Input } from '@clerk/ui/mosaic/components/input';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './input.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Input',
  source: 'packages/ui/src/mosaic/components/input/input.tsx',
  styles: {
    _variants: {
      size: { sm: {}, md: {}, lg: {} },
      variant: { default: {}, headless: {} },
    },
    _defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  },
};

function knobsAsProps(props: Record<string, unknown>) {
  return props as unknown as InputProps;
}

export function Default(props: Record<string, unknown>) {
  return (
    <Input
      {...knobsAsProps(props)}
      placeholder='Enter text…'
    />
  );
}

export function Sizes(props: Record<string, unknown>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 320 }}>
      <Input
        {...knobsAsProps(props)}
        size='sm'
        placeholder='Small'
      />
      <Input
        {...knobsAsProps(props)}
        size='md'
        placeholder='Medium'
      />
      <Input
        {...knobsAsProps(props)}
        size='lg'
        placeholder='Large'
      />
    </div>
  );
}

export function Disabled(props: Record<string, unknown>) {
  return (
    <Input
      {...knobsAsProps(props)}
      disabled
      placeholder='Disabled'
    />
  );
}

export function Invalid(props: Record<string, unknown>) {
  return (
    <Input
      {...knobsAsProps(props)}
      aria-invalid='true'
      placeholder='Invalid'
    />
  );
}

export function Headless(props: Record<string, unknown>) {
  return (
    <div style={{ border: '1px solid currentColor', borderRadius: 8 }}>
      <Input
        {...knobsAsProps(props)}
        variant='headless'
        placeholder='Parent provides the field chrome'
      />
    </div>
  );
}
