import { useSession } from '@clerk/shared/react';
import type { BillingSubscriptionItemResource } from '@clerk/shared/types';
import type { MouseEvent } from 'react';
import { useMemo } from 'react';

import { usePlansContext, useSubscriberTypeContext, useSubscription } from '@/contexts';
import { useRouter } from '@/router';
import { getIncludedSeatsUnitTier, getPlanSeatLimit, getSeatUnitPrice } from '@/utils/billingPlanSeats';
import { isManageableSubscriptionItem } from '@/utils/billingSubscription';

import { useMosaicEnvironment } from '../hooks/useMosaicEnvironment';
import { formatMoney, formatShortDate } from './billing-format';
import type {
  SubscriptionBadgeIntent,
  SubscriptionOverviewRow,
  SubscriptionRow,
  SubscriptionSeatsRow,
} from './organization-billing-subscriptions-section.view';

type OrganizationBillingSubscriptionsSectionController =
  | { status: 'loading' }
  | { status: 'hidden' }
  | {
      status: 'ready';
      /** Section heading. */
      title: string;
      /** Visually-hidden table header labels (plan / start date). */
      columnHeaders: { plan: string; startDate: string };
      rows: SubscriptionRow[];
      /** Next-payment overview row; `null` when there is no upcoming payment. */
      overview: SubscriptionOverviewRow | null;
      /** Switch/new-plan action; `null` when no paid plans exist for the subscriber. */
      switchOrNewPlan: { label: string } | null;
      /** Manage-subscription action; `null` when hidden (no manage permission or nothing manageable). */
      manage: { label: string } | null;
      /** Navigates to the plans screen (switch or add a subscription). */
      onSwitchOrNewPlan: () => void;
      /** Opens the subscription-details drawer; the DOM event is forwarded for the drawer's portal root. */
      onManageSubscription: (event: MouseEvent<HTMLElement>) => void;
    };

const BADGE_BY_STATUS: Record<string, { label: string; intent: SubscriptionBadgeIntent }> = {
  active: { label: 'Active', intent: 'active' },
  upcoming: { label: 'Upcoming', intent: 'upcoming' },
  past_due: { label: 'Past due', intent: 'pastDue' },
  free_trial: { label: 'Free trial', intent: 'freeTrial' },
};

function mapBadge(item: BillingSubscriptionItemResource): SubscriptionRow['badge'] {
  return BADGE_BY_STATUS[item.isFreeTrial ? 'free_trial' : item.status] ?? null;
}

// Reproduces the legacy `captionForSubscription`: the first matching lifecycle date, formatted
// as a short date. Only rendered when the plan is non-default or the item is upcoming.
function mapCaption(item: BillingSubscriptionItemResource): string | null {
  if (item.pastDueAt) {
    return `Past due ${formatShortDate(item.pastDueAt)}`;
  }
  if (item.status === 'upcoming') {
    return `Starts ${formatShortDate(item.periodStart)}`;
  }
  if (item.canceledAt) {
    return `Canceled • Ends ${formatShortDate(item.periodEnd)}`;
  }
  if (item.periodEnd) {
    return `${item.isFreeTrial ? 'Trial ends' : 'Renews'} ${formatShortDate(item.periodEnd)}`;
  }
  return null;
}

function mapSeats(item: BillingSubscriptionItemResource): SubscriptionSeatsRow | null {
  // A `null` quantity means unlimited seats — the row still renders; only `undefined` (no seat
  // pricing at all) omits it, mirroring the legacy `typeof subItemSeatsQty !== 'undefined'` check.
  if (typeof item.seats?.quantity === 'undefined') {
    return null;
  }

  const seatUnitPrice = getSeatUnitPrice(item.plan);
  const includedSeatsTier = getIncludedSeatsUnitTier(seatUnitPrice);
  const planSeatLimit = getPlanSeatLimit(item.plan);
  const includedSeats =
    includedSeatsTier?.endsAfterBlock != null && seatUnitPrice
      ? includedSeatsTier.endsAfterBlock * seatUnitPrice.blockSize
      : null;

  let limitLabel: string | null = null;
  if (typeof planSeatLimit === 'number' && includedSeats !== null) {
    limitLabel = `Up to ${planSeatLimit} seats (${includedSeats} included)`;
  } else if (typeof planSeatLimit === 'number') {
    limitLabel = `Up to ${planSeatLimit} seats`;
  } else if (includedSeats !== null) {
    limitLabel = `${includedSeats} seats included`;
  }

  const seatsTotalTier = item.seats?.tiers?.find(tier => tier.total.amount > 0);

  return {
    label: 'Seats',
    limitLabel,
    usageLabel:
      seatsTotalTier && seatsTotalTier.quantity
        ? `${seatsTotalTier.quantity} seats x ${formatMoney(seatsTotalTier.feePerBlock)} / month`
        : null,
  };
}

