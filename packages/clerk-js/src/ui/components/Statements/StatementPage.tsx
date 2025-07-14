import { Header } from '@/ui/elements/Header';
import { formatDate } from '@/ui/utils/formatDate';

import { useStatements, useStatementsContext, useSubscriberTypeLocalizationRoot } from '../../contexts';
import { Box, descriptors, localizationKeys, Spinner, Text, useLocalizations } from '../../customizables';
import { Plus, RotateLeftRight } from '../../icons';
import { useRouter } from '../../router';
import { Statement } from './Statement';

export const StatementPage = () => {
  const { params, navigate } = useRouter();
  const { isLoading } = useStatements();
  const { getStatementById } = useStatementsContext();
  const localizationRoot = useSubscriberTypeLocalizationRoot();
  const { t } = useLocalizations();
  const statement = params.statementId ? getStatementById(params.statementId) : null;

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
          borderBlockEndColor: t.colors.$neutralAlpha100,
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
        <Text
          localizationKey={localizationKeys(`${localizationRoot}.billingPage.statementsSection.notFound`)}
          sx={{ textAlign: 'center' }}
        />
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
                        description={`${item.subscriptionItem.amount?.currencySymbol}${item.subscriptionItem.amount?.amountFormatted} / ${item.subscriptionItem.planPeriod === 'month' ? t(localizationKeys('commerce.month')) : t(localizationKeys('commerce.year'))}`}
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
                          value={item.id}
                          valueTruncated
                          valueCopyable
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
