import { ReverificationHelp } from '@clerk/ui/mosaic/blocks/reverification';

import type { StoryMeta } from '@/lib/types';

import { ReverificationStoryCard } from './reverification-story-card';

export { default as __source } from './reverification-help.stories?raw';

export const meta: StoryMeta = {
  group: 'Blocks',
  title: 'ReverificationHelp',
  label: 'Help',
  navigation: { category: 'Reverification' },
  source: 'packages/ui/src/mosaic/blocks/reverification/reverification-help.tsx',
};

export function Default() {
  return (
    <ReverificationStoryCard>
      <ReverificationHelp
        messages={{
          title: 'Get help',
          description:
            'If you have trouble verifying your account, email us and we will work with you to restore access as soon as possible.',
          backButton: 'Back',
          supportButton: 'Email support',
        }}
        onEmailSupport={() => undefined}
        onBack={() => undefined}
      />
    </ReverificationStoryCard>
  );
}