function mapRow(item: BillingSubscriptionItemResource, itemCount: number): SubscriptionRow {
  const feeAmount = item.planPeriod === 'annual' ? item.plan.annualFee : item.plan.fee;
  const showCaption = !item.plan.isDefault || item.status === 'upcoming';

  return {
    id: item.id,
    planName: item.plan.name,
    badge: item.isFreeTrial || itemCount > 1 || !!item.canceledAt ? mapBadge(item) : null,
    caption: showCaption ? mapCaption(item) : null,
    fee: feeAmount ? formatMoney(feeAmount, true) : '',
    feePeriod: feeAmount && feeAmount.amount > 0 ? (item.planPeriod === 'annual' ? 'year' : 'month') : null,
    isUpcoming: item.status === 'upcoming',
    seats: mapSeats(item),
  };
}

export function useOrganizationBillingSubscriptionsSectionController(): OrganizationBillingSubscriptionsSectionController {
  const subscriberType = useSubscriberTypeContext();
  const { subscriptionItems, data: subscription, isLoading } = useSubscription();
  const { isLoaded: isSessionLoaded, session } = useSession();
  const environment = useMosaicEnvironment();
  const { navigate } = useRouter();
  const { openSubscriptionDetails } = usePlansContext();

  // Active subscriptions sort to the top. A stable active-first key replaces the legacy
  // non-transitive comparator (which returned `1` for equal pairs); ordering within each
  // group is preserved instead of being reversed by the sort implementation.
  const sortedItems = useMemo(
    () => [...subscriptionItems].sort((a, b) => Number(b.status === 'active') - Number(a.status === 'active')),
    [subscriptionItems],
  );

  // Wait for the session and environment to resolve before deciding visibility, so the
  // section never flash-hides on a not-yet-known permission (matches the sibling sections).
  if (!isSessionLoaded || !environment) {
    return { status: 'loading' };
  }

  const canManage = session?.checkAuthorization({ permission: 'org:sys_billing:manage' }) ?? false;
  const canRead = session?.checkAuthorization({ permission: 'org:sys_billing:read' }) ?? false;
  const canManageBilling = canManage || subscriberType === 'user';
  const canReadBilling = canRead || canManage || subscriberType === 'user';

  if (!canReadBilling) {
    return { status: 'hidden' };
  }

  // First load with nothing to show yet — mirror the sibling sections' skeleton gate.
  if (isLoading && subscriptionItems.length === 0) {
    return { status: 'loading' };
  }

  const { commerceSettings } = environment;
  const billingPlansExist =
    (commerceSettings.billing.user.hasPaidPlans && subscriberType === 'user') ||
    (commerceSettings.billing.organization.hasPaidPlans && subscriberType === 'organization');

  const isManageButtonVisible = canManageBilling && subscriptionItems.some(isManageableSubscriptionItem);

  const nextPayment = subscription?.nextPayment;

  return {
    status: 'ready',
    title: 'Subscription',
    columnHeaders: { plan: 'Plan', startDate: 'Start date' },
    rows: sortedItems.map(item => mapRow(item, sortedItems.length)),
    overview:
      nextPayment?.totals && sortedItems.length > 0
        ? {
            label: 'Overview',
            grandTotal: formatMoney(nextPayment.totals.grandTotal),
            renewsAt: `Renews ${formatShortDate(nextPayment.date)}`,
          }
        : null,
    switchOrNewPlan: billingPlansExist
      ? { label: subscriptionItems.length > 0 ? 'Switch plans' : 'Subscribe to a plan' }
      : null,
    manage: isManageButtonVisible ? { label: 'Manage' } : null,
    onSwitchOrNewPlan: () => void navigate('plans'),
    onManageSubscription: (event: MouseEvent<HTMLElement>) => openSubscriptionDetails(event),
  };
}
