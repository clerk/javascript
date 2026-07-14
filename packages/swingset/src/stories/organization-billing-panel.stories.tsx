/** @jsxImportSource @emotion/react */
import { OrganizationBillingPanelView } from '@clerk/ui/mosaic/organization/organization-billing-panel.view';
import type {
  SubscriptionOverviewRow,
  SubscriptionRow,
} from '@clerk/ui/mosaic/organization/organization-billing-subscriptions-section.view';
import { OrganizationBillingSubscriptionsSectionView } from '@clerk/ui/mosaic/organization/organization-billing-subscriptions-section.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Organization',
  title: 'OrganizationBillingPanel',
  source: 'packages/ui/src/mosaic/organization/organization-billing-panel.tsx',
};

// Controller-derived row model, mocked here so the demo renders without Clerk/commerce state.
const DEMO_ROWS: SubscriptionRow[] = [
  {
    id: 'sub_pro',
    planName: 'Pro',
    badge: { label: 'Active', intent: 'active' },
    caption: 'Renews Aug 1',
    fee: '$20',
    feePeriod: 'month',
    isUpcoming: false,
    seats: { label: 'Seats', limitLabel: 'Up to 50 seats (5 included)', usageLabel: '12 seats x $8 / month' },
  },
  {
    id: 'sub_enterprise',
    planName: 'Enterprise',
    badge: { label: 'Upcoming', intent: 'upcoming' },
    caption: 'Starts Sep 1',
    fee: '$200',
    feePeriod: 'month',
    isUpcoming: true,
    seats: null,
  },
];

const DEMO_OVERVIEW: SubscriptionOverviewRow = {
  label: 'Overview',
  grandTotal: '$116.00',
  renewsAt: 'Renews Aug 1',
};

export function Default() {
  const [value, setValue] = useState('subscriptions');

  return (
    <OrganizationBillingPanelView
      title='Billing'
      value={value}
      onTabChange={setValue}
      tabLabels={{ subscriptions: 'Subscription', statements: 'Statements', payments: 'Payments' }}
      subscriptions={
        <OrganizationBillingSubscriptionsSectionView
          title='Subscription'
          columnHeaders={{ plan: 'Plan', startDate: 'Start date' }}
          rows={DEMO_ROWS}
          overview={DEMO_OVERVIEW}
          switchOrNewPlan={{ label: 'Switch plans' }}
          manage={{ label: 'Manage' }}
          onSwitchOrNewPlan={() => undefined}
          onManageSubscription={() => undefined}
        />
      }
      statements='Statements list renders here.'
      payments='Payment history renders here.'
    />
  );
}
