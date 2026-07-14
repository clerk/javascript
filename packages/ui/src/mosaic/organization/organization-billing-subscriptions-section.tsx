import type { ReactElement } from 'react';

import { SectionSkeleton } from '../components/section-skeleton';
import { useOrganizationBillingSubscriptionsSectionController } from './organization-billing-subscriptions-section.controller';
import { OrganizationBillingSubscriptionsSectionView } from './organization-billing-subscriptions-section.view';

/**
 * The organization billing subscriptions section: the list of the organization's subscription
 * items (plan, seats, next-payment overview) plus the switch/new-plan and manage actions. Shows a
 * skeleton while the subscription loads, returns `null` when the user cannot read billing, and
 * otherwise renders {@link OrganizationBillingSubscriptionsSectionView}. Self-gating; requires a
 * `MosaicProvider` and the surrounding billing contexts (`SubscriberTypeContext`). Exposed on the
 * compound namespace as `OrganizationProfile.BillingSubscriptionsSection`.
 */
export function OrganizationBillingSubscriptionsSection(): ReactElement | null {
  const controller = useOrganizationBillingSubscriptionsSectionController();

  if (controller.status === 'loading') {
    return <SectionSkeleton />;
  }

  if (controller.status !== 'ready') {
    return null;
  }

  return (
    <OrganizationBillingSubscriptionsSectionView
      title={controller.title}
      columnHeaders={controller.columnHeaders}
      rows={controller.rows}
      overview={controller.overview}
      switchOrNewPlan={controller.switchOrNewPlan}
      manage={controller.manage}
      onSwitchOrNewPlan={controller.onSwitchOrNewPlan}
      onManageSubscription={controller.onManageSubscription}
    />
  );
}
