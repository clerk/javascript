import type { ReactElement } from 'react';

import { Protect } from '@/common';
import { PaymentMethods } from '@/components/PaymentMethods';
import { SubscriberTypeContext } from '@/contexts';
import { useCardState, withCardStateProvider } from '@/elements/contexts';
import { useTabState } from '@/hooks/useTabState';

import { OrganizationBillingAccountCreditsSection } from './organization-billing-account-credits-section';
import { OrganizationBillingPanelView } from './organization-billing-panel.view';
import { OrganizationBillingPaymentsSection } from './organization-billing-payments-section';
import { OrganizationBillingStatementsSection } from './organization-billing-statements-section';
import { OrganizationBillingSubscriptionsSection } from './organization-billing-subscriptions-section';

// The tab index → URL `?tab=` value map preserved from the legacy OrganizationBillingPage, so
// deep-links and browser back/forward keep working. `useTabState` is index-based; the view is
// value-based, so the wrapper bridges the two.
const orgTabMap = {
  0: 'subscriptions',
  1: 'statements',
  2: 'payments',
} as const;

const TAB_VALUES = ['subscriptions', 'statements', 'payments'] as const;

const OrganizationBillingPanelInternal = withCardStateProvider(
  function OrganizationBillingPanelInternal(): ReactElement {
    const card = useCardState();
    const { selectedTab, handleTabChange } = useTabState(orgTabMap);

    const value = TAB_VALUES[selectedTab] ?? TAB_VALUES[0];
    const onTabChange = (next: string) => {
      const index = TAB_VALUES.findIndex(tab => tab === next);
      if (index >= 0) {
        handleTabChange(index);
      }
    };

    return (
      <OrganizationBillingPanelView
        title='Billing'
        error={card.error}
        value={value}
        onTabChange={onTabChange}
        tabLabels={{ subscriptions: 'Subscription', statements: 'Statements', payments: 'Payments' }}
        subscriptions={
          <>
            <OrganizationBillingSubscriptionsSection />
            {/* PaymentMethods stays legacy for now and keeps its own manage-permission gate. */}
            <Protect condition={has => has({ permission: 'org:sys_billing:manage' })}>
              <PaymentMethods />
            </Protect>
            <OrganizationBillingAccountCreditsSection />
          </>
        }
        statements={<OrganizationBillingStatementsSection />}
        payments={<OrganizationBillingPaymentsSection />}
      />
    );
  },
);

/**
 * The organization billing panel: a Mosaic shell wrapping the migrated Subscriptions, Account
 * Credits, Statements, and Payments sections plus the still-legacy PaymentMethods section, which
 * coexist as slot children. Provides `SubscriberTypeContext='organization'` and the card-state
 * provider, and syncs the active tab to the URL `?tab=` param. Requires a `MosaicProvider` ancestor.
 * Exposed on the compound namespace as `OrganizationProfile.BillingPanel`.
 */
export function OrganizationBillingPanel(): ReactElement {
  return (
    <SubscriberTypeContext.Provider value='organization'>
      <OrganizationBillingPanelInternal />
    </SubscriberTypeContext.Provider>
  );
}
