import React from 'react';

import type { LocalizationKey } from '../../customizables';
import { Badge, Col, descriptors, Flex, Spinner, Table, Tbody, Td, Text, Th, Thead, Tr } from '../../customizables';
import { Pagination } from '../../elements';
import type { PropsOfComponent } from '../../styledSystem';

/* -------------------------------------------------------------------------------------------------
 * InvoicesList
 * -----------------------------------------------------------------------------------------------*/

type InvoicesListProps = {
  invoices: any;
  pageSize: number;
};

export const InvoicesList = ({ invoices, pageSize }: InvoicesListProps) => {
  return (
    <DataTable
      page={invoices?.page || 1}
      onPageChange={n => invoices?.fetchPage?.(n)}
      itemCount={invoices?.count || 0}
      pageCount={invoices?.pageCount || 0}
      itemsPerPage={pageSize}
      isLoading={invoices?.isLoading && !invoices?.data.length}
      emptyStateLocalizationKey='No invoices to display'
      headers={['Date/Invoice', 'Status', 'Total']}
      rows={(invoices?.data || []).map(i => (
        <InvoicesListRow
          key={i.id}
          {...i}
        />
      ))}
    />
  );
};

type InvoiceStatus = 'Paid' | 'Failed';

const InvoicesListRow = (props: { id: string; date: string; status: InvoiceStatus; total: number }) => {
  const { date, id, status, total } = props;
  const badgeColorSchemeMap: Record<InvoiceStatus, 'success' | 'warning'> = {
    Paid: 'success',
    Failed: 'warning',
  };
  return (
    <DataTableRow>
      <Td>
        <Text>{new Date(date).toLocaleDateString()}</Text>
        <Text
          colorScheme='secondary'
          sx={t => ({ marginTop: t.space.$0x5, textTransform: 'uppercase' })}
        >
          {id}
        </Text>
      </Td>
      <Td>
        <Badge colorScheme={badgeColorSchemeMap[status]}>{status}</Badge>
      </Td>
      <Td>
        <Text colorScheme='secondary'>{total}</Text>
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
        <Table>
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

const DataTableEmptyRow = (props: { localizationKey: LocalizationKey }) => {
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
