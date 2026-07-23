import type { ReactElement } from 'react';

import { useOrganizationBillingPaymentDetailController } from './organization-billing-payment-detail.controller';
import { OrganizationBillingPaymentDetailView } from './organization-billing-payment-detail.view';

/**
 * A single payment attempt's detail screen: header with status, the cost breakdown (plan fee, seats,
 * subtotal, credits and discounts), and a total. Reads the payment attempt id from the router
 * (`paymentAttemptId`) and fetches via `usePaymentAttempt`. Renders nothing until the fetch resolves;
 * on a missing payment attempt it renders the error message. Exposed on the compound namespace as
 * `OrganizationProfile.BillingPaymentDetail`.
 */
export function OrganizationBillingPaymentDetail(): ReactElement | null {
  const controller = useOrganizationBillingPaymentDetailController();

  if (controller.status === 'loading') {
    return null;
  }

  if (controller.status === 'error') {
    return <div role='alert'>{controller.message}</div>;
  }

  return (
    <OrganizationBillingPaymentDetailView
      title={controller.title}
      idLabel={controller.idLabel}
      statusLabel={controller.statusLabel}
      statusIntent={controller.statusIntent}
      backLabel={controller.backLabel}
      onBack={controller.onBack}
      lineItems={controller.lineItems}
      totalLabel={controller.totalLabel}
      totalValue={controller.totalValue}
      currency={controller.currency}
    />
  );
}
