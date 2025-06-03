import { Header } from '@/ui/elements/Header';

import { useStatements, useStatementsContext } from '../../contexts';
import { Box, descriptors, Spinner, Text } from '../../customizables';
import { Plus, RotateLeftRight } from '../../icons';
import { useRouter } from '../../router';
import { Statement } from './Statement';

export const StatementPage = () => {
  const { params, navigate } = useRouter();
  const { isLoading } = useStatements();
  const { getStatementById } = useStatementsContext();

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

  if (!statement) {
    return <Text>Statement not found</Text>;
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
            localizationKey='Statements'
            textVariant='h2'
          />
        </Header.BackLink>
      </Header.Root>
      <Statement.Root>
        <Statement.Header
          title={new Date(statement.timestamp).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
          id={statement.id}
          status={statement.status}
        />
        <Statement.Body>
          {statement.groups.map(group => (
            <Statement.Section key={group.timestamp}>
              <Statement.SectionHeader
                text={new Date(group.timestamp).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              />
              <Statement.SectionContent>
                {group.items.map(item => (
                  <Statement.SectionContentItem key={item.id}>
                    <Statement.SectionContentDetailsHeader
                      title={item.subscription.plan.name}
                      description={`${item.subscription.amount?.currencySymbol}${item.subscription.amount?.amountFormatted} / ${item.subscription.planPeriod === 'month' ? 'month' : 'year'}`}
                      secondaryTitle={`${item.amount.currencySymbol}${item.amount.amountFormatted}`}
                      secondaryDescription={``}
                    />
                    <Statement.SectionContentDetailsList>
                      <Statement.SectionContentDetailsListItem
                        label={
                          item.chargeType === 'recurring'
                            ? `Paid for ${item.subscription.plan.name} ${item.subscription.planPeriod} plan`
                            : `Subscribed and paid for ${item.subscription.plan.name} ${item.subscription.planPeriod} plan`
                        }
                        labelIcon={item.chargeType === 'recurring' ? RotateLeftRight : Plus}
                        value={item.id}
                        valueTruncated
                        valueCopyable
                      />
                      {item.subscription.credit && item.subscription.credit.amount.amount > 0 ? (
                        <Statement.SectionContentDetailsListItem
                          label='Prorated credit for partial usage of previous subscription '
                          value={`(${item.subscription.credit.amount.currencySymbol}${item.subscription.credit.amount.amountFormatted})`}
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
          label='Total paid'
          value={`${statement.totals.grandTotal.currencySymbol}${statement.totals.grandTotal.amountFormatted}`}
        />
      </Statement.Root>
    </>
  );
};
