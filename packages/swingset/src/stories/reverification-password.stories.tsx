import { ReverificationPassword } from '@clerk/ui/mosaic/blocks/reverification';
import React from 'react';

import type { StoryMeta } from '@/lib/types';

import { ReverificationStoryCard } from './reverification-story-card';

export { default as __source } from './reverification-password.stories?raw';

export const meta: StoryMeta = {
  group: 'Blocks',
  title: 'ReverificationPassword',
  label: 'Password',
  navigation: { category: 'Reverification' },
  source: 'packages/ui/src/mosaic/blocks/reverification/reverification-password.tsx',
};

export function Default() {
  const [value, setValue] = React.useState('');

  return (
    <ReverificationStoryCard>
      <ReverificationPassword
        messages={{
          title: 'Verification required',
          description: 'Enter your current password to continue',
          fieldLabel: 'Password',
          fieldPlaceholder: 'Enter your password',
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
