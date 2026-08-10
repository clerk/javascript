/** @jsxImportSource @emotion/react */
import { AvatarButton } from '@clerk/ui/mosaic/block/avatar-button';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './avatar-button.stories?raw';

export const meta: StoryMeta = {
  group: 'Blocks',
  title: 'AvatarButton',
  source: 'packages/ui/src/mosaic/block/avatar-button.tsx',
  styleEngine: 'stylex',
};

export function Default() {
  return (
    <AvatarButton
      imageUrl='https://avatars.githubusercontent.com/u/51144033?v=4'
      name='Preston Booth'
      onClick={() => undefined}
    />
  );
}

export function Fallback() {
  return (
    <AvatarButton
      name='Preston Booth'
      onClick={() => undefined}
    />
  );
}
