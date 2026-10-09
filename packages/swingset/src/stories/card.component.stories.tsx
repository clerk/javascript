import { Button } from '@clerk/mosaic/components/button';
import type { CardProps } from '@clerk/mosaic/components/card';
import { Card } from '@clerk/mosaic/components/card';
import { Field } from '@clerk/mosaic/components/field';
import { Input } from '@clerk/mosaic/components/input';
import type { ReactElement } from 'react';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './card.component.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'stable',
  title: 'Card',
  source: 'packages/mosaic/src/components/card/card.tsx',
  styles: {
    _variants: {
      elevation: { card: {}, flush: {}, overlay: {} },
      renderBranding: { true: {}, false: {} },
      size: { md: {}, lg: {} },
    },
    _defaultVariants: {
      elevation: 'card',
      renderBranding: true,
      size: 'md',
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

const image = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#6c47ff"/><text x="16" y="22" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="600" fill="#fff">A</text></svg>',
)}`;

export function WithImage(): ReactElement {
  return (
    <Card.Root>
      <Card.Header align='center'>
        <Card.Image
          src={image}
          alt='Acme'
          href='#'
        />
        <Card.Title>Sign in to Acme</Card.Title>
        <Card.Description>Welcome back! Please sign in to continue</Card.Description>
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

export function WithBanner() {
  const [error, setError] = useState<string | undefined>();
  return (
    <Card.Root>
      <Card.Header>
        <Card.Title>Change password</Card.Title>
        <Card.Description>Enter your current password and a new one.</Card.Description>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {error}
      </Card.Banner>
      <Card.Content>
        <Field.Root>
          <Field.Label>Current password</Field.Label>
          <Input type='password' />
        </Field.Root>
      </Card.Content>
      <Card.Footer>
        <Button
          variant='outline'
          onClick={() => setError(undefined)}
        >
          Clear
        </Button>
        <Button onClick={() => setError('Incorrect password. Try again.')}>Fail</Button>
      </Card.Footer>
    </Card.Root>
  );
}
