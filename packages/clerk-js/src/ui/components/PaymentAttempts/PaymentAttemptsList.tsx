import type { CommercePaymentResource } from '@clerk/types';
import React from 'react';

import { Pagination } from '@/ui/elements/Pagination';

import { usePaymentAttempts, useSubscriberTypeLocalizationRoot } from '../../contexts';
import type { LocalizationKey } from '../../customizables';
import {
  Badge,
  Col,
  descriptors,
  Flex,
  localizationKeys,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '../../customizables';
import { useRouter } from '../../router';
import type { PropsOfComponent } from '../../styledSystem';
import { formatDate, truncateWithEndVisible } from '../../utils';

/* -------------------------------------------------------------------------------------------------
 * PaymentAttemptsList
 * -----------------------------------------------------------------------------------------------*/

export const PaymentAttemptsList = () => {
  const { data: paymentAttempts, isLoading } = usePaymentAttempts();
  const localizationRoot = useSubscriberTypeLocalizationRoot();

  return (
    <DataTable
      page={1}
      onPageChange={_ => {}}
      itemCount={paymentAttempts?.total_count || 0}
      pageCount={1}
      itemsPerPage={10}
      isLoading={isLoading}
      emptyStateLocalizationKey={localizationKeys(`${localizationRoot}.billingPage.paymentHistorySection.empty`)}
      headers={[
        localizationKeys(`${localizationRoot}.billingPage.paymentHistorySection.tableHeader__date`),
        localizationKeys(`${localizationRoot}.billingPage.paymentHistorySection.tableHeader__amount`),
        localizationKeys(`${localizationRoot}.billingPage.paymentHistorySection.tableHeader__status`),
      ]}
      rows={(paymentAttempts?.data || []).map(i => (
        <PaymentAttemptsListRow
          key={i.id}
          paymentAttempt={i}
        />
      ))}
    />
  );
};

const PaymentAttemptsListRow = ({ paymentAttempt }: { paymentAttempt: CommercePaymentResource }) => {
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
        <Text variant='subtitle'>{formatDate(new Date(paidAt || failedAt || updatedAt), 'long')}</Text>
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

/* -------------------------------------------------------------------------------------------------
 * DataTable
 * -----------------------------------------------------------------------------------------------*/

type DataTableProps = {
  headers: (LocalizationKey | string)[];
  rows: React.ReactNode[];
  isLoading?: boolean;
  page: number;
  onPageChange: (page: number) => void;
  itemCount: number;
  emptyStateLocalizationKey: LocalizationKey | string;
  pageCount: number;
  itemsPerPage: number;
};

const DataTable = (props: DataTableProps) => {
  const {
    headers,
    page,
    onPageChange,
    rows,
    isLoading,
    itemCount,
    itemsPerPage,
    pageCount,
    emptyStateLocalizationKey,
  } = props;

  const startingRow = itemCount > 0 ? Math.max(0, (page - 1) * itemsPerPage) + 1 : 0;
  const endingRow = Math.min(page * itemsPerPage, itemCount);

  return (
    <Col
      gap={4}
      sx={{ width: '100%' }}
    >
      <Flex sx={t => ({ overflowX: 'auto', padding: t.space.$1 })}>
        <Table sx={{ tableLayout: 'fixed' }}>
          <Thead>
            <Tr>
              {headers.map((h, index) => (
                <Th
                  elementDescriptor={descriptors.tableHead}
                  key={index}
                  localizationKey={h}
                  sx={{ width: index === 0 ? 'auto' : '25%' }}
                />
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Tr>
                <Td colSpan={4}>
                  <Spinner
                    colorScheme='primary'
                    sx={{ margin: 'auto', display: 'block' }}
                    elementDescriptor={descriptors.spinner}
                  />
                </Td>
              </Tr>
            ) : !rows.length ? (
              <DataTableEmptyRow
                key='empty'
                localizationKey={emptyStateLocalizationKey}
              />
            ) : (
              rows
            )}
          </Tbody>
        </Table>
      </Flex>
      {pageCount > 1 && (
        <Pagination
          count={pageCount}
          page={page}
          onChange={onPageChange}
          siblingCount={1}
          rowInfo={{
            allRowsCount: itemCount,
            startingRow,
            endingRow,
          }}
        />
      )}
    </Col>
  );
};

const DataTableEmptyRow = (props: { localizationKey: LocalizationKey | string }) => {
  return (
    <Tr>
      <Td colSpan={4}>
        <Text
          localizationKey={props.localizationKey}
          sx={{
            margin: 'auto',
            display: 'block',
            width: 'fit-content',
          }}
        />
      </Td>
    </Tr>
  );
};

const DataTableRow = (props: PropsOfComponent<typeof Tr>) => {
  return (
    <Tr
      {...props}
      sx={t => ({ ':hover': { backgroundColor: t.colors.$neutralAlpha50 } })}
    />
  );
};
