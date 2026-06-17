/** @jsxImportSource @emotion/react */
import type { TextProps } from '@clerk/ui/mosaic/components/text';
import { Text, textRecipe } from '@clerk/ui/mosaic/components/text';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Text',
  source: 'packages/ui/src/mosaic/components/text.tsx',
  styles: textRecipe,
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

export function Intents(props: Record<string, unknown>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Text
        {...knobsAsProps(props)}
        intent='primary'
      >
        Primary text
      </Text>
      <Text
        {...knobsAsProps(props)}
        intent='mutedForeground'
      >
        Muted foreground text
      </Text>
      <Text
        {...knobsAsProps(props)}
        intent='destructive'
      >
        Destructive text
      </Text>
    </div>
  );
}
