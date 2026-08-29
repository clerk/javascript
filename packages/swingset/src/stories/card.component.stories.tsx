import { Button } from '@clerk/ui/mosaic/components/button';
import type { CardProps } from '@clerk/ui/mosaic/components/card';
import { Card } from '@clerk/ui/mosaic/components/card';
import { Field } from '@clerk/ui/mosaic/components/field';
import { Input } from '@clerk/ui/mosaic/components/input';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './card.component.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Card',
  source: 'packages/ui/src/mosaic/components/card/card.tsx',
  styles: {
    _variants: {
      elevation: { card: {}, flush: {}, overlay: {} },
      renderBranding: { true: {}, false: {} },
    },
    _defaultVariants: {
      elevation: 'card',
      renderBranding: true,
    },
  },
};

function knobsAsProps(props: Record<string, unknown>) {
  return props as unknown as CardProps;
}

export function Default(props: Record<string, unknown>) {
  return (
    <Card.Root {...knobsAsProps(props)}>
      <Card.Header>
        <Card.Title>Login to your account</Card.Title>
        <Card.Description>Enter your email below to login to your account</Card.Description>
      </Card.Header>
      <Card.Content>
        <Field.Root>
          <Field.Label>Email address</Field.Label>
          <Input />
        </Field.Root>
      </Card.Content>
      <Card.Footer>
        <Button fullWidth>Continue</Button>
      </Card.Footer>
    </Card.Root>
  );
}
