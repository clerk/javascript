import { StatementsContextProvider, useStatementsContext } from '../../contexts';
import { Box, descriptors, Spinner, Text } from '../../customizables';
import { Header } from '../../elements';
import { Block, Plus } from '../../icons';
import { useRouter } from '../../router';
import { Statement } from './Statement';

const StatementPageInternal = () => {
  const { params, navigate } = useRouter();
  const { getInvoiceById, isLoading } = useStatementsContext();
  const statement = params.statementId ? getInvoiceById(params.statementId) : null;

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
          title='January 2025'
          id={statement.id}
          status={statement.status}
        />
        <Statement.Body>
          <Statement.Section>
            <Statement.SectionHeader text='Jan 9, 2025' />
            <Statement.SectionContent>
              <Statement.SectionContentItem>
                <Statement.SectionContentDetailsList>
                  <Statement.SectionContentDetailsListItem
                    labelIcon={Plus}
                    label='Subscribed and paid for Platinum annual plan'
                    value={statement?.id}
                    valueTruncated
                    valueCopyable
                  />
                  <Statement.SectionContentDetailsListItem
                    labelIcon={Block}
                    label='Rebate for partial usage of previous subscription'
                    value='-$100.00'
                  />
                </Statement.SectionContentDetailsList>
              </Statement.SectionContentItem>
              <Statement.SectionContentItem>
                <Statement.SectionContentDetailsHeader
                  title='Platinum'
                  description='$1,800.00 / year'
                  secondaryTitle='$1,584.71'
                  secondaryDescription='Prorated'
                />
                <Statement.SectionContentDetailsList>
                  <Statement.SectionContentDetailsListItem
                    label='Canceled Gold monthly subscription'
                    value='-$100.00'
                  />
                </Statement.SectionContentDetailsList>
              </Statement.SectionContentItem>
            </Statement.SectionContent>
          </Statement.Section>
          <Statement.Section>
            <Statement.SectionHeader text='Jan 9, 2025' />
            <Statement.SectionContent>
              <Statement.SectionContentItem>
                <Statement.SectionContentDetailsList>
                  <Statement.SectionContentDetailsListItem
                    label='Paid for Gold monthly plan'
                    value={statement?.id}
                    valueTruncated
                    valueCopyable
                  />
                </Statement.SectionContentDetailsList>
              </Statement.SectionContentItem>
            </Statement.SectionContent>
          </Statement.Section>
        </Statement.Body>
        <Statement.Footer
          label='Total paid'
          value='$299.00'
        />
      </Statement.Root>
    </>
  );
};

export const StatementPage = () => {
  return (
    <StatementsContextProvider>
      <StatementPageInternal />
    </StatementsContextProvider>
  );
};
