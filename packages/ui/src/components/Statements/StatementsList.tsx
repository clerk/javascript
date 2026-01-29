import type { BillingStatementResource } from '@clerk/shared/types';

import { useStatements, useSubscriberTypeLocalizationRoot } from '@/contexts';
import { DataTable, DataTableRow } from '@/ui/elements/DataTable';
import { formatDate } from '@/ui/utils/formatDate';

import { localizationKeys, Td, Text } from '../../customizables';
import { useRouter } from '../../router';
import { truncateWithEndVisible } from '../../utils/truncateTextWithEndVisible';

/* -------------------------------------------------------------------------------------------------
 * StatementsList
 * -----------------------------------------------------------------------------------------------*/

export const StatementsList = () => {
  const { data: statements, isLoading, count } = useStatements();
  const localizationRoot = useSubscriberTypeLocalizationRoot();

  return (
    <DataTable
      page={1}
      onPageChange={_ => {}}
      itemCount={count}
      pageCount={1}
      itemsPerPage={10}
      isLoading={isLoading}
      emptyStateLocalizationKey={localizationKeys(`${localizationRoot}.billingPage.statementsSection.empty`)}
      headers={[
        localizationKeys(`${localizationRoot}.billingPage.statementsSection.tableHeader__date`),
        localizationKeys(`${localizationRoot}.billingPage.statementsSection.tableHeader__amount`),
      ]}
      rows={statements.map(i => (
        <StatementsListRow
          key={i.id}
          statement={i}
        />
      ))}
    />
  );
};

const StatementsListRow = ({ statement }: { statement: BillingStatementResource }) => {
  const {
    timestamp,
    id,
    totals: { grandTotal },
  } = statement;
  const { navigate } = useRouter();
  const handleClick = () => {
    void navigate(`statement/${id}`);
  };
  return (
    <DataTableRow onClick={handleClick}>
      <Td
        sx={{
          cursor: 'pointer',
        }}
      >
        <Text variant='subtitle'>{formatDate(timestamp, 'monthyear')}</Text>
        <Text
          colorScheme='secondary'
          variant='caption'
          truncate
          sx={t => ({ marginTop: t.space.$0x5 })}
        >
          {truncateWithEndVisible(id)}
        </Text>
      </Td>
      <Td
        sx={{
          cursor: 'pointer',
        }}
      >
        <Text colorScheme='secondary'>
          {grandTotal.currencySymbol}
          {grandTotal.amountFormatted}
        </Text>
      </Td>
    </DataTableRow>
  );
};
