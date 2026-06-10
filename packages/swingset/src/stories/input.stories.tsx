/** @jsxImportSource @emotion/react */
import type { InputProps } from '@clerk/ui/mosaic/components/input';
import { Input, inputStyles } from '@clerk/ui/mosaic/components/input';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Input',
  styles: inputStyles,
};

function knobsAsProps(props: Record<string, unknown>) {
  return props as unknown as InputProps;
}

export function Default(props: Record<string, unknown>) {
  return (
    <Input
      {...knobsAsProps(props)}
      placeholder='Enter text…'
    />
  );
}

export function Sizes(props: Record<string, unknown>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 320 }}>
      <Input
        {...knobsAsProps(props)}
        size='sm'
        placeholder='Small'
      />
      <Input
        {...knobsAsProps(props)}
        size='md'
        placeholder='Medium'
      />
    </div>
  );
}

export function Disabled(props: Record<string, unknown>) {
  return (
    <Input
      {...knobsAsProps(props)}
      disabled
      placeholder='Disabled'
    />
  );
}

export function Invalid(props: Record<string, unknown>) {
  return (
    <Input
      {...knobsAsProps(props)}
      aria-invalid='true'
      placeholder='Invalid'
    />
  );
}
