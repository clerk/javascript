import { UserProfileDeleteSectionView } from '@clerk/ui/mosaic/user-profile/user-profile-delete-section/user-profile-delete-section.view';
import { useState } from 'react';

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
  const [runId, setRunId] = useState(0);

  // Deleting is terminal: the real flow signs the user out and the section goes away with the
  // page. Nothing unmounts it here, so the story remounts it to make the demo repeatable.
  const handleDelete = async () => {
    await settleAfter(2000);
    setRunId(current => current + 1);
  };

  return (
    <UserProfileDeleteSectionView
      key={runId}
      onDelete={handleDelete}
    />
  );
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
