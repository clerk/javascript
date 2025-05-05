import type { CommerceInvoiceResource, CommerceInvoiceStatus } from '@clerk/types';
import React from 'react';

import { useInvoicesContext } from '../../contexts';
import type { LocalizationKey } from '../../customizables';
import {
  Badge,
  Col,
  descriptors,
  Flex,
  Link,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '../../customizables';
import { Pagination } from '../../elements';
import { useRouter } from '../../router';
import type { PropsOfComponent } from '../../styledSystem';
import { truncateWithEndVisible } from '../../utils/truncateTextWithEndVisible';

/* -------------------------------------------------------------------------------------------------
 * InvoicesList
 * -----------------------------------------------------------------------------------------------*/

export const InvoicesList = () => {
  const { invoices, isLoading, totalCount } = useInvoicesContext();

  return (
    <DataTable
      page={1}
      onPageChange={_ => {}}
      itemCount={totalCount}
      pageCount={1}
      itemsPerPage={10}
      isLoading={isLoading}
      emptyStateLocalizationKey='No invoices to display'
      headers={['Date/Invoice', 'Status', 'Total']}
      rows={invoices.map(i => (
        <InvoicesListRow
          key={i.id}
          invoice={i}
        />
      ))}
    />
  );
};

const InvoicesListRow = ({ invoice }: { invoice: CommerceInvoiceResource }) => {
  const {
    paymentDueOn,
    id,
    status,
    totals: { grandTotal },
  } = invoice;
  const { navigate } = useRouter();
  const badgeColorSchemeMap: Record<CommerceInvoiceStatus, 'success' | 'warning' | 'danger'> = {
    paid: 'success',
    unpaid: 'warning',
    past_due: 'danger',
  };
  const handleClick = () => {
    void navigate(`invoice/${id}`);
  };
  return (
    <DataTableRow onClick={handleClick}>
      <Td
        sx={{
          cursor: 'pointer',
        }}
      >
        <Text variant='subtitle'>
          <Link onClick={handleClick}>{new Date(paymentDueOn).toLocaleDateString()}</Link>
        </Text>
        <Text
          colorScheme='secondary'
          truncate
          sx={t => ({ marginTop: t.space.$0x5, textTransform: 'uppercase' })}
        >
          {truncateWithEndVisible(id)}
        </Text>
      </Td>
      <Td
        sx={{
          cursor: 'pointer',
        }}
      >
        <Badge
          colorScheme={badgeColorSchemeMap[status]}
          sx={{
            textTransform: 'capitalize',
          }}
        >
          {status}
        </Badge>
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
