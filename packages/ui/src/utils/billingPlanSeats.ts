import type { BillingPlanResource, BillingPlanUnitPrice, OrganizationResource } from '@clerk/shared/types';

/**
 * Given a plan, return the unit price for seats.
 */
export const getSeatUnitPrice = (plan: { unitPrices?: BillingPlanUnitPrice[] }): BillingPlanUnitPrice | null => {
  if (!plan.unitPrices?.length) {
    return null;
  }

  const seatUnitPrice = plan.unitPrices.find(unitPrice => unitPrice.name === 'seats');

  if (seatUnitPrice) {
    return seatUnitPrice;
  }

  return null;
};

/**
 * Given a plan, return the seat limit for the plan, or undefined if the plan does not have a seat limit.
 */
export const getPlanSeatLimit = (plan: BillingPlanResource): number | null | undefined => {
  const seatUnitPrice = getSeatUnitPrice(plan);

  if (!seatUnitPrice?.tiers.length) {
    return undefined;
  }

  return seatUnitPrice.tiers[seatUnitPrice.tiers.length - 1]?.endsAfterBlock;
};

/**
 * Given a plan and an organization, return true if the organization exceeds the seat limit for the plan.
 */
export const organizationExceedsPlanSeatLimit = (
  plan: BillingPlanResource,
  organization: OrganizationResource,
): boolean => {
  const seatLimit = getPlanSeatLimit(plan);

  if (seatLimit === undefined || seatLimit === null) {
    return false;
  }

  return organization.membersCount + organization.pendingInvitationsCount > seatLimit;
};
