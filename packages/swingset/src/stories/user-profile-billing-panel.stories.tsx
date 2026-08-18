import type {
  UserProfilePaymentMethod,
  UserProfileSubscription,
} from '@clerk/ui/mosaic/user-profile/user-profile-billing-panel.view';
import { UserProfileBillingPanelView } from '@clerk/ui/mosaic/user-profile/user-profile-billing-panel.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './user-profile-billing-panel.stories?raw';

export const meta: StoryMeta = {
  group: 'User',
  title: 'UserProfileBillingPanel',
  label: 'Billing panel',
  navigation: { family: 'User profile', category: 'Compositions', order: 30 },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-billing-panel.view.tsx',
};

const initialSubscription: UserProfileSubscription = {
  planName: 'Basic Plan',
  priceLabel: '$12 / Month',
  totalDueLabel: '$12.00',
  renewsAtLabel: 'Renews Aug 26',
};

const initialPaymentMethods: UserProfilePaymentMethod[] = [
  { id: 'visa', label: 'Visa •••• 0644', expiryLabel: 'Expires 02/2029', isDefault: true },
  { id: 'mastercard', label: 'Mastercard •••• 1212', expiryLabel: 'Expires 02/2029' },
];

export function Default() {
  const [subscription, setSubscription] = useState(initialSubscription);
  const [paymentMethods, setPaymentMethods] = useState(initialPaymentMethods);

  return (
    <UserProfileBillingPanelView
      paymentMethods={paymentMethods}
      subscription={subscription}
      onAddPaymentMethod={() =>
        setPaymentMethods(current => [
          ...current,
          { id: `card-${Date.now()}`, label: 'Visa •••• 4242', expiryLabel: 'Expires 08/2030' },
        ])
      }
      onChangePlan={() =>
        setSubscription({
          planName: 'Pro Plan',
          priceLabel: '$25 / Month',
          totalDueLabel: '$25.00',
          renewsAtLabel: 'Renews Aug 26',
        })
      }
      onMakeDefaultPaymentMethod={id =>
        setPaymentMethods(current => current.map(method => ({ ...method, isDefault: method.id === id })))
      }
      onRemovePaymentMethod={id => setPaymentMethods(current => current.filter(method => method.id !== id))}
    />
  );
}
