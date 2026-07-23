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

const IMAGE_SRC = 'https://images.clerk.dev/uploaded/img_avatar-placeholder.png';

export function Primary(props: Record<string, unknown>) {
  return <Avatar {...knobsAsProps(props)}>AC</Avatar>;
}

export function Image(props: Record<string, unknown>) {
  return (
    <Avatar
      {...knobsAsProps(props)}
      src={IMAGE_SRC}
      alt='Alex Carpenter'
    />
  );
}

export function Sizes(props: Record<string, unknown>) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Avatar
        {...knobsAsProps(props)}
        size='xs'
      >
        XS
      </Avatar>
      <Avatar
        {...knobsAsProps(props)}
        size='sm'
      >
        SM
      </Avatar>
      <Avatar
        {...knobsAsProps(props)}
        size='md'
      >
        MD
      </Avatar>
      <Avatar
        {...knobsAsProps(props)}
        size='lg'
      >
        LG
      </Avatar>
    </div>
  );
}

export function Shapes(props: Record<string, unknown>) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Avatar
        {...knobsAsProps(props)}
        shape='circle'
      >
        AC
      </Avatar>
      <Avatar
        {...knobsAsProps(props)}
        shape='square'
      >
        AC
      </Avatar>
    </div>
  );
}
