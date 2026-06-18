/** @jsxImportSource @emotion/react */
import { Button } from '@clerk/ui/mosaic/components/button';
import type { CardProps } from '@clerk/ui/mosaic/components/card';
import { Card, cardRecipe } from '@clerk/ui/mosaic/components/card';
import { Heading } from '@clerk/ui/mosaic/components/heading';
import { Text } from '@clerk/ui/mosaic/components/text';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './card.component.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Card',
  source: 'packages/ui/src/mosaic/components/card.tsx',
  styles: cardRecipe,
};

function knobsAsProps(props: Record<string, unknown>) {
  return props as unknown as CardProps;
}

export function Default(props: Record<string, unknown>) {
  return (
    <Card
      {...knobsAsProps(props)}
      style={{ maxWidth: 400 }}
    >
      <Card.Header>
        <Heading>Login to your account</Heading>
        <Text>Enter your email below to login to your account</Text>
      </Card.Header>
      <Card.Content>Card body content goes here.</Card.Content>
      <Card.Footer>
        <Button fullWidth>Continue</Button>
      </Card.Footer>
    </Card>
  );
}

export function Centered() {
  return (
    <Card
      alignment='center'
      style={{ maxWidth: 400 }}
    >
      <Card.Header>
        <Heading>Verify your email</Heading>
        <Text>We sent a verification code to your email address</Text>
      </Card.Header>
      <Card.Content>Enter the code below to continue.</Card.Content>
      <Card.Footer>
        <Button fullWidth>Verify</Button>
      </Card.Footer>
    </Card>
  );
}
