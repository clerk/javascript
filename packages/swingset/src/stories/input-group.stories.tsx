import { Field } from '@clerk/ui/mosaic/components/field';
import { Icon } from '@clerk/ui/mosaic/components/icon';
import { Input } from '@clerk/ui/mosaic/components/input';
import type { InputGroupRootProps } from '@clerk/ui/mosaic/components/input-group';
import { InputGroup } from '@clerk/ui/mosaic/components/input-group';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './input-group.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
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

function knobsAsProps(props: Record<string, unknown>) {
  return props as unknown as InputGroupRootProps;
}

export function Default(props: Record<string, unknown>) {
  const [visible, setVisible] = useState(false);
  const groupProps = knobsAsProps(props);

  return (
    <Field.Root style={{ width: 320 }}>
      <Field.Label>Password</Field.Label>
      <InputGroup.Root {...groupProps}>
        <Input
          variant='headless'
          type={visible ? 'text' : 'password'}
          placeholder='Enter password'
          autoComplete='current-password'
        />
        <InputGroup.Action
          type='button'
          size='xs'
          shape='square'
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible(value => !value)}
        >
          <Icon
            name={visible ? 'eye-slash' : 'eye'}
            size='sm'
          />
        </InputGroup.Action>
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
          <Input
            variant='headless'
            aria-label={`${size} email username`}
            placeholder='username'
          />
          <InputGroup.Text>@acme.com</InputGroup.Text>
        </InputGroup.Root>
      ))}
    </div>
  );
}

export function Disabled(props: Record<string, unknown>) {
  return (
    <Field.Root
      disabled
      style={{ width: 320 }}
    >
      <Field.Label>Email address</Field.Label>
      <InputGroup.Root {...knobsAsProps(props)}>
        <Input
          variant='headless'
          defaultValue='austin'
        />
        <InputGroup.Text>@acme.com</InputGroup.Text>
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
      style={{ width: 320 }}
    >
      <Field.Label>Password</Field.Label>
      <InputGroup.Root {...groupProps}>
        <Input
          variant='headless'
          type={visible ? 'text' : 'password'}
          defaultValue='short'
          autoComplete='new-password'
        />
        <InputGroup.Action
          type='button'
          size='xs'
          shape='square'
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible(value => !value)}
        >
          <Icon
            name={visible ? 'eye-slash' : 'eye'}
            size='sm'
          />
        </InputGroup.Action>
      </InputGroup.Root>
      <Field.Error>Password must be at least 8 characters</Field.Error>
    </Field.Root>
  );
}
