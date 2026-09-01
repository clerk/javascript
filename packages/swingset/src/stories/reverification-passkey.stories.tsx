import { ReverificationPasskey } from '@clerk/ui/mosaic/blocks/reverification';

import type { StoryMeta } from '@/lib/types';

import { ReverificationStoryCard } from './reverification-story-card';

export { default as __source } from './reverification-passkey.stories?raw';

export const meta: StoryMeta = {
  group: 'Blocks',
  title: 'ReverificationPasskey',
  label: 'Passkey',
  navigation: { category: 'Reverification' },
  source: 'packages/ui/src/mosaic/blocks/reverification/reverification-passkey.tsx',
};

export function Default() {
  return (
    <ReverificationStoryCard>
      <ReverificationPasskey
        messages={{
          title: 'Use your passkey',
          description:
            'Using your passkey confirms your identity. Your device may ask for your fingerprint, face, or screen lock.',
          secondaryActionLabel: 'Cancel',
          primaryActionLabel: 'Use your passkey',
          pendingLabel: 'Verifying',
        }}
        onVerify={() => undefined}
        onCancel={() => undefined}
      />
    </ReverificationStoryCard>
  );
}
