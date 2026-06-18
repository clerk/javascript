/** @jsxImportSource @emotion/react */
import { UserProfile } from '@clerk/ui/mosaic/aio/user-profile';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'AIO',
  title: 'UserProfile',
  label: 'User Profile',
  source: 'packages/ui/src/mosaic/aio/user-profile.tsx',
  wide: true,
};

export function Default() {
  return <UserProfile />;
}
