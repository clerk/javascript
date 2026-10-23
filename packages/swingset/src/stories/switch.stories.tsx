import { Field } from '@clerk/mosaic/components/field';
import type { SwitchProps } from '@clerk/mosaic/components/switch';
import { Switch } from '@clerk/mosaic/components/switch';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './switch.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'stable',
  title: 'Switch',
  source: 'packages/mosaic/src/components/switch/switch.tsx',
  styles: {
    _variants: {
      size: { sm: {}, md: {} },
      disabled: { true: {}, false: {} },
    },
    _defaultVariants: {
      size: 'md',
      disabled: 'false',
    },
  },
};

function knobsAsProps(props: Record<string, unknown>) {
  const { disabled, ...rest } = props;
  return {
    ...rest,
    disabled: disabled === true || disabled === 'true',
  } as unknown as SwitchProps;
}

export function Default(props: Record<string, unknown>) {
  return (
    <Switch
      aria-label='Notifications'
      {...knobsAsProps(props)}
    />
  );
}

export function States() {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      <Switch aria-label='Off' />
      <Switch
        aria-label='On'
        defaultChecked
      />
      <Switch
        aria-label='Disabled'
        disabled
      />
      <Switch
        aria-label='Disabled on'
        disabled
        defaultChecked
      />
    </div>
  );
}

export function Sizes() {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Switch
        aria-label='Small'
        size='sm'
        defaultChecked
      />
      <Switch
        aria-label='Medium'
        size='md'
        defaultChecked
      />
    </div>
  );
}

export function WithField() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 360 }}>
      <Field.Root orientation='horizontal'>
        <Switch
          name='emailNotifications'
          defaultChecked
        />
        <Field.Content>
          <Field.Label>Email notifications</Field.Label>
          <Field.Description>Get an email when someone signs in to your account from a new device.</Field.Description>
        </Field.Content>
      </Field.Root>
      <Field.Root orientation='horizontal'>
        <Switch
          name='productUpdates'
          size='sm'
        />
        <Field.Content>
          <Field.Label>Send me product updates, feature announcements, and occasional offers by email</Field.Label>
        </Field.Content>
      </Field.Root>
      <Field.Root
        orientation='horizontal'
        disabled
      >
        <Switch name='betaFeatures' />
        <Field.Content>
          <Field.Label>Beta features</Field.Label>
        </Field.Content>
      </Field.Root>
    </div>
  );
}
