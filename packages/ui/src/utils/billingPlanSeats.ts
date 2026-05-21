import type {
  BillingPaymentTotals,
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
 * Given payment totals, return the per-unit total entry for seats, if present.
 */
export const getSeatsPerUnitTotal = (
  totals: BillingPaymentTotals | null | undefined,
): BillingPerUnitTotal | undefined => {
  return totals?.perUnitTotals?.find(unitTotal => unitTotal.name.toLowerCase() === 'seats');
};

export type SeatChargeSummary = {
  /**
   * Sum of `quantity` across all tiers (paid + included) — the seats accounted for in this
   * breakdown. In every case where this helper returns a non-null summary, the backend guarantees
   * `totalSeats` equals the org's occupied seat count (right-sizing only inflates counts when
   * occupancy is entirely within a free tier, which is a case this helper short-circuits on).
   */
  totalSeats: number;
  /** Sum of `quantity` across $0 (included) tiers. `0` when the plan has no included seats. */
  included: number;
  /** The first tier with `feePerBlock > 0`. Used for the rate and total. */
  paidTier: BillingPerUnitTotalTier;
};

/**
 * Summarize a seats per-unit total for display in a payment breakdown.
 *
 * Returns `null` when there is no paid quantity to charge for — either because the plan has no
 * per-seat pricing at all (only a seat limit), or because the org's occupied seats fall entirely
 * within the included tier (right-sized by the backend so the only tier carries `feePerBlock = $0`).
 *
 * Returns `{ totalSeats, included, paidTier }` otherwise.
 */
export const summarizeSeatCharges = (seatsTotal: BillingPerUnitTotal | null | undefined): SeatChargeSummary | null => {
  if (!seatsTotal) return null;
  const paidTier = seatsTotal.tiers.find(tier => tier.feePerBlock.amount > 0);
  if (!paidTier) return null;
  let totalSeats = 0;
  let included = 0;
  for (const tier of seatsTotal.tiers) {
    if (tier.quantity === null) continue;
    totalSeats += tier.quantity;
    if (tier.feePerBlock.amount === 0) {
      included += tier.quantity;
    }
  }
  return { totalSeats, included, paidTier };
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
 * Given a plan, return the seat limit for the plan in seats (not blocks), or `null` if seats are
 * unlimited, or `undefined` if the plan has no seat-based pricing.
 */
export const getPlanSeatLimit = (plan: BillingPlanResource): number | null | undefined => {
  const seatUnitPrice = getSeatUnitPrice(plan);

  if (!seatUnitPrice?.tiers.length) {
    return undefined;
  }

  const lastTier = seatUnitPrice.tiers[seatUnitPrice.tiers.length - 1];
  return lastTier.endsAfterBlock != null ? lastTier.endsAfterBlock * seatUnitPrice.blockSize : null;
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
