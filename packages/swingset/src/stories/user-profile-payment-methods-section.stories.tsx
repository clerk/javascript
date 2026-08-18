import type { UserProfilePaymentMethod } from '@clerk/ui/mosaic/user-profile/user-profile-payment-methods-section.view';
import { UserProfilePaymentMethodsSectionView } from '@clerk/ui/mosaic/user-profile/user-profile-payment-methods-section.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './user-profile-payment-methods-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User',
  title: 'UserProfilePaymentMethodsSection',
  label: 'Payment methods',
  navigation: { family: 'User profile', category: 'Billing sections', order: 20 },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-payment-methods-section.view.tsx',
};

export function Default() {
  const [paymentMethods, setPaymentMethods] = useState<UserProfilePaymentMethod[]>([
    { id: 'visa', label: 'Visa •••• 0644', expiryLabel: 'Expires 02/2029', isDefault: true },
    { id: 'mastercard', label: 'Mastercard •••• 1212', expiryLabel: 'Expires 02/2029' },
  ]);

  return (
    <UserProfilePaymentMethodsSectionView
      paymentMethods={paymentMethods}
      onAdd={() =>
        setPaymentMethods(current => [
          ...current,
          { id: `card-${Date.now()}`, label: 'Visa •••• 4242', expiryLabel: 'Expires 08/2030' },
        ])
      }
      onMakeDefault={id =>
        setPaymentMethods(current => current.map(method => ({ ...method, isDefault: method.id === id })))
      }
      onRemove={id => setPaymentMethods(current => current.filter(method => method.id !== id))}
    />
  );
}

export function Empty() {
  const [paymentMethods, setPaymentMethods] = useState<UserProfilePaymentMethod[]>([]);

  return (
    <UserProfilePaymentMethodsSectionView
      paymentMethods={paymentMethods}
      onAdd={() =>
        setPaymentMethods([{ id: 'visa', label: 'Visa •••• 4242', expiryLabel: 'Expires 08/2030', isDefault: true }])
      }
      onMakeDefault={id =>
        setPaymentMethods(current => current.map(method => ({ ...method, isDefault: method.id === id })))
      }
      onRemove={id => setPaymentMethods(current => current.filter(method => method.id !== id))}
    />
  );
}
