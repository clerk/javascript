import { UserProfileSubscriptionSectionView } from '@clerk/ui/mosaic/user-profile/user-profile-subscription-section.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './user-profile-subscription-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User',
  title: 'UserProfileSubscriptionSection',
  label: 'Subscription',
  navigation: { family: 'User profile', category: 'Billing sections', order: 10 },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-subscription-section.view.tsx',
};

export function Default() {
  const [isPro, setIsPro] = useState(false);

  return (
    <UserProfileSubscriptionSectionView
      subscription={{
        planName: isPro ? 'Pro Plan' : 'Basic Plan',
        priceLabel: isPro ? '$25 / Month' : '$12 / Month',
        totalDueLabel: isPro ? '$25.00' : '$12.00',
        renewsAtLabel: 'Renews Aug 26',
      }}
      onChangePlan={() => setIsPro(value => !value)}
    />
  );
}
