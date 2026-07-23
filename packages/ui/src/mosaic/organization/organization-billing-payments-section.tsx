import type { ReactElement } from 'react';

import { useOrganizationBillingPaymentsSectionController } from './organization-billing-payments-section.controller';
import { OrganizationBillingPaymentsSectionView } from './organization-billing-payments-section.view';

/**
 * The organization billing payment-attempts list: a table of payment attempts that navigates to a
 * payment attempt's detail screen on row select. Renders nothing until the first page resolves.
 * Self-gating via `usePaymentAttempts` (which only fetches with the right permission); requires the
 * surrounding billing contexts (`SubscriberTypeContext`). Exposed on the compound namespace as
 * `OrganizationProfile.BillingPaymentsSection`.
 */
export function OrganizationBillingPaymentsSection(): ReactElement | null {
  const controller = useOrganizationBillingPaymentsSectionController();

  if (controller.status !== 'ready') {
    return null;
  }

  return (
    <OrganizationBillingPaymentsSectionView
      columnHeaders={controller.columnHeaders}
      rows={controller.rows}
      emptyLabel={controller.emptyLabel}
      onSelectRow={controller.onSelectRow}
    />
  );
}
