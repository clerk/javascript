import { ReverificationBackupCode } from '@clerk/ui/mosaic/blocks/reverification';
import React from 'react';

import type { StoryMeta } from '@/lib/types';

import { ReverificationStoryCard } from './reverification-story-card';

export { default as __source } from './reverification-backup-code.stories?raw';

export const meta: StoryMeta = {
  group: 'Blocks',
  title: 'ReverificationBackupCode',
  label: 'Backup code',
  navigation: { category: 'Reverification' },
  source: 'packages/ui/src/mosaic/blocks/reverification/reverification-backup-code.tsx',
};

export function Default() {
  const [value, setValue] = React.useState('');

  return (
    <ReverificationStoryCard>
      <ReverificationBackupCode
        messages={{
          title: 'Enter a backup code',
          description: 'Enter the backup code you received when setting up two-step authentication',
          fieldLabel: 'Backup code',
          secondaryActionLabel: 'Cancel',
          primaryActionLabel: 'Continue',
          pendingLabel: 'Verifying',
        }}
        value={value}
        onValueChange={setValue}
        onSubmit={() => undefined}
        onCancel={() => setValue('')}
      />
    </ReverificationStoryCard>
  );
}
