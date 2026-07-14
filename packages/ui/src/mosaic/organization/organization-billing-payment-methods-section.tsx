import type { ReactElement } from 'react';

import { useOrganizationBillingPaymentMethodsSectionController } from './organization-billing-payment-methods-section.controller';
import { OrganizationBillingPaymentMethodsSectionView } from './organization-billing-payment-methods-section.view';

/**
 * The organization billing payment-methods list: shows saved payment methods and drives the
 * make-default and remove mutations through their machines. Self-gating on the
 * `org:sys_billing:manage` permission, so it renders nothing for read-only members; requires the
 * surrounding billing contexts (`SubscriberTypeContext`). Exposed on the compound namespace as
 * `OrganizationProfile.BillingPaymentMethodsSection`.
 *
 * NOT YET MIGRATED: the "add payment method" flow. It renders Stripe's `PaymentElement` inside a
 * `PaymentElementProvider` (see the legacy `components/PaymentMethods/AddPaymentMethod.tsx`), which
 * cannot be reduced to a Clerk-free, prop-driven view like the rest of the Mosaic billing surface,
 * and also needs the Stripe appearance-theming bridge. Until that lands, this section only lists,
 * removes, and re-defaults existing methods — matching the legacy RHC-disabled behavior, where the
 * add button is likewise hidden. See roadmap task "Migrate the add-payment-method (Stripe) flow".
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
    />
  );
}
