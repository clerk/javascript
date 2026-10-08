import { DataTable, DataTableRow } from '@/ui/elements/DataTable';
import { truncateWithEndVisible } from '@/ui/utils/truncateTextWithEndVisible';

import { localizationKeys, Td, Text } from '../../customizables';
import type { StatementsListData } from './statements.types';

export const StatementsListView = ({ isLoading, count, localizationRoot, rows }: StatementsListData) => (
  <DataTable
    page={1}
    onPageChange={_ => {}}
    itemCount={count}
    pageCount={1}
    itemsPerPage={10}
    isLoading={isLoading}
    emptyStateLocalizationKey={localizationKeys(`${localizationRoot}.billingPage.statementsSection.empty`)}
    headers={[
      { key: localizationKeys(`${localizationRoot}.billingPage.statementsSection.tableHeader__date`) },
      { key: localizationKeys(`${localizationRoot}.billingPage.statementsSection.tableHeader__amount`) },
    ]}
    rows={rows.map(row => (
      <DataTableRow
        key={row.id}
        onClick={row.onClick}
      >
        <Td sx={{ cursor: 'pointer' }}>
          <Text variant='subtitle'>{row.date}</Text>
          <Text
            colorScheme='secondary'
            variant='caption'
            truncate
            sx={t => ({ marginTop: t.space.$0x5 })}
          >
            {truncateWithEndVisible(row.id)}
          </Text>
        </Td>
        <Td sx={{ cursor: 'pointer' }}>
          <Text colorScheme='secondary'>{row.amount}</Text>
        </Td>
      </DataTableRow>
    ))}
  />
);
