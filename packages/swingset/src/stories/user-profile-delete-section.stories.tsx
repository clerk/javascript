import { useUserProfileDeleteSectionController } from '@clerk/mosaic/features/user-profile/user-profile-delete-section/user-profile-delete-section.controller';
import { UserProfileDeleteSectionView } from '@clerk/mosaic/features/user-profile/user-profile-delete-section/user-profile-delete-section.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './user-profile-delete-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  status: 'wip',
  title: 'UserProfileDeleteSection',
  label: 'Danger zone',
  navigation: { category: 'Sections' },
  source: 'packages/mosaic/src/features/user-profile/user-profile-delete-section/user-profile-delete-section.tsx',
};

// A real delete is a network round trip. Without one the button never renders its pending
// state, so both stories wait before they settle.
const settleAfter = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

function DeleteSectionHarness({ onDelete }: { onDelete: () => Promise<void> }) {
  const controller = useUserProfileDeleteSectionController({ onDelete });
  return <UserProfileDeleteSectionView {...controller} />;
}

export function Default() {
  const [runId, setRunId] = useState(0);

  // Deleting is terminal: the real flow signs the user out and the section goes away with the
  // page. Nothing unmounts it here, so the story remounts it to make the demo repeatable.
  const handleDelete = async () => {
    await settleAfter(2000);
    setRunId(current => current + 1);
  };

  return (
    <DeleteSectionHarness
      key={runId}
      onDelete={handleDelete}
    />
  );
}

export function WithError() {
  return (
    <DeleteSectionHarness
      onDelete={async () => {
        await settleAfter(2000);
        throw new Error('Your subscription is still active. Cancel it before you delete your account.');
      }}
    />
  );
}
