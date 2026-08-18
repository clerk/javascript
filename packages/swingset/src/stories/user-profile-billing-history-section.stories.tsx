import type { UserProfileBillingHistoryItem } from '@clerk/ui/mosaic/user-profile/user-profile-billing-history-section.view';
import { UserProfileBillingHistorySectionView } from '@clerk/ui/mosaic/user-profile/user-profile-billing-history-section.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './user-profile-billing-history-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User',
  title: 'UserProfileBillingHistorySection',
  label: 'Billing history',
  navigation: { family: 'User profile', category: 'Billing sections', order: 30 },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-billing-history-section.view.tsx',
};

const items: UserProfileBillingHistoryItem[] = [
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
];

export function Default() {
  const [pageSize, setPageSize] = useState(10);

  return (
    <UserProfileBillingHistorySectionView
      items={items}
      pagination={{ page: 1, pageCount: 1, pageSize }}
      onPageSizeChange={setPageSize}
      onView={() => {}}
    />
  );
}

export function Empty() {
  return <UserProfileBillingHistorySectionView items={[]} />;
}
