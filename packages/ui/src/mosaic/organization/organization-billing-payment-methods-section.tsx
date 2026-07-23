import type { ReactElement } from 'react';

import { useOrganizationBillingPaymentMethodsSectionController } from './organization-billing-payment-methods-section.controller';
import { OrganizationBillingPaymentMethodsSectionView } from './organization-billing-payment-methods-section.view';

/**
 * The organization billing payment-methods list: shows saved payment methods and drives the
 * add, make-default, and remove mutations through their machines. Self-gating on the
 * `org:sys_billing:manage` permission, so it renders nothing for read-only members; requires the
 * surrounding billing contexts (`SubscriberTypeContext`). Exposed on the compound namespace as
 * `OrganizationProfile.BillingPaymentMethodsSection`.
 *
 * The add flow's Clerk-side lifecycle (open, submit, revalidate, error) is fully migrated, but the
 * gateway's card capture (Stripe's remotely-hosted `PaymentElement`) is deliberately not rendered
 * here: it cannot be reduced to a Clerk-free, prop-driven view, so it stays in the legacy
 * user-facing surface. `add.onSubmit` is the seam the real element would call with its tokenized
 * method. The add entry point is hidden in no-RHC builds, matching the legacy behavior.
 */
export function OrganizationBillingPaymentMethodsSection(): ReactElement | null {
  const controller = useOrganizationBillingPaymentMethodsSectionController();

  if (controller.status !== 'ready') {
    return null;
  }

  return (
    <OrganizationBillingPaymentMethodsSectionView
      title={controller.title}
      rows={controller.rows}
      makeDefaultPendingId={controller.makeDefaultPendingId}
      makeDefaultError={controller.makeDefaultError}
      onMakeDefault={controller.onMakeDefault}
      onRemove={controller.onRemove}
      remove={controller.remove}
      add={controller.add}
    />
  );
}
