/** @jsxImportSource @emotion/react */
import type { AvatarProps } from '@clerk/ui/mosaic/components/avatar';
import { Avatar } from '@clerk/ui/mosaic/components/avatar';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './avatar.stories?raw';

// StyleX has no runtime recipe to derive knobs from, so the variant surface is described
// here to drive the playground + prop table. Keys mirror `AvatarProps`.
export const meta: StoryMeta = {
  group: 'Components',
  title: 'Avatar',
  source: 'packages/ui/src/mosaic/components/avatar/avatar.tsx',
  styles: {
    _variants: {
      shape: { circle: {}, square: {} },
      size: { lg: {}, md: {}, sm: {}, xs: {} },
    },
    _defaultVariants: {
      shape: 'circle',
      size: 'md',
    },
  },
};

// Story functions accept Record<string,unknown> (knob values) and cast to AvatarProps.
// The cast is unavoidable: knobs are dynamically typed; Avatar has a strict prop interface.
function knobsAsProps(props: Record<string, unknown>) {
  return props as unknown as AvatarProps;
}

const IMAGE_SRC = 'https://github.com/clerk.png';

export function Primary(props: Record<string, unknown>) {
  return (
    <Avatar.Root {...knobsAsProps(props)}>
      <Avatar.Image
        src={IMAGE_SRC}
        alt='@clerk'
      />
      <Avatar.Fallback>CL</Avatar.Fallback>
    </Avatar.Root>
  );
}

export function Fallback(props: Record<string, unknown>) {
  return (
    <Avatar.Root {...knobsAsProps(props)}>
      <Avatar.Image
        src='https://example.com/broken.png'
        alt='@clerk'
      />
      <Avatar.Fallback>CL</Avatar.Fallback>
    </Avatar.Root>
  );
}

export function Sizes(props: Record<string, unknown>) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {(['xs', 'sm', 'md', 'lg'] as const).map(size => (
        <Avatar.Root
          key={size}
          {...knobsAsProps(props)}
          size={size}
        >
          <Avatar.Image
            src={IMAGE_SRC}
            alt='@clerk'
          />
          <Avatar.Fallback>CL</Avatar.Fallback>
        </Avatar.Root>
      ))}
    </div>
  );
}

export function Shapes(props: Record<string, unknown>) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {(['circle', 'square'] as const).map(shape => (
        <Avatar.Root
          key={shape}
          {...knobsAsProps(props)}
          shape={shape}
        >
          <Avatar.Image
            src={IMAGE_SRC}
            alt='@clerk'
          />
          <Avatar.Fallback>CL</Avatar.Fallback>
        </Avatar.Root>
      ))}
    </div>
  );
}
