import { ReverificationMethodPicker } from '@clerk/ui/mosaic/blocks/reverification';
import React from 'react';

import type { StoryMeta } from '@/lib/types';

import { ReverificationStoryCard } from './reverification-story-card';

export { default as __source } from './reverification-method-picker.stories?raw';

export const meta: StoryMeta = {
  group: 'Blocks',
  title: 'ReverificationMethodPicker',
  label: 'Method picker',
  navigation: { category: 'Reverification' },
  source: 'packages/ui/src/mosaic/blocks/reverification/reverification-method-picker.tsx',
};

export function Default() {
  const [pendingMethodId, setPendingMethodId] = React.useState<string>();

  return (
    <ReverificationStoryCard>
      <ReverificationMethodPicker
        messages={{
          title: 'Use another method',
          description: 'Facing issues? You can use any of these methods for verification.',
          backButton: 'Back',
          helpText: 'Don’t have any of these?',
          helpButton: 'Get help',
        }}
        methods={[
          { id: 'password', label: 'Continue with your password', icon: 'security-lock-square' },
          { id: 'phone', label: 'Send SMS code to ••• ••• 1234', icon: 'security-phone' },
          { id: 'totp', label: 'Use your authenticator app', icon: 'security-authenticator' },
          { id: 'passkey', label: 'Use your passkey', icon: 'security-passkey' },
        ]}
        pendingMethodId={pendingMethodId}
        onSelect={setPendingMethodId}
        onHelp={() => undefined}
        onBack={() => setPendingMethodId(undefined)}
      />
    </ReverificationStoryCard>
  );
}
