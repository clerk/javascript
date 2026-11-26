import { Avatar } from '@clerk/mosaic/components/avatar';
import type { AvatarGroupProps } from '@clerk/mosaic/components/avatar-group';
import { AvatarGroup } from '@clerk/mosaic/components/avatar-group';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './avatar-group.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'wip',
  title: 'AvatarGroup',
  source: 'packages/mosaic/src/components/avatar-group/avatar-group.tsx',
  styles: {
    _variants: {
      shape: { circle: {}, square: {} },
      size: { xs: {}, sm: {}, md: {}, lg: {} },
    },
    _defaultVariants: {
      shape: 'circle',
      size: 'md',
    },
  },
};

function knobsAsProps(props: Record<string, unknown>) {
  return props as unknown as AvatarGroupProps;
}

const MEMBERS: { id: string; name: string; imageUrl: string }[] = [
  { id: 'clerk', name: 'Clerk', imageUrl: 'https://github.com/clerk.png' },
  { id: 'colin', name: 'Colin', imageUrl: 'https://avatars.githubusercontent.com/u/51144033?v=4' },
  { id: 'vercel', name: 'Vercel', imageUrl: 'https://github.com/vercel.png' },
  { id: 'github', name: 'GitHub', imageUrl: 'https://github.com/github.png' },
  { id: 'react', name: 'React', imageUrl: 'https://github.com/facebook.png' },
  { id: 'next', name: 'Next', imageUrl: 'https://github.com/nextjs.png' },
];

const VISIBLE = 4;

function Members({ count }: { count: number }) {
  return MEMBERS.slice(0, count).map(member => (
    <Avatar.Root key={member.id}>
      <Avatar.Image
        src={member.imageUrl}
        alt={member.name}
      />
      <Avatar.Fallback />
    </Avatar.Root>
  ));
}

export function Primary(props: Record<string, unknown>) {
  return (
    <AvatarGroup.Root
      aria-label='Members'
      {...knobsAsProps(props)}
    >
      <Members count={VISIBLE} />
      <AvatarGroup.Overflow count={MEMBERS.length - VISIBLE} />
    </AvatarGroup.Root>
  );
}

export function Sizes(props: Record<string, unknown>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      {(['xs', 'sm', 'md', 'lg'] as const).map(size => (
        <AvatarGroup.Root
          key={size}
          aria-label='Members'
          {...knobsAsProps(props)}
          size={size}
        >
          <Members count={VISIBLE} />
          <AvatarGroup.Overflow count={MEMBERS.length - VISIBLE} />
        </AvatarGroup.Root>
      ))}
    </div>
  );
}

export function Shapes(props: Record<string, unknown>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      {(['circle', 'square'] as const).map(shape => (
        <AvatarGroup.Root
          key={shape}
          aria-label='Members'
          {...knobsAsProps(props)}
          shape={shape}
        >
          <Members count={VISIBLE} />
          <AvatarGroup.Overflow count={128} />
        </AvatarGroup.Root>
      ))}
    </div>
  );
}

export function OnColor(props: Record<string, unknown>) {
  return (
    <div
      style={{
        display: 'inline-flex',
        padding: 16,
        borderRadius: 12,
        background: 'linear-gradient(135deg, #6c47ff, #ff6b6b)',
      }}
    >
      <AvatarGroup.Root
        aria-label='Members'
        {...knobsAsProps(props)}
      >
        <Members count={VISIBLE} />
        <AvatarGroup.Overflow count={MEMBERS.length - VISIBLE} />
      </AvatarGroup.Root>
    </div>
  );
}

export function InteractiveOverflow(props: Record<string, unknown>) {
  return (
    <AvatarGroup.Root
      aria-label='Members'
      {...knobsAsProps(props)}
    >
      <Members count={VISIBLE} />
      <AvatarGroup.Overflow
        count={MEMBERS.length - VISIBLE}
        label='Show {count} more members'
        render={<button type='button' />}
      />
    </AvatarGroup.Root>
  );
}
