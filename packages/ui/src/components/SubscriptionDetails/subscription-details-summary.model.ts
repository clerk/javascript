import { useSubscription } from '../../contexts';
import { localizationKeys, useLocalizations } from '../../customizables';
import { formatDate } from '../../utils/formatDate';
import type { SubscriptionDetailsSummaryData } from './subscription-details.types';

export const useSubscriptionDetailsSummaryModel = (): SubscriptionDetailsSummaryData | null => {
  const { data: subscription, subscriptionItems } = useSubscription();
  const { $ } = useLocalizations();
  const activeSubscription = subscriptionItems?.find(item => item.status === 'active');

  if (!subscription?.nextPayment || !activeSubscription) {
    return null;
  }

  const { nextPayment } = subscription;
  const paymentPrefix = activeSubscription.isFreeTrial ? 'firstPayment' : 'nextPayment';

  return {
    billingCycle:
      activeSubscription.planPeriod === 'month'
        ? localizationKeys('billing.monthly')
        : localizationKeys('billing.annually'),
    paymentDateLabel: localizationKeys(`billing.subscriptionDetails.${paymentPrefix}On`),
    paymentDate: formatDate(nextPayment.date),
    paymentAmountLabel: localizationKeys(`billing.subscriptionDetails.${paymentPrefix}Amount`),
    paymentCurrency: nextPayment.amount.currency,
    paymentAmount: $(nextPayment.amount),
  };
};
