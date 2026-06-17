/** @jsxImportSource @emotion/react */
import { Avatar } from '@clerk/ui/mosaic/components/avatar';

import type { StoryMeta } from '@/lib/types';
import { avatarRecipe } from '@clerk/ui/mosaic/components/avatar';

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
      color='#6c47ff'
    />
  );
}

export function OrgVariant() {
  return (
    <Avatar
      shape='org'
      size='md'
      color='#6c47ff'
    />
  );
}

export function UserVariant() {
  return (
    <Avatar
      shape='user'
      size='md'
      color='#6c47ff'
    />
  );
}

export function Sizes() {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Avatar
        shape='org'
        size='sm'
        color='#6c47ff'
      />
      <Avatar
        shape='org'
        size='md'
        color='#6c47ff'
      />
      <Avatar
        shape='org'
        size='lg'
        color='#6c47ff'
      />
    </div>
  );
}
