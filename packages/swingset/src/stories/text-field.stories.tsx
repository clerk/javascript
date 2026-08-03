import type { TextFieldRootProps } from '@clerk/ui/mosaic/components/text-field';
import { TextField } from '@clerk/ui/mosaic/components/text-field';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './text-field.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Text Field',
  source: 'packages/ui/src/mosaic/components/text-field/text-field.tsx',
  styleEngine: 'stylex',
  styles: {
    _variants: {
      layout: { stacked: {}, horizontal: {} },
      size: { sm: {}, md: {}, lg: {} },
      invalid: { true: {}, false: {} },
      disabled: { true: {}, false: {} },
      required: { true: {}, false: {} },
    },
    _defaultVariants: {
      layout: 'stacked',
      size: 'md',
      invalid: false,
      disabled: false,
      required: false,
    },
  },
};

function knobsAsProps(props: Record<string, unknown>) {
  return props as unknown as TextFieldRootProps;
}

export function Default(props: Record<string, unknown>) {
  const textFieldProps = knobsAsProps(props);

  return (
    <TextField.Root
      {...textFieldProps}
      ids={{ control: 'text-field-playground' }}
      style={{ maxWidth: textFieldProps.layout === 'horizontal' ? 960 : 384 }}
    >
      <TextField.Label>Email address</TextField.Label>
      <TextField.Content>
        <TextField.Input
          name='email'
          type='email'
          placeholder='you@example.com'
        />
        {textFieldProps.invalid ? (
          <TextField.Error>Enter a valid email address.</TextField.Error>
        ) : (
          <TextField.Description>Used for account notifications.</TextField.Description>
        )}
      </TextField.Content>
    </TextField.Root>
  );
}

export function Horizontal() {
  return (
    <div style={{ width: '100%', maxWidth: 960 }}>
      <TextField.Root
        layout='horizontal'
        ids={{ control: 'text-field-horizontal' }}
      >
        <TextField.Label>Username</TextField.Label>
        <TextField.Content>
          <TextField.Input
            name='username'
            defaultValue='prestonxyz'
          />
          <TextField.Description>This is how other members will identify you.</TextField.Description>
        </TextField.Content>
      </TextField.Root>
    </div>
  );
}

export function Invalid() {
  return (
    <TextField.Root
      invalid
      required
      ids={{ control: 'text-field-invalid' }}
      style={{ maxWidth: 384 }}
    >
      <TextField.Label>Email address</TextField.Label>
      <TextField.Content>
        <TextField.Input
          name='email'
          type='email'
          defaultValue='not-an-email'
        />
        <TextField.Error>Enter a valid email address.</TextField.Error>
      </TextField.Content>
    </TextField.Root>
  );
}

export function Sizes() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 384 }}>
      {(['sm', 'md', 'lg'] as const).map(size => (
        <TextField.Root
          key={size}
          size={size}
          ids={{ control: `text-field-${size}` }}
        >
          <TextField.Label>{size.toUpperCase()} field</TextField.Label>
          <TextField.Content>
            <TextField.Input placeholder={`${size} input`} />
            <TextField.Description>Supporting text follows the field size.</TextField.Description>
          </TextField.Content>
        </TextField.Root>
      ))}
    </div>
  );
}
