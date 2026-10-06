import { useDestructiveController } from '@clerk/mosaic/blocks/destructive/destructive.controller';
import { OrganizationProfileDangerSectionView } from '@clerk/mosaic/features/organization-profile/organization-profile-danger-section/organization-profile-danger-section.view';
import { ClerkAPIResponseError } from '@clerk/shared/error';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './organization-profile-danger-section.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  status: 'wip',
  title: 'OrganizationProfileDangerSection',
  label: 'Danger zone',
  navigation: { category: 'Sections' },
  source:
    'packages/mosaic/src/features/organization-profile/organization-profile-danger-section/organization-profile-danger-section.tsx',
};

const settleAfter = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const apiError = (longMessage: string) =>
  new ClerkAPIResponseError(longMessage, {
    status: 403,
    data: [{ code: 'forbidden', message: longMessage, long_message: longMessage }],
  });

function DangerSectionHarness({
  memberCount = 20,
  onLeave,
  onDelete,
}: {
  memberCount?: number;
  onLeave: () => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const leave = useDestructiveController({ onDelete: onLeave });
  const destroy = useDestructiveController({ onDelete: onDelete ?? (() => Promise.resolve()) });
  return (
    <OrganizationProfileDangerSectionView
      name='Clerk'
      memberCount={memberCount}
      leave={leave}
      destroy={onDelete ? destroy : undefined}
    />
  );
}

export function Default() {
  const [runId, setRunId] = useState(0);

  // Both actions are terminal in the real flow, so the story remounts the section to repeat.
  const settle = async () => {
    await settleAfter(1500);
    setRunId(current => current + 1);
  };

  return (
    <DangerSectionHarness
      key={runId}
      onLeave={settle}
      onDelete={settle}
    />
  );
}

export function WithError() {
  return (
    <DangerSectionHarness
      onLeave={async () => {
        await settleAfter(1500);
        throw apiError('You are the last admin. Promote another member before you leave.');
      }}
      onDelete={async () => {
        await settleAfter(1500);
        throw apiError('This organization has an active subscription. Cancel it before you delete.');
      }}
    />
  );
}

export function LeaveOnly() {
  return (
    <DangerSectionHarness
      memberCount={1}
      onLeave={() => settleAfter(1500)}
    />
  );
}
