import { __experimental_useCheckout as useCheckout } from '@clerk/shared/react';

import { useCheckoutContext } from '../../contexts';
import { localizationKeys, useLocalizations } from '../../customizables';
import type { CheckoutGenericErrorData, CheckoutInvalidPlanData } from './checkout.types';

export const useCheckoutGenericErrorModel = (): CheckoutGenericErrorData => {
  const { errors } = useCheckout();
  const { translateError } = useLocalizations();
  const { t } = useLocalizations();

  return {
    message: errors.global
      ? translateError(errors.global[0])
      : t(localizationKeys('unstable__errors.form_param_value_invalid')),
  };
};

export const useCheckoutInvalidPlanModel = (): CheckoutInvalidPlanData => {
  const { planPeriod } = useCheckoutContext();
  const { errors } = useCheckout();

  const invalidPlanError = errors?.global
    ?.filter(error => error.isClerkAPIResponseError())
    .flatMap(error => error.errors)
    .find(error => error.code === 'invalid_plan_change');

  if (!invalidPlanError) {
    return { status: 'hidden' as const };
  }

  const { plan: planFromError, isPlanUpgradePossible } = invalidPlanError?.meta || {};

  return {
    status: 'ready' as const,
    planName: planFromError.name,
    isAnnual: planPeriod === 'annual',
    isMonthly: planPeriod === 'month',
    currencySymbol: planFromError.currency_symbol,
    amountFormatted: planFromError.amount_formatted,
    annualMonthlyAmountFormatted: planFromError.annual_monthly_amount_formatted,
    isPlanUpgradePossible,
  };
};

export const useCheckoutAddEmailModel = () => {
  const { checkout } = useCheckout();
  return { restartCheckout: () => void checkout.start() };
};
