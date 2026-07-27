import type { BadgeProps } from '@clerk/ui/mosaic/components/badge';
import { Badge } from '@clerk/ui/mosaic/components/badge';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './badge.stories?raw';

// StyleX has no runtime recipe to derive knobs from, so the variant surface is described
// here to drive the playground + prop table. Keys mirror `BadgeProps`.
export const meta: StoryMeta = {
  group: 'Components',
  title: 'Badge',
  source: 'packages/ui/src/mosaic/components/badge/badge.tsx',
  styles: {
    _variants: {
      color: { primary: {}, neutral: {}, warning: {}, negative: {}, positive: {} },
    },
    _defaultVariants: {
      color: 'primary',
    },
  },
};

// Story functions accept Record<string,unknown> (knob values) and cast to BadgeProps.
// The cast is unavoidable: knobs are dynamically typed; Badge has a strict prop interface.
function knobsAsProps(props: Record<string, unknown>) {
  return props as unknown as BadgeProps;
}

export function Primary(props: Record<string, unknown>) {
  return <Badge {...knobsAsProps(props)}>Badge Label</Badge>;
}

export function Colors(props: Record<string, unknown>) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <Badge
        {...knobsAsProps(props)}
        color='primary'
      >
        Primary
      </Badge>
      <Badge
        {...knobsAsProps(props)}
        color='neutral'
      >
        Neutral
      </Badge>
      <Badge
        {...knobsAsProps(props)}
        color='warning'
      >
        Warning
      </Badge>
      <Badge
        {...knobsAsProps(props)}
        color='negative'
      >
        Negative
      </Badge>
      <Badge
        {...knobsAsProps(props)}
        color='positive'
      >
        Positive
      </Badge>
    </div>
  );
}

export function WithIcon(props: Record<string, unknown>) {
  return (
    <Badge
      {...knobsAsProps(props)}
      color='positive'
    >
      <svg
        width='10'
        height='10'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='3'
        strokeLinecap='round'
        strokeLinejoin='round'
        style={{ flexShrink: 0 }}
      >
        <path d='M20 6 9 17l-5-5' />
      </svg>
      Verified
    </Badge>
  );
}
