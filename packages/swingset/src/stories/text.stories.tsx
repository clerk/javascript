import type { TextProps } from '@clerk/ui/mosaic/components/text';
import { Text } from '@clerk/ui/mosaic/components/text';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './text.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Text',
  source: 'packages/ui/src/mosaic/components/text/text.tsx',
  styles: {
    _variants: {
      size: { xs: {}, sm: {}, base: {}, lg: {}, xl: {}, '2xl': {} },
      color: { primary: {}, neutral: {}, warning: {}, negative: {}, positive: {} },
    },
    _defaultVariants: {
      size: 'sm',
      color: 'primary',
    },
  },
};

// Story functions accept Record<string,unknown> (knob values) and cast to TextProps.
// The cast is unavoidable: knobs are dynamically typed; Text has a strict prop interface.
function knobsAsProps(props: Record<string, unknown>) {
  return props as unknown as TextProps;
}

export function Default(props: Record<string, unknown>) {
  return <Text {...knobsAsProps(props)}>This is a text block.</Text>;
}

export function Sizes(props: Record<string, unknown>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Text
        {...knobsAsProps(props)}
        size='xs'
      >
        Extra small text
      </Text>
      <Text
        {...knobsAsProps(props)}
        size='sm'
      >
        Small text
      </Text>
      <Text
        {...knobsAsProps(props)}
        size='base'
      >
        Base text
      </Text>
      <Text
        {...knobsAsProps(props)}
        size='lg'
      >
        Large text
      </Text>
      <Text
        {...knobsAsProps(props)}
        size='xl'
      >
        Extra large text
      </Text>
      <Text
        {...knobsAsProps(props)}
        size='2xl'
      >
        2XL text
      </Text>
    </div>
  );
}

export function Colors(props: Record<string, unknown>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Text
        {...knobsAsProps(props)}
        color='primary'
      >
        Primary text
      </Text>
      <Text
        {...knobsAsProps(props)}
        color='neutral'
      >
        Neutral text
      </Text>
      <Text
        {...knobsAsProps(props)}
        color='warning'
      >
        Warning text
      </Text>
      <Text
        {...knobsAsProps(props)}
        color='negative'
      >
        Negative text
      </Text>
      <Text
        {...knobsAsProps(props)}
        color='positive'
      >
        Positive text
      </Text>
    </div>
  );
}
