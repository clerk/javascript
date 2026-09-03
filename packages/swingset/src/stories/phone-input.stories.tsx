'use client';

import { Field } from '@clerk/ui/mosaic/components/field';
import type { PhoneInputProps } from '@clerk/ui/mosaic/components/phone-input';
import { PhoneInput } from '@clerk/ui/mosaic/components/phone-input';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './phone-input.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'PhoneInput',
  source: 'packages/ui/src/mosaic/components/phone-input/phone-input.tsx',
  styles: {
    _variants: {
      size: { sm: {}, md: {}, lg: {} },
    },
    _defaultVariants: {
      size: 'md',
    },
  },
};

const stackStyles = {
  display: 'grid',
  gap: 8,
  width: 320,
} as const;

function knobsAsProps(props: Record<string, unknown>) {
  return props as unknown as PhoneInputProps;
}

export function Default(props: Record<string, unknown>) {
  return (
    <Field.Root style={stackStyles}>
      <Field.Label>Phone number</Field.Label>
      <PhoneInput
        {...knobsAsProps(props)}
        name='phoneNumber'
        placeholder='202 555 0123'
      />
      <Field.Description>We will send a verification code to this number.</Field.Description>
    </Field.Root>
  );
}

export function Sizes() {
  return (
    <div style={{ display: 'grid', gap: 12, width: 320 }}>
      <PhoneInput
        size='sm'
        aria-label='Small phone number'
        placeholder='Small'
      />
      <PhoneInput
        size='md'
        aria-label='Medium phone number'
        placeholder='Medium'
      />
      <PhoneInput
        size='lg'
        aria-label='Large phone number'
        placeholder='Large'
      />
    </div>
  );
}

export function Prefilled() {
  return (
    <Field.Root style={stackStyles}>
      <Field.Label>Phone number</Field.Label>
      <PhoneInput defaultValue='+306901234567' />
      <Field.Description>Paste an international number to update the detected country.</Field.Description>
    </Field.Root>
  );
}

export function Disabled() {
  return (
    <Field.Root
      disabled
      style={stackStyles}
    >
      <Field.Label>Phone number</Field.Label>
      <PhoneInput defaultValue='+12025550123' />
    </Field.Root>
  );
}

export function Invalid() {
  return (
    <Field.Root
      invalid
      style={stackStyles}
    >
      <Field.Label>Phone number</Field.Label>
      <PhoneInput defaultValue='+1202' />
      <Field.Error>Enter a valid phone number.</Field.Error>
    </Field.Root>
  );
}
