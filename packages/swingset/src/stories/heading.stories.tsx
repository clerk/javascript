/** @jsxImportSource @emotion/react */
import type { HeadingProps } from '@clerk/ui/mosaic/components/heading';
import { Heading } from '@clerk/ui/mosaic/components/heading';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './heading.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Heading',
  source: 'packages/ui/src/mosaic/components/heading/heading.tsx',
  styleEngine: 'stylex',
  styles: {
    _variants: {
      size: { xs: {}, sm: {}, base: {}, lg: {}, xl: {}, '2xl': {} },
      color: { primary: {}, neutral: {}, warning: {}, negative: {}, positive: {} },
    },
    _defaultVariants: {
      size: 'base',
      color: 'primary',
    },
  },
};

// Story functions accept Record<string,unknown> (knob values) and cast to HeadingProps.
// The cast is unavoidable: knobs are dynamically typed; Heading has a strict prop interface.
function knobsAsProps(props: Record<string, unknown>) {
  return props as unknown as HeadingProps;
}

export function Default(props: Record<string, unknown>) {
  return <Heading {...knobsAsProps(props)}>This is a heading</Heading>;
}

export function Sizes(props: Record<string, unknown>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Heading
        {...knobsAsProps(props)}
        size='xs'
      >
        Extra small heading
      </Heading>
      <Heading
        {...knobsAsProps(props)}
        size='sm'
      >
        Small heading
      </Heading>
      <Heading
        {...knobsAsProps(props)}
        size='base'
      >
        Base heading
      </Heading>
      <Heading
        {...knobsAsProps(props)}
        size='lg'
      >
        Large heading
      </Heading>
      <Heading
        {...knobsAsProps(props)}
        size='xl'
      >
        Extra large heading
      </Heading>
      <Heading
        {...knobsAsProps(props)}
        size='2xl'
      >
        2XL heading
      </Heading>
    </div>
  );
}

export function Colors(props: Record<string, unknown>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Heading
        {...knobsAsProps(props)}
        color='primary'
      >
        Primary heading
      </Heading>
      <Heading
        {...knobsAsProps(props)}
        color='neutral'
      >
        Neutral heading
      </Heading>
      <Heading
        {...knobsAsProps(props)}
        color='warning'
      >
        Warning heading
      </Heading>
      <Heading
        {...knobsAsProps(props)}
        color='negative'
      >
        Negative heading
      </Heading>
      <Heading
        {...knobsAsProps(props)}
        color='positive'
      >
        Positive heading
      </Heading>
    </div>
  );
}
