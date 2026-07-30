/** @jsxImportSource @emotion/react */
import type { ButtonProps } from '@clerk/ui/mosaic/components/button';
import { Button } from '@clerk/ui/mosaic/components/button';
import { Icon } from '@clerk/ui/mosaic/components/icon';
import React from 'react';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './button.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Button',
  source: 'packages/ui/src/mosaic/components/button/button.tsx',
  styleEngine: 'stylex',
  styles: {
    _variants: {
      color: { primary: {}, neutral: {}, negative: {} },
      variant: { filled: {}, outline: {}, ghost: {}, link: {} },
      size: { sm: {}, md: {}, lg: {} },
      shape: { default: {}, square: {}, circle: {} },
      fullWidth: { true: {}, false: {} },
    },
    _defaultVariants: {
      color: 'primary',
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
      <Button
        {...knobsAsProps(props)}
        size='lg'
      >
        Large
      </Button>
    </div>
  );
}

export function Variants(props: Record<string, unknown>) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Button
        {...knobsAsProps(props)}
        variant='filled'
      >
        Filled
      </Button>
      <Button
        {...knobsAsProps(props)}
        variant='outline'
      >
        Outline
      </Button>
      <Button
        {...knobsAsProps(props)}
        variant='ghost'
      >
        Ghost
      </Button>
      <Button
        {...knobsAsProps(props)}
        variant='link'
      >
        Link
      </Button>
    </div>
  );
}

// The full variant × color matrix, laid out like the design spec: variants down,
// colors across. Every cell is the same two props, so the axes stay legible side
// by side — and hover/focus are live, since those states are what the matrix is for.
export function Colors(props: Record<string, unknown>) {
  const label = { fontSize: 12, color: '#71717a', alignSelf: 'center' } as const;
  return (
    <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'max-content repeat(3, max-content)' }}>
      <span />
      {(['primary', 'neutral', 'negative'] as const).map(color => (
        <span
          key={color}
          style={label}
        >
          {color}
        </span>
      ))}
      {(['filled', 'outline', 'ghost', 'link'] as const).map(variant => (
        <React.Fragment key={variant}>
          <span style={label}>{variant}</span>
          {(['primary', 'neutral', 'negative'] as const).map(color => (
            <Button
              key={`${variant}-${color}`}
              {...knobsAsProps(props)}
              color={color}
              variant={variant}
            >
              Button
            </Button>
          ))}
        </React.Fragment>
      ))}
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

// `check` and `chevron-down`, not the horizontal chevrons: those draw about half the ink in the
// same box, so they read as a padding bug until the glyph set is optically normalized.
export function Icons(props: Record<string, unknown>) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Button {...knobsAsProps(props)}>
        <Icon
          name='check'
          placement='inline-start'
        />
        Approve
      </Button>
      <Button {...knobsAsProps(props)}>
        Options
        <Icon
          name='chevron-down'
          placement='inline-end'
        />
      </Button>
      <Button {...knobsAsProps(props)}>
        <Icon
          name='check'
          placement='inline-start'
        />
        Both sides
        <Icon
          name='chevron-down'
          placement='inline-end'
        />
      </Button>
    </div>
  );
}

// The same three shapes at every size, so the tightened edge can be read against the
// untightened one — each row's middle button is the size's plain text padding.
export function IconSizes(props: Record<string, unknown>) {
  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
      {(['sm', 'md', 'lg'] as const).map(size => (
        <div
          key={size}
          style={{ display: 'flex', gap: 8, alignItems: 'center' }}
        >
          <Button
            {...knobsAsProps(props)}
            size={size}
          >
            <Icon
              name='check'
              placement='inline-start'
              size={size}
            />
            Approve
          </Button>
          <Button
            {...knobsAsProps(props)}
            size={size}
          >
            No icon
          </Button>
          <Button
            {...knobsAsProps(props)}
            size={size}
          >
            Options
            <Icon
              name='chevron-down'
              placement='inline-end'
              size={size}
            />
          </Button>
        </div>
      ))}
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
