import { OrganizationProfileDangerSectionView } from '@clerk/mosaic/features/organization-profile/organization-profile-danger-section/organization-profile-danger-section.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './organization-profile-danger-section.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  status: 'wip',
  substatus: 'needs wire-up',
  title: 'OrganizationProfileDangerSection',
  label: 'Danger zone',
  navigation: { category: 'Sections' },
  source:
    'packages/mosaic/src/features/organization-profile/organization-profile-danger-section/organization-profile-danger-section.view.tsx',
};

const settleAfter = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export function Default() {
  const [runId, setRunId] = useState(0);

  // Both actions are terminal in the real flow, so the story remounts the section to repeat.
  const settle = async () => {
    await settleAfter(1500);
    setRunId(current => current + 1);
  };

  return (
    <OrganizationProfileDangerSectionView
      key={runId}
      name='Clerk'
      memberCount={20}
      onLeave={settle}
      onDelete={settle}
    />
  );
}

export function WithError() {
  return (
    <OrganizationProfileDangerSectionView
      name='Clerk'
      memberCount={20}
      onLeave={async () => {
        await settleAfter(1500);
        throw new Error('You are the last admin. Promote another member before you leave.');
      }}
      onDelete={async () => {
        await settleAfter(1500);
        throw new Error('This workspace has an active subscription. Cancel it before you delete.');
      }}
    />
  );
}

export function LeaveOnly() {
  return (
    <OrganizationProfileDangerSectionView
      name='Clerk'
      memberCount={1}
      onLeave={() => settleAfter(1500)}
    />
  );
}
