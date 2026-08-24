import type {
  UserProfileBillingHistoryItem,
  UserProfilePaymentMethod,
  UserProfileSubscription,
} from '@clerk/ui/mosaic/user-profile/user-profile-billing-panel.view';
import { UserProfileBillingPanelView } from '@clerk/ui/mosaic/user-profile/user-profile-billing-panel.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './user-profile-billing-panel.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  title: 'UserProfileBillingPanel',
  label: 'Billing panel',
  navigation: { category: 'Panels' },
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

const historyItems: UserProfileBillingHistoryItem[] = [
  {
    id: 'stmt_202605_0644',
    dateLabel: 'May 26, 2026',
    invoiceLabel: 'stmt_202605_...us64a',
    amountLabel: '$25.00',
    statusLabel: 'Paid',
  },
  {
    id: 'stmt_202606_0644',
    dateLabel: 'Jun 3, 2026',
    invoiceLabel: 'stmt_202606_...us64a',
    amountLabel: '$25.00',
    statusLabel: 'Paid',
  },
  {
    id: 'stmt_202607_0644',
    dateLabel: 'Jun 10, 2026',
    invoiceLabel: 'stmt_202607_...us64a',
    amountLabel: '$25.00',
    statusLabel: 'Paid',
  },
  {
    id: 'stmt_202608_0644',
    dateLabel: 'Jun 18, 2026',
    invoiceLabel: 'stmt_202608_...us64a',
    amountLabel: '$25.00',
    statusLabel: 'Paid',
  },
  {
    id: 'stmt_202609_0644',
    dateLabel: 'Jul 1, 2026',
    invoiceLabel: 'stmt_202609_...us64a',
    amountLabel: '$25.00',
    statusLabel: 'Paid',
  },
  {
    id: 'stmt_202610_0644',
    dateLabel: 'Jul 9, 2026',
    invoiceLabel: 'stmt_202610_...us64a',
    amountLabel: '$25.00',
    statusLabel: 'Paid',
  },
  {
    id: 'stmt_202611_0644',
    dateLabel: 'Jul 23, 2026',
    invoiceLabel: 'stmt_202611_...us64a',
    amountLabel: '$25.00',
    statusLabel: 'Paid',
  },
];

export function Default() {
  const [subscription, setSubscription] = useState(initialSubscription);
  const [paymentMethods, setPaymentMethods] = useState(initialPaymentMethods);
  const [historyPageSize, setHistoryPageSize] = useState(10);

  return (
    <UserProfileBillingPanelView
      historyItems={historyItems}
      historyPagination={{ page: 1, pageCount: 1, pageSize: historyPageSize }}
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
      onBillingHistoryPageSizeChange={setHistoryPageSize}
      onViewInvoice={() => {}}
    />
  );
}
