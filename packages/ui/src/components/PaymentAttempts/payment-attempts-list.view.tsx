import { DataTable, DataTableRow } from '@/ui/elements/DataTable';
import { truncateWithEndVisible } from '@/ui/utils/truncateTextWithEndVisible';

import { Badge, localizationKeys, Td, Text } from '../../customizables';
import type { PaymentAttemptsListData } from './payment-attempt.types';

export const PaymentAttemptsListView = ({ isLoading, count, localizationRoot, rows }: PaymentAttemptsListData) => (
  <DataTable
    page={1}
    onPageChange={_ => {}}
    itemCount={count}
    pageCount={1}
    itemsPerPage={10}
    isLoading={isLoading}
    emptyStateLocalizationKey={localizationKeys(`${localizationRoot}.billingPage.paymentHistorySection.empty`)}
    headers={[
      { key: localizationKeys(`${localizationRoot}.billingPage.paymentHistorySection.tableHeader__date`) },
      { key: localizationKeys(`${localizationRoot}.billingPage.paymentHistorySection.tableHeader__amount`) },
      { key: localizationKeys(`${localizationRoot}.billingPage.paymentHistorySection.tableHeader__status`) },
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
          <Text>{row.amount}</Text>
        </Td>
        <Td>
          <Badge
            colorScheme={row.status === 'paid' ? 'success' : row.status === 'failed' ? 'danger' : 'primary'}
            sx={{ textTransform: 'capitalize' }}
          >
            {row.status}
          </Badge>
        </Td>
      </DataTableRow>
    ))}
  />
);
