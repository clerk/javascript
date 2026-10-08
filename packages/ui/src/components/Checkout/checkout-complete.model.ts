import { __experimental_useCheckout as useCheckout } from '@clerk/shared/react';

import { formatDate } from '@/ui/utils/formatDate';

import { useCheckoutContext } from '../../contexts';
import { useLocalizations } from '../../customizables';
import { useRouter } from '../../router';
import type { CheckoutCompleteModel } from './checkout.types';

const capitalize = (name: string) => name[0].toUpperCase() + name.slice(1);

export const useCheckoutCompleteModel = (): CheckoutCompleteModel => {
  const router = useRouter();
  const { newSubscriptionRedirectUrl } = useCheckoutContext();
  const { checkout } = useCheckout();
  const { totals, paymentMethod, planPeriodStart, freeTrialEndsAt } = checkout;
  const { $ } = useLocalizations();
  const isPayment = Boolean(totals?.totalDueNow && totals.totalDueNow.amount > 0);
  const showPaymentMethod = Boolean((totals?.totalDueNow && totals.totalDueNow.amount > 0) || freeTrialEndsAt !== null);

  const paymentOrStartText = !totals
    ? ''
    : showPaymentMethod
      ? paymentMethod
        ? paymentMethod.paymentType !== 'card'
          ? paymentMethod.paymentType
            ? `${capitalize(paymentMethod.paymentType)}`
            : '–'
          : paymentMethod.cardType
            ? `${capitalize(paymentMethod.cardType)} ⋯ ${paymentMethod.last4}`
            : '–'
        : '–'
      : planPeriodStart
        ? formatDate(new Date(planPeriodStart))
        : '–';

  return {
    hasTotals: Boolean(totals),
    hasTotalDueNow: Boolean(totals?.totalDueNow),
    isPayment,
    hasFreeTrial: Boolean(freeTrialEndsAt),
    showPaymentMethod,
    totalPaidText: totals?.totalDueNow ? $(totals.totalDueNow) : '',
    freeTrialEndText: totals && freeTrialEndsAt ? formatDate(freeTrialEndsAt) : '',
    paymentOrStartText,
    navigateOnClose: () => {
      if (newSubscriptionRedirectUrl) {
        void router.navigate(newSubscriptionRedirectUrl);
      }
    },
  };
};
