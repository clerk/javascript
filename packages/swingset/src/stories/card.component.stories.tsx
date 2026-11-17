import { Avatar } from '@clerk/mosaic/components/avatar';
import { Button } from '@clerk/mosaic/components/button';
import type { CardProps } from '@clerk/mosaic/components/card';
import { Card } from '@clerk/mosaic/components/card';
import { Field } from '@clerk/mosaic/components/field';
import { Icon } from '@clerk/mosaic/components/icon';
import { Input } from '@clerk/mosaic/components/input';
import { Application2 } from '@clerk/mosaic/icons/glyphs/application-2';
import { ShieldCheck } from '@clerk/mosaic/icons/glyphs/shield-check';
import { colorVars, space } from '@clerk/mosaic/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './card.component.stories?raw';

const CLERK_LOGO_SRC = 'https://avatars.githubusercontent.com/u/49538330?v=4';

const styles = stylex.create({
  connection: {
    alignItems: 'center',
    display: 'flex',
    gap: space['2'],
  },
  appLogo: {
    alignItems: 'center',
    borderColor: colorVars['--cl-color-border'],
    borderStyle: 'solid',
    borderWidth: '1px',
    display: 'flex',
    justifyContent: 'center',
  },
  connector: {
    alignItems: 'center',
    color: colorVars['--cl-color-foreground-secondary'],
    display: 'flex',
    gap: space['2'],
    width: space['32'],
  },
  line: {
    borderBlockStartColor: colorVars['--cl-color-foreground-secondary'],
    borderBlockStartStyle: 'dashed',
    borderBlockStartWidth: '1px',
    flexGrow: 1,
  },
});

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
        <Button>Continue</Button>
      </Card.Footer>
    </Card.Root>
  );
}

export function WithMedia() {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Media>
          <Avatar.Root size='lg'>
            <Avatar.Image
              src={CLERK_LOGO_SRC}
              alt='Clerk'
            />
            <Avatar.Fallback />
          </Avatar.Root>
        </Card.Media>
        <Card.Title>Join Clerk</Card.Title>
        <Card.Description>You have been invited to this organization.</Card.Description>
      </Card.Header>
      <Card.Footer>
        <Button>Accept invitation</Button>
      </Card.Footer>
    </Card.Root>
  );
}

export function OAuthConsent() {
  return (
    <Card.Root align='center'>
      <Card.Header>
        <Card.Media xstyle={styles.connection}>
          <Avatar.Root
            shape='square'
            size='lg'
            xstyle={styles.appLogo}
          >
            <Icon glyph={Application2} />
          </Avatar.Root>
          <div
            aria-hidden
            {...stylex.props(styles.connector)}
          >
            <span {...stylex.props(styles.line)} />
            <Icon glyph={ShieldCheck} />
            <span {...stylex.props(styles.line)} />
          </div>
          <Avatar.Root size='lg'>
            <Avatar.Image
              src={CLERK_LOGO_SRC}
              alt='Clerk'
            />
            <Avatar.Fallback />
          </Avatar.Root>
        </Card.Media>
        <Card.Title>Authorize Acme</Card.Title>
        <Card.Description>Acme wants to access your Clerk account.</Card.Description>
      </Card.Header>
      <Card.Footer>
        <Button variant='outline'>Cancel</Button>
        <Button>Allow</Button>
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
