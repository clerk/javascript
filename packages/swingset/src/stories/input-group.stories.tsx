import { Button } from '@clerk/ui/mosaic/components/button';
import { Field } from '@clerk/ui/mosaic/components/field';
import { Icon } from '@clerk/ui/mosaic/components/icon';
import type { InputGroupRootProps } from '@clerk/ui/mosaic/components/input-group';
import { InputGroup } from '@clerk/ui/mosaic/components/input-group';
import { colorVars, space } from '@clerk/ui/mosaic/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './input-group.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'wip',
  title: 'InputGroup',
  source: 'packages/ui/src/mosaic/components/input-group/input-group.tsx',
  styles: {
    _variants: {
      size: { sm: {}, md: {}, lg: {} },
    },
    _defaultVariants: {
      size: 'md',
    },
  },
};

const styles = stylex.create({
  fieldWidth: {
    width: 320,
  },
  tintedStart: {
    backgroundColor: `color-mix(in srgb, ${colorVars['--cl-color-neutral']} 8%, transparent)`,
    paddingInlineEnd: space['3'],
  },
  tintedEnd: {
    backgroundColor: `color-mix(in srgb, ${colorVars['--cl-color-neutral']} 8%, transparent)`,
    paddingInlineStart: space['3'],
  },
});

function knobsAsProps(props: Record<string, unknown>) {
  return props as unknown as InputGroupRootProps;
}

export function Default(props: Record<string, unknown>) {
  const [visible, setVisible] = useState(false);
  const groupProps = knobsAsProps(props);

  return (
    <Field.Root xstyle={styles.fieldWidth}>
      <Field.Label>Password</Field.Label>
      <InputGroup.Root {...groupProps}>
        <InputGroup.Input
          type={visible ? 'text' : 'password'}
          placeholder='Enter password'
          autoComplete='current-password'
        />
        <InputGroup.End>
          <Button
            type='button'
            aria-label={visible ? 'Hide password' : 'Show password'}
            onClick={() => setVisible(value => !value)}
          >
            <Icon name={visible ? 'eye-slash' : 'eye'} />
          </Button>
        </InputGroup.End>
      </InputGroup.Root>
    </Field.Root>
  );
}

export function Sizes(props: Record<string, unknown>) {
  return (
    <div style={{ display: 'grid', gap: 8, width: 320 }}>
      {(['sm', 'md', 'lg'] as const).map(size => (
        <InputGroup.Root
          {...knobsAsProps(props)}
          key={size}
          size={size}
        >
          <InputGroup.Input
            aria-label={`${size} email username`}
            placeholder='username'
          />
          <InputGroup.End>@acme.com</InputGroup.End>
        </InputGroup.Root>
      ))}
    </div>
  );
}

export function TextAddons(props: Record<string, unknown>) {
  return (
    <Field.Root xstyle={styles.fieldWidth}>
      <Field.Label>Website</Field.Label>
      <InputGroup.Root {...knobsAsProps(props)}>
        <InputGroup.Start xstyle={styles.tintedStart}>https://</InputGroup.Start>
        <InputGroup.Input placeholder='example' />
        <InputGroup.End xstyle={styles.tintedEnd}>.com</InputGroup.End>
      </InputGroup.Root>
    </Field.Root>
  );
}

export function Disabled(props: Record<string, unknown>) {
  return (
    <Field.Root
      disabled
      xstyle={styles.fieldWidth}
    >
      <Field.Label>Email address</Field.Label>
      <InputGroup.Root {...knobsAsProps(props)}>
        <InputGroup.Input defaultValue='austin' />
        <InputGroup.End>@acme.com</InputGroup.End>
      </InputGroup.Root>
    </Field.Root>
  );
}

export function Invalid(props: Record<string, unknown>) {
  const [visible, setVisible] = useState(false);
  const groupProps = knobsAsProps(props);

  return (
    <Field.Root
      invalid
      xstyle={styles.fieldWidth}
    >
      <Field.Label>Password</Field.Label>
      <InputGroup.Root {...groupProps}>
        <InputGroup.Input
          type={visible ? 'text' : 'password'}
          defaultValue='short'
          autoComplete='new-password'
        />
        <InputGroup.End>
          <Button
            type='button'
            aria-label={visible ? 'Hide password' : 'Show password'}
            onClick={() => setVisible(value => !value)}
          >
            <Icon name={visible ? 'eye-slash' : 'eye'} />
          </Button>
        </InputGroup.End>
      </InputGroup.Root>
      <Field.Error>Password must be at least 8 characters</Field.Error>
    </Field.Root>
  );
}
