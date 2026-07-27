/** @jsxImportSource @emotion/react */
import type { ButtonProps } from '@clerk/ui/mosaic/components/button';
import { Button } from '@clerk/ui/mosaic/components/button';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './button.stories?raw';

// StyleX has no runtime recipe to derive knobs from, so the variant surface is described
// here to drive the playground + prop table. Keys mirror `ButtonProps`.
export const meta: StoryMeta = {
  group: 'Components',
  title: 'Button',
  source: 'packages/ui/src/mosaic/components/button/button.tsx',
  styles: {
    _variants: {
      intent: { primary: {}, destructive: {} },
      variant: { filled: {}, outline: {}, ghost: {} },
      size: { sm: {}, md: {} },
      shape: { default: {}, square: {}, circle: {} },
      fullWidth: { true: {}, false: {} },
    },
    _defaultVariants: {
      intent: 'primary',
      variant: 'filled',
      size: 'md',
      shape: 'default',
      fullWidth: false,
    },
  },
};

// Story functions accept Record<string,unknown> (knob values) and cast to ButtonProps.
// The cast is unavoidable: knobs are dynamically typed; Button has a strict prop interface.
function knobsAsProps(props: Record<string, unknown>) {
  return props as unknown as ButtonProps;
}

export function Primary(props: Record<string, unknown>) {
  return <Button {...knobsAsProps(props)}>Click me</Button>;
}

export function Sizes(props: Record<string, unknown>) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Button
        {...knobsAsProps(props)}
        size='sm'
      >
        Small
      </Button>
      <Button
        {...knobsAsProps(props)}
        size='md'
      >
        Medium
      </Button>
    </div>
  );
}

export function Shapes(props: Record<string, unknown>) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Button
        {...knobsAsProps(props)}
        shape='square'
        size='sm'
        aria-label='Add'
      >
        <svg
          width='14'
          height='14'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          style={{ flexShrink: 0 }}
        >
          <path d='M12 5v14M5 12h14' />
        </svg>
      </Button>
      <Button
        {...knobsAsProps(props)}
        shape='square'
        size='md'
        aria-label='Add'
      >
        <svg
          width='16'
          height='16'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          style={{ flexShrink: 0 }}
        >
          <path d='M12 5v14M5 12h14' />
        </svg>
      </Button>
      <Button
        {...knobsAsProps(props)}
        shape='circle'
        size='sm'
        aria-label='Add'
      >
        <svg
          width='14'
          height='14'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          style={{ flexShrink: 0 }}
        >
          <path d='M12 5v14M5 12h14' />
        </svg>
      </Button>
      <Button
        {...knobsAsProps(props)}
        shape='circle'
        size='md'
        aria-label='Add'
      >
        <svg
          width='16'
          height='16'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          style={{ flexShrink: 0 }}
        >
          <path d='M12 5v14M5 12h14' />
        </svg>
      </Button>
    </div>
  );
}

export function Disabled(props: Record<string, unknown>) {
  return (
    <Button
      {...knobsAsProps(props)}
      disabled
    >
      Disabled
    </Button>
  );
}
