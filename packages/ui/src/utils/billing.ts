import type { BillingMoneyAmount } from '@clerk/shared/types/billing';

/**
 * Given a BillingMoneyAmount, convert positive values to negative. If the amount is already negative, leave it alone.
 */
export function toNegativeAmount(amount: BillingMoneyAmount): BillingMoneyAmount {
  if (amount.amount < 0) {
    return amount;
  }

  return {
    ...amount,
    // convert positive amounts to negative
    amount: -amount.amount,
    // naively converts amountFormatted
    amountFormatted: `-${amount.amountFormatted}`,
  };
}
