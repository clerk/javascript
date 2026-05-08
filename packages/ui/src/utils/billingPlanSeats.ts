import type {
  BillingPerUnitTotal,
  BillingPerUnitTotalTier,
  BillingPlanResource,
  BillingPlanUnitPrice,
  OrganizationResource,
} from '@clerk/shared/types';

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
 * Similar to the above, given a checkout totals, return the unit price for seats.
 */
export const getCheckoutSeatUnitTotal = (checkout: {
  perUnitTotals?: BillingPerUnitTotal[];
}): BillingPerUnitTotal | null => {
  if (!checkout.perUnitTotals?.length) {
    return null;
  }

  const seatUnitPrice = checkout.perUnitTotals.find(unitTotal => unitTotal.name === 'seats');

  if (seatUnitPrice) {
    return seatUnitPrice;
  }

  return null;
};

/**
 * Given a checkout unit total, return the unit total tier that represents per-seat costs. If no tier is found, return null.
 */
export const getPaidSeatsUnitTotalTier = (unitTotal: BillingPerUnitTotal | null): BillingPerUnitTotalTier | null => {
  if (!unitTotal) {
    return null;
  }

  if (unitTotal.tiers.length === 1 && unitTotal.tiers[0].feePerBlock.amount > 0) {
    return unitTotal.tiers[0];
  }

  if (
    unitTotal.tiers.length === 2 &&
    unitTotal.tiers[0].feePerBlock.amount === 0 &&
    unitTotal.tiers[1].feePerBlock.amount > 0
  ) {
    return unitTotal.tiers[1];
  }

  return null;
};

/**
 * Given a checkout unit total, return the unit total tier that represents included seats. If no tier is found, return null.
 */
export const getIncludedSeatsUnitTotalTier = (
  unitTotal: BillingPerUnitTotal | null,
): BillingPerUnitTotalTier | null => {
  if (!unitTotal) {
    return null;
  }

  if (
    unitTotal.tiers.length === 2 &&
    unitTotal.tiers[0].feePerBlock.amount === 0 &&
    unitTotal.tiers[1].feePerBlock.amount > 0
  ) {
    return unitTotal.tiers[0];
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

export const isPlanWithPerSeatCosts = (plan: BillingPlanResource): boolean => {
  const seatUnitPrice = getSeatUnitPrice(plan);

  if (!seatUnitPrice) {
    return false;
  }

  if (seatUnitPrice.tiers.length === 1 && seatUnitPrice.tiers[0].feePerBlock.amount > 0) {
    return true;
  }

  if (seatUnitPrice.tiers.length === 2 && seatUnitPrice.tiers[1].feePerBlock.amount > 0) {
    return true;
  }

  return false;
};
