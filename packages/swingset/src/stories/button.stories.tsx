/** @jsxImportSource @emotion/react */
import type { ButtonProps } from '@clerk/ui/mosaic/components/button';
import { Button, buttonRecipe } from '@clerk/ui/mosaic/components/button';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Button',
  source: 'packages/ui/src/mosaic/components/button.tsx',
  styles: buttonRecipe,
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
