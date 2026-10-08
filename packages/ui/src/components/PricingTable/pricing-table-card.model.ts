import { __internal_useOrganizationBase, useSession } from '@clerk/shared/react';
import type { BillingSubscriptionPlanPeriod, PricingTableProps } from '@clerk/shared/types';
import type * as React from 'react';

import { getPlanSeatLimit, getSeatUnitPrice, organizationExceedsPlanSeatLimit } from '@/ui/utils/billingPlanSeats';

import { useProtect } from '../../common';
import { usePlans, usePlansContext, usePricingTableContext, useSubscriberTypeContext } from '../../contexts';
import { localizationKeys } from '../../customizables';
import type { PricingTableCardData } from './pricing-table-card.types';
import { usePricingTableCardHeaderModel } from './pricing-table-card-header.model';
import { usePricingTableSeatCostModel } from './pricing-table-seat-cost.model';
import { getPricingFooterState } from './utils/pricing-footer-state';

export interface PricingTableCardProps {
  planId: string;
  highlightedPlan?: string;
  planPeriod: BillingSubscriptionPlanPeriod;
  setPlanPeriod: (p: BillingSubscriptionPlanPeriod) => void;
  onSelect: (planId: string, event?: React.MouseEvent<HTMLElement>) => void;
  onShowDetails: (planId: string, event?: React.MouseEvent<HTMLElement>) => void;
  isCompact?: boolean;
  props: PricingTableProps;
}

export const usePricingTableCardModel = ({
  planId,
  highlightedPlan,
  planPeriod,
  setPlanPeriod,
  onSelect,
  onShowDetails,
  props,
  isCompact = false,
}: PricingTableCardProps): PricingTableCardData | null => {
  const { data: plans } = usePlans({ mode: 'cache', keepPreviousData: false });
  const plan = plans.find(item => item.id === planId);
  const { isSignedIn } = useSession();
  const { ctaPosition: ctxCtaPosition } = usePricingTableContext();
  const subscriberType = useSubscriberTypeContext();
  const organization = __internal_useOrganizationBase();
  const canManageBilling = useProtect(
    has => has({ permission: 'org:sys_billing:manage' }) || subscriberType === 'user',
  );
  const { buttonPropsForPlan, activeOrUpcomingSubscriptionBasedOnPlanPeriod } = usePlansContext();
  const header = usePricingTableCardHeaderModel(plan, planPeriod);
  const seatCost = usePricingTableSeatCostModel(plan);
  if (!plan || !header) {
    return null;
  }
  const subscription = activeOrUpcomingSubscriptionBasedOnPlanPeriod(plan, planPeriod);
  const footerButtonTooltipText = (() => {
    if (isSignedIn && !canManageBilling) {
      return localizationKeys('organizationProfile.plansPage.alerts.noPermissionsToManageBilling');
    }
    if (organization && subscriberType === 'organization' && organizationExceedsPlanSeatLimit(plan, organization)) {
      const seatLimit = getPlanSeatLimit(plan);
      return localizationKeys('organizationProfile.plansPage.alerts.planMembershipLimitExceeded', {
        count: organization.membersCount + organization.pendingInvitationsCount,
        limit: seatLimit as number,
      });
    }
    return null;
  })();
  const { shouldShowFooter, shouldShowFooterNotice } = getPricingFooterState({
    subscription,
    plan,
    planPeriod,
    for: props.for,
    hasActiveOrganization: !!organization,
  });
  const totalFeatures = plan.features.length;
  const hasMoreFeatures = totalFeatures > (isCompact ? 3 : 8);
  const ctaPosition = props.ctaPosition || ctxCtaPosition || 'bottom';

  return {
    id: plan.id,
    slug: plan.slug,
    highlighted: plan.slug === highlightedPlan,
    planPeriod,
    setPlanPeriod,
    selectPlan: (event: React.MouseEvent<HTMLElement>) => onSelect(planId, event),
    header,
    seatCost,
    isCompact,
    hasFeatures: totalFeatures > 0,
    hasSeatFeatures: !!getSeatUnitPrice(plan),
    hasMoreFeatures,
    features: plan.features.slice(0, hasMoreFeatures ? (isCompact ? 3 : 8) : totalFeatures).map(feature => ({
      id: feature.id,
      slug: feature.slug,
      name: feature.name,
    })),
    showSeatCost: !!(
      plan.unitPrices &&
      plan.unitPrices.length > 0 &&
      (plan.hasBaseFee || plan.unitPrices[0].tiers.length > 0)
    ),
    ctaPosition,
    collapseFeatures: props.collapseFeatures || false,
    shouldShowFooter,
    shouldShowFooterNotice: shouldShowFooterNotice && !!subscription,
    subscriptionStatus: subscription
      ? subscription.isFreeTrial
        ? ('free_trial' as const)
        : subscription.status
      : null,
    footerNoticeKey:
      shouldShowFooterNotice && subscription
        ? plan.freeTrialEnabled && subscription.isFreeTrial && subscription.periodEnd
          ? localizationKeys('badge__trialEndsAt', { date: new Date(subscription.periodEnd.getTime()) })
          : localizationKeys('badge__startsAt', { date: new Date(subscription.periodStart.getTime()) })
        : null,
    footerButtonProps:
      shouldShowFooter && !(shouldShowFooterNotice && subscription)
        ? buttonPropsForPlan({ plan, organization, isCompact, selectedPlanPeriod: planPeriod })
        : null,
    footerButtonTooltipText,
    showPlanDetails: event => onShowDetails(planId, event),
  };
};
