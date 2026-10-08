import { isClerkAPIResponseError } from '@clerk/shared/error';
import { __experimental_useCheckout as useCheckout } from '@clerk/shared/react';

import { getDiscountDescription, toNegativeAmount } from '@/ui/utils/billing';

import { localizationKeys, useLocalizations } from '../../customizables';

const promoCodeErrorMessage = (error: unknown) => {
  if (isClerkAPIResponseError(error)) {
    return error.errors[0]?.longMessage || error.errors[0]?.message;
  }
  return error instanceof Error ? error.message : undefined;
};

export const usePromoCodeUpdateModel = () => {
  const { checkout } = useCheckout();
  const { t } = useLocalizations();

  return {
    updatePromoCode: async (value: string) => {
      const result = await checkout.update({ promoCode: value });
      return result.error
        ? {
            success: false,
            error:
              promoCodeErrorMessage(result.error) || t(localizationKeys('unstable__errors.form_param_value_invalid')),
          }
        : { success: true, error: undefined };
    },
  };
};

export const useAppliedPromoCodeModel = () => {
  const { checkout } = useCheckout();
  const { $, t } = useLocalizations();
  const update = usePromoCodeUpdateModel();
  const discount = checkout.status === 'needs_confirmation' ? checkout.totals.discounts?.discount : undefined;
  const appliedPromoCode = discount?.promoCode;

  return {
    promoCode: appliedPromoCode,
    description:
      appliedPromoCode && checkout.planPeriod
        ? getDiscountDescription(discount, discount.cyclesRemaining, checkout.planPeriod, { $, t })
        : undefined,
    amount: appliedPromoCode ? $(toNegativeAmount(discount.amount)) : undefined,
    removeLabel: t(localizationKeys('billing.checkout.removePromoCode')),
    updatePromoCode: update.updatePromoCode,
  };
};

export const usePromoCodeInputModel = () => {
  const { checkout } = useCheckout();
  const { t } = useLocalizations();
  const update = usePromoCodeUpdateModel();

  return {
    show: checkout.status === 'needs_confirmation' && !checkout.totals.discounts?.discount,
    placeholder: t(localizationKeys('billing.checkout.promoCodePlaceholder')),
    updatePromoCode: update.updatePromoCode,
  };
};
