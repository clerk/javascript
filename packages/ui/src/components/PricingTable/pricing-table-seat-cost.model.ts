import type { BillingPlanResource, BillingPlanUnitPrice } from '@clerk/shared/types';

import { getSeatUnitPrice } from '@/ui/utils/billingPlanSeats';

import { localizationKeys, useLocalizations } from '../../customizables';
import type { PricingTableSeatCostData, PricingTableSeatRow } from './pricing-table-card.types';

export const usePricingTableSeatCostModel = (plan: BillingPlanResource | undefined): PricingTableSeatCostData => {
  const { t, $ } = useLocalizations();
  if (!plan) {
    return { seatRows: null };
  }
  const unitPrices = plan.unitPrices;
  const period = t(localizationKeys('billing.month'));
  const periodAbbreviation = t(localizationKeys('billing.monthAbbreviation'));

  const seatRows = (() => {
    if (!unitPrices) {
      return null;
    }

    const seatUnitPrice = getSeatUnitPrice(plan);

    if (!seatUnitPrice) {
      return null;
    }

    const formatTierFee = (tier: BillingPlanUnitPrice['tiers'][number]) => $(tier.feePerBlock, { style: 'short' });
    const getCapacityText = (endsAfterBlock: number | null) =>
      endsAfterBlock === null
        ? localizationKeys('billing.pricingTable.seatCost.unlimitedSeats')
        : localizationKeys('billing.pricingTable.seatCost.upToSeats', { endsAfterBlock });

    if (seatUnitPrice.tiers.length === 1) {
      const tier = seatUnitPrice.tiers[0];
      const rows: PricingTableSeatRow[] = [];

      if (tier.feePerBlock.amount !== 0 && plan.hasBaseFee) {
        rows.push({
          elementId: 'seats',
          icon: 'user' as const,
          text: localizationKeys('billing.pricingTable.seatCost.perSeat', {
            feePerBlockAmount: formatTierFee(tier),
            periodAbbreviation,
          }),
        });
      }

      rows.push({
        elementId: rows.length ? 'seats-limit' : 'seats',
        icon: 'users' as const,
        text: getCapacityText(tier.endsAfterBlock),
      });

      return rows;
    }

    if (seatUnitPrice.tiers.length === 2) {
      const [includedTier, additionalTier] = seatUnitPrice.tiers;

      if (
        includedTier &&
        additionalTier &&
        includedTier.feePerBlock.amount === 0 &&
        includedTier.endsAfterBlock !== null &&
        additionalTier.feePerBlock.amount !== 0
      ) {
        const additionalTierFeePerBlockAmount = formatTierFee(additionalTier);
        const tooltipPrefixText = t(
          localizationKeys(
            plan.isDefault && (plan.fee?.amount === 0 || plan.annualMonthlyFee?.amount === 0)
              ? 'billing.pricingTable.seatCost.tooltip.freeForUpToSeats'
              : 'billing.pricingTable.seatCost.tooltip.firstSeatsIncludedInPlan',
            {
              endsAfterBlock: includedTier.endsAfterBlock,
            },
          ),
        );
        const tooltipAdditionalText = t(
          localizationKeys('billing.pricingTable.seatCost.tooltip.additionalSeatsEach', {
            feePerBlockAmount: additionalTierFeePerBlockAmount,
            period,
          }),
        );

        return [
          {
            elementId: 'seats',
            icon: 'user' as const,
            text: localizationKeys('billing.pricingTable.seatCost.includedSeats', {
              includedSeats: includedTier.endsAfterBlock,
            }),
            additionalText: localizationKeys('billing.pricingTable.seatCost.additionalSeats', {
              additionalTierFeePerBlockAmount,
              periodAbbreviation,
            }),
            additionalTooltipText: `${tooltipPrefixText} ${tooltipAdditionalText}`,
          },
          {
            elementId: 'seats-limit',
            icon: 'users' as const,
            text: getCapacityText(additionalTier.endsAfterBlock),
          },
        ];
      }
    }

    return null;
  })();

  return { seatRows };
};
