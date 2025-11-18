import { useClerk, useOrganization } from '@clerk/shared/react';
import useSWR from 'swr';

import { Alert } from '@/ui/elements/Alert';
import { Header } from '@/ui/elements/Header';
import { formatDate } from '@/ui/utils/formatDate';

import { useSubscriberTypeContext, useSubscriberTypeLocalizationRoot } from '../../contexts/components';
import {
  Box,
  descriptors,
  Icon,
  localizationKeys,
  SimpleButton,
  Span,
  Spinner,
  useLocalizations,
} from '../../customizables';
import { ArrowRightIcon, Plus, RotateLeftRight } from '../../icons';
import { useRouter } from '../../router';
import { Statement } from './Statement';

export const StatementPage = () => {
  const { params, navigate } = useRouter();
  const subscriberType = useSubscriberTypeContext();
  const { organization } = useOrganization();
  const localizationRoot = useSubscriberTypeLocalizationRoot();
  const { t, translateError } = useLocalizations();
  const clerk = useClerk();

  // TODO: Replace useSWR with the react-query equivalent.
  const {
    data: statement,
    isLoading,
    error,
  } = useSWR(
    params.statementId
      ? {
          type: 'statement',
          id: params.statementId,
          orgId: subscriberType === 'organization' ? organization?.id : undefined,
        }
      : null,
    () =>
      clerk.billing.getStatement({
        id: params.statementId,
        orgId: subscriberType === 'organization' ? organization?.id : undefined,
      }),
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spinner
          colorScheme='primary'
          sx={{ margin: 'auto', display: 'block' }}
          elementDescriptor={descriptors.spinner}
        />
      </Box>
    );
  }

  return (
    <>
      <Header.Root
        sx={t => ({
          borderBlockEndWidth: t.borderWidths.$normal,
          borderBlockEndStyle: t.borderStyles.$solid,
          borderBlockEndColor: t.colors.$borderAlpha100,
          marginBlockEnd: t.space.$4,
          paddingBlockEnd: t.space.$4,
        })}
      >
        <Header.BackLink
          onClick={() => void navigate('../../', { searchParams: new URLSearchParams('tab=statements') })}
        >
          <Header.Title
            localizationKey={localizationKeys(`${localizationRoot}.billingPage.statementsSection.title`)}
            textVariant='h2'
          />
        </Header.BackLink>
      </Header.Root>
      {!statement ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Alert
            variant='danger'
            colorScheme='danger'
          >
            {error
              ? translateError(error.errors[0])
              : t(localizationKeys(`${localizationRoot}.billingPage.statementsSection.notFound`))}
          </Alert>
        </Box>
      ) : (
        <Statement.Root>
          <Statement.Header
            title={formatDate(statement.timestamp, 'monthyear')}
            id={statement.id}
            status={statement.status}
          />
          <Statement.Body>
            {statement.groups.map(group => (
              <Statement.Section key={group.timestamp.toISOString()}>
                <Statement.SectionHeader text={formatDate(group.timestamp, 'long')} />
                <Statement.SectionContent>
                  {group.items.map(item => (
                    <Statement.SectionContentItem key={item.id}>
                      <Statement.SectionContentDetailsHeader
                        title={item.subscriptionItem.plan.name}
                        description={`${item.subscriptionItem.amount?.currencySymbol}${item.subscriptionItem.amount?.amountFormatted} / ${item.subscriptionItem.planPeriod === 'month' ? t(localizationKeys('billing.month')) : t(localizationKeys('billing.year'))}`}
                        secondaryTitle={`${item.amount.currencySymbol}${item.amount.amountFormatted}`}
                      />
                      <Statement.SectionContentDetailsList>
                        <Statement.SectionContentDetailsListItem
                          label={
                            item.chargeType === 'recurring'
                              ? localizationKeys(
                                  `${localizationRoot}.billingPage.statementsSection.itemCaption__paidForPlan`,
                                  {
                                    plan: item.subscriptionItem.plan.name,
                                    period: item.subscriptionItem.planPeriod,
                                  },
                                )
                              : localizationKeys(
                                  `${localizationRoot}.billingPage.statementsSection.itemCaption__subscribedAndPaidForPlan`,
                                  {
                                    plan: item.subscriptionItem.plan.name,
                                    period: item.subscriptionItem.planPeriod,
                                  },
                                )
                          }
                          labelIcon={item.chargeType === 'recurring' ? RotateLeftRight : Plus}
                          value={
                            <SimpleButton
                              onClick={() => void navigate(`../../payment-attempt/${item.id}`)}
                              variant='link'
                              colorScheme='primary'
                              textVariant='buttonSmall'
                              sx={t => ({
                                gap: t.space.$1,
                              })}
                            >
                              <Span localizationKey={localizationKeys('billing.viewPayment')} />
                              <Icon
                                icon={ArrowRightIcon}
                                size='sm'
                                aria-hidden
                              />
                            </SimpleButton>
                          }
                        />
                        {item.subscriptionItem.credit && item.subscriptionItem.credit.amount.amount > 0 ? (
                          <Statement.SectionContentDetailsListItem
                            label={localizationKeys(
                              `${localizationRoot}.billingPage.statementsSection.itemCaption__proratedCredit`,
                            )}
                            value={`(${item.subscriptionItem.credit.amount.currencySymbol}${item.subscriptionItem.credit.amount.amountFormatted})`}
                          />
                        ) : null}
                      </Statement.SectionContentDetailsList>
                    </Statement.SectionContentItem>
                  ))}
                </Statement.SectionContent>
              </Statement.Section>
            ))}
          </Statement.Body>
          <Statement.Footer
            label={localizationKeys(`${localizationRoot}.billingPage.statementsSection.totalPaid`)}
            value={`${statement.totals.grandTotal.currencySymbol}${statement.totals.grandTotal.amountFormatted}`}
          />
        </Statement.Root>
      )}
    </>
  );
};
