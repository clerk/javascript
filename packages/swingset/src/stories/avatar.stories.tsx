/** @jsxImportSource @emotion/react */
import { Avatar, avatarRecipe } from '@clerk/ui/mosaic/components/avatar';
import GradientAvatar from '@clerk/ui/mosaic/components/mock/gradient-2.jpg';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './avatar.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Avatar',
  source: 'packages/ui/src/mosaic/components/avatar.tsx',
  styles: avatarRecipe,
};

export function Primary(props: Record<string, unknown>) {
  return (
    <Avatar
      shape={props.shape as 'org' | 'user'}
      size={props.size as 'sm' | 'md' | 'lg'}
      src={GradientAvatar.src}
    />
  );
}

export function OrgVariant() {
  return (
    <Avatar
      shape='org'
      size='md'
      src={GradientAvatar.src}
    />
  );
}

export function UserVariant() {
  return (
    <Avatar
      shape='user'
      size='md'
      src={GradientAvatar.src}
    />
  );
}

export function Sizes() {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Avatar
        shape='org'
        size='sm'
        src={GradientAvatar.src}
      />
      <Avatar
        shape='org'
        size='md'
        src={GradientAvatar.src}
      />
      <Avatar
        shape='org'
        size='lg'
        src={GradientAvatar.src}
      />
    </div>
  );
}
