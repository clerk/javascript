import type { ReactElement } from 'react';

import { useOrganizationBillingAccountCreditsSectionController } from './organization-billing-account-credits-section.controller';
import { OrganizationBillingAccountCreditsSectionView } from './organization-billing-account-credits-section.view';

/**
 * The organization billing account-credits section: the current credit balance plus a link to the
 * credit-history screen. Returns `null` until a non-null balance is known (mirroring the legacy
 * section, which renders nothing when there is no credit balance). Self-gating; requires a
 * `MosaicProvider` and the surrounding billing contexts (`SubscriberTypeContext`). Exposed on the
 * compound namespace as `OrganizationProfile.BillingAccountCreditsSection`.
 */
export function OrganizationBillingAccountCreditsSection(): ReactElement | null {
  const controller = useOrganizationBillingAccountCreditsSectionController();

  if (controller.status !== 'ready') {
    return null;
  }

  return (
    <OrganizationBillingAccountCreditsSectionView
      title={controller.title}
      balanceLabel={controller.balanceLabel}
      viewHistory={controller.viewHistory}
      onViewHistory={controller.onViewHistory}
    />
  );
}
