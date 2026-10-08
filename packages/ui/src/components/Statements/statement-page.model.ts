import { __internal_useStatementQuery } from '@clerk/shared/react/index';

import { getDiscountDescription } from '@/ui/utils/billing';
import { formatDate } from '@/ui/utils/formatDate';

import { useSubscriberTypeContext, useSubscriberTypeLocalizationRoot } from '../../contexts/components';
import { localizationKeys, useLocalizations } from '../../customizables';
import { useRouter } from '../../router';
import type { StatementPageData } from './statements.types';

export const useStatementPageModel = (): StatementPageData => {
  const { params, navigate } = useRouter();
  const subscriberType = useSubscriberTypeContext();
  const localizationRoot = useSubscriberTypeLocalizationRoot();
  const { t, translateError, $ } = useLocalizations();
  const {
    data: statement,
    isLoading,
    error,
  } = __internal_useStatementQuery({
    statementId: params.statementId,
    for: subscriberType === 'organization' ? 'organization' : 'user',
    enabled: Boolean(params.statementId),
  });

  return {
    isLoading,
    localizationRoot,
    errorText:
      isLoading || statement
        ? ''
        : error
          ? translateError(error.errors[0])
          : t(localizationKeys(`${localizationRoot}.billingPage.statementsSection.notFound`)),
    statement:
      !isLoading && statement
        ? {
            id: statement.id,
            status: statement.status,
            title: formatDate(statement.timestamp, 'monthyear'),
            totalPaid: $(statement.totals.grandTotal),
            sections: statement.groups.map(group => ({
              id: group.timestamp.toISOString(),
              title: formatDate(group.timestamp, 'long'),
              items: group.items.map(item => {
                const plan = item.subscriptionItem.plan;
                const planPeriod = item.subscriptionItem.planPeriod;
                const proration = item.totals?.discounts?.proration;
                const discount = item.totals?.discounts?.discount;
                const creditProration = item.subscriptionItem.credits?.proration;
                const payerCredit = item.subscriptionItem.credits?.payer;

                return {
                  id: item.id,
                  planName: plan.name,
                  planPeriod,
                  chargeType: item.chargeType,
                  description: `${item.subscriptionItem.amount ? $(item.subscriptionItem.amount) : ''} / ${planPeriod === 'month' ? t(localizationKeys('billing.month')) : t(localizationKeys('billing.year'))}`,
                  amount: $(item.amount),
                  prorationValue:
                    proration?.amount.amount && proration.amount.amount > 0 ? `(${$(proration.amount)})` : null,
                  discount:
                    discount?.amount.amount && discount.amount.amount > 0
                      ? {
                          label: `${discount.name} ${getDiscountDescription(discount, discount.durationInCycles, planPeriod, { $, t })}`,
                          value: `(${$(discount.amount)})`,
                        }
                      : null,
                  creditProrationValue:
                    creditProration?.amount.amount && creditProration.amount.amount > 0
                      ? `(${$(creditProration.amount)})`
                      : null,
                  payerCreditValue:
                    payerCredit?.appliedAmount.amount && payerCredit.appliedAmount.amount > 0
                      ? `(${$(payerCredit.appliedAmount)})`
                      : null,
                };
              }),
            })),
          }
        : null,
    onBack: () => void navigate('../../', { searchParams: new URLSearchParams('tab=statements') }),
    onPaymentAttempt: (id: string) => void navigate(`../../payment-attempt/${id}`),
  };
};
