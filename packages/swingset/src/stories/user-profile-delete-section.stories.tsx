import { UserProfileDeleteSectionView } from '@clerk/ui/mosaic/user-profile/user-profile-delete-section/user-profile-delete-section.view';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './user-profile-delete-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  title: 'UserProfileDeleteSection',
  label: 'Danger zone',
  navigation: { category: 'Sections' },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-delete-section/user-profile-delete-section.view.tsx',
};

// A real delete is a network round trip. Without one the button never renders its pending
// state, so both stories wait before they settle.
const settleAfter = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export function Default() {
  return <UserProfileDeleteSectionView onDelete={() => settleAfter(2000)} />;
}

export function WithError() {
  return (
    <UserProfileDeleteSectionView
      onDelete={async () => {
        await settleAfter(2000);
        throw new Error('Your subscription is still active. Cancel it before you delete your account.');
      }}
    />
  );
}
