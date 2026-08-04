import type { FieldRootProps } from '@clerk/ui/mosaic/components/field';
import { Field } from '@clerk/ui/mosaic/components/field';
import { Input } from '@clerk/ui/mosaic/components/input';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './field.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Field',
  source: 'packages/ui/src/mosaic/components/field/field.tsx',
  styleEngine: 'stylex',
  styles: {
    _variants: {
      invalid: { true: {}, false: {} },
      disabled: { true: {}, false: {} },
      required: { true: {}, false: {} },
    },
    _defaultVariants: {
      invalid: false,
      disabled: false,
      required: false,
    },
  },
};

function knobsAsProps(props: Record<string, unknown>) {
  return props as unknown as FieldRootProps;
}

const stackStyles = {
  display: 'grid',
  gap: 8,
  maxWidth: 384,
} as const;

export function Default(props: Record<string, unknown>) {
  const fieldProps = knobsAsProps(props);

  return (
    <Field.Root
      {...fieldProps}
      style={stackStyles}
    >
      <Field.Label>Email address</Field.Label>
      <Input
        name='email'
        type='email'
        placeholder='you@example.com'
      />
      {fieldProps.invalid ? (
        <Field.Error>Enter a valid email address.</Field.Error>
      ) : (
        <Field.Description>Used for account notifications.</Field.Description>
      )}
    </Field.Root>
  );
}

export function SettingsRow() {
  return (
    <Field.Root
      style={{
        alignItems: 'start',
        columnGap: 24,
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 24rem)',
        maxWidth: 960,
      }}
    >
      <div style={{ display: 'grid', gap: 4 }}>
        <Field.Label>Username</Field.Label>
        <Field.Description>This is how other members will identify you.</Field.Description>
      </div>
      <Input
        name='username'
        defaultValue='prestonxyz'
      />
    </Field.Root>
  );
}

export function Invalid() {
  return (
    <Field.Root
      invalid
      required
      style={stackStyles}
    >
      <Field.Label>Email address</Field.Label>
      <Input
        name='email'
        type='email'
        defaultValue='not-an-email'
      />
      <Field.Error>Enter a valid email address.</Field.Error>
    </Field.Root>
  );
}
