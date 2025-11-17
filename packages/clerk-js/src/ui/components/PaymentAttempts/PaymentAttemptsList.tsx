import type { BillingPaymentResource } from '@clerk/shared/types';

import { DataTable, DataTableRow } from '@/ui/elements/DataTable';
import { formatDate } from '@/ui/utils/formatDate';
import { truncateWithEndVisible } from '@/ui/utils/truncateTextWithEndVisible';

import { usePaymentAttempts, useSubscriberTypeLocalizationRoot } from '../../contexts';
import { Badge, localizationKeys, Td, Text } from '../../customizables';
import { useRouter } from '../../router';

/* -------------------------------------------------------------------------------------------------
 * PaymentAttemptsList
 * -----------------------------------------------------------------------------------------------*/

export const PaymentAttemptsList = () => {
  const { data: paymentAttempts, isLoading, count } = usePaymentAttempts();
  const localizationRoot = useSubscriberTypeLocalizationRoot();

  return (
    <DataTable
      page={1}
      onPageChange={_ => {}}
      itemCount={count}
      pageCount={1}
      itemsPerPage={10}
      isLoading={isLoading}
      emptyStateLocalizationKey={localizationKeys(`${localizationRoot}.billingPage.paymentHistorySection.empty`)}
      headers={[
        localizationKeys(`${localizationRoot}.billingPage.paymentHistorySection.tableHeader__date`),
        localizationKeys(`${localizationRoot}.billingPage.paymentHistorySection.tableHeader__amount`),
        localizationKeys(`${localizationRoot}.billingPage.paymentHistorySection.tableHeader__status`),
      ]}
      rows={paymentAttempts.map(i => (
        <PaymentAttemptsListRow
          key={i.id}
          paymentAttempt={i}
        />
      ))}
    />
  );
};

const PaymentAttemptsListRow = ({ paymentAttempt }: { paymentAttempt: BillingPaymentResource }) => {
  const { id, amount, failedAt, paidAt, updatedAt, status } = paymentAttempt;
  const { navigate } = useRouter();
  const handleClick = () => {
    void navigate(`payment-attempt/${id}`);
  };
  return (
    <DataTableRow onClick={handleClick}>
      <Td
        sx={{
          cursor: 'pointer',
        }}
      >
        <Text variant='subtitle'>{formatDate(paidAt || failedAt || updatedAt, 'long')}</Text>
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
        <Text>
          {amount.currencySymbol}
          {amount.amountFormatted}
        </Text>
      </Td>
      <Td>
        <Badge
          colorScheme={status === 'paid' ? 'success' : status === 'failed' ? 'danger' : 'primary'}
          sx={{ textTransform: 'capitalize' }}
        >
          {status}
        </Badge>
      </Td>
    </DataTableRow>
  );
};
