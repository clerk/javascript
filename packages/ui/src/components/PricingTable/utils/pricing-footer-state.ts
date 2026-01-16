import type {
  BillingPlanResource,
  BillingSubscriptionItemResource,
  BillingSubscriptionPlanPeriod,
} from '@clerk/shared/types';

type UsePricingFooterStateParams = {
  subscription: BillingSubscriptionItemResource | undefined;
  plan: BillingPlanResource;
  planPeriod: BillingSubscriptionPlanPeriod;
  for?: 'user' | 'organization';
  hasActiveOrganization: boolean;
};

/**
 * Calculates the correct show/hide state for the footer of a card in the `<PricingTableDefault/>` component.
 * @returns [shouldShowFooter, shouldShowFooterNotice]
 */
const valueResolution = (params: UsePricingFooterStateParams): [boolean, boolean] => {
  const { subscription, plan, planPeriod, for: forWhom, hasActiveOrganization } = params;
  const show_with_notice: [boolean, boolean] = [true, true];
  const show_without_notice: [boolean, boolean] = [true, false];
  const hide: [boolean, boolean] = [false, false];

  // No subscription
  if (!subscription) {
    if (forWhom === 'organization' && !hasActiveOrganization) {
      return hide;
    }
    return show_without_notice;
  }

  // Upcoming subscription
  if (subscription.status === 'upcoming') {
    return show_with_notice;
  }

  // Active subscription
  if (subscription.status === 'active') {
    const isCanceled = !!subscription.canceledAt;
    const isSwitchingPaidPeriod = planPeriod !== subscription.planPeriod && Boolean(plan.annualMonthlyFee);
    const isActiveFreeTrial = plan.freeTrialEnabled && subscription.isFreeTrial;

    if (isCanceled || isSwitchingPaidPeriod) {
      return show_without_notice;
    }

    if (isActiveFreeTrial) {
      return show_with_notice;
    }

    return hide;
  }
  return hide;
};

export const getPricingFooterState = (
  params: UsePricingFooterStateParams,
): { shouldShowFooter: boolean; shouldShowFooterNotice: boolean } => {
  const [shouldShowFooter, shouldShowFooterNotice] = valueResolution(params);
  return { shouldShowFooter, shouldShowFooterNotice };
};
