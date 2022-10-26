import { MembershipRole } from '@clerk/types';
import React from 'react';

import {
  Col,
  Flex,
  localizationKeys,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useLocalizations,
} from '../../customizables';
import { Pagination, Select, SelectButton, SelectOptionList, usePagination } from '../../elements';
import { PropsOfComponent } from '../../styledSystem';

const MAX_ROWS_PER_PAGE = 10;

type MembersListTableProps = {
  headers: string[];
  rows: React.ReactNode[];
  isLoading?: boolean;
};

export const MembersListTable = (props: MembersListTableProps) => {
  const { headers, rows, isLoading } = props;
  const { page, changePage } = usePagination();

  const pageCount = Math.ceil(rows.length / MAX_ROWS_PER_PAGE) || 1;
  const startRowIndex = (page - 1) * MAX_ROWS_PER_PAGE;
  const endRowIndex = Math.min(page * MAX_ROWS_PER_PAGE, rows.length);

  React.useEffect(() => {
    changePage(1);
  }, []);

  return (
    <Col
      gap={4}
      sx={t => ({ width: '100%', padding: `${t.space.$8} 0` })}
    >
      <Flex sx={{ overflowX: 'auto' }}>
        <Table sx={{ width: '100%' }}>
          <Thead>
            <Tr>
              {headers.map(h => (
                <Th key={h}>{h}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Tr>
                <Td>
                  <Spinner />
                </Td>
              </Tr>
            ) : !rows.length ? (
              <EmptyRow key='empty' />
            ) : (
              rows
            )}
          </Tbody>
        </Table>
      </Flex>
      {
        <Pagination
          count={pageCount}
          page={page}
          onChange={changePage}
          siblingCount={1}
          rowInfo={{
            allRowsCount: rows.length,
            startingRow: rows.length ? startRowIndex + 1 : startRowIndex,
            endingRow: endRowIndex,
          }}
        />
      }
    </Col>
  );
};

const EmptyRow = () => {
  return (
    <Tr>
      <Td colSpan={3}>No members to display</Td>
    </Tr>
  );
};

export const RowContainer = (props: PropsOfComponent<typeof Tr>) => {
  return (
    <Tr
      {...props}
      sx={t => ({ ':hover': { backgroundColor: t.colors.$blackAlpha50 } })}
    />
  );
};

export const RoleSelect = (props: { value: MembershipRole; onChange: any; isDisabled?: boolean }) => {
  const { value, onChange, isDisabled } = props;
  const { t } = useLocalizations();

  const roles: Array<{ label: string; value: MembershipRole }> = [
    { label: t(localizationKeys('membershipRole__admin')), value: 'admin' },
    { label: t(localizationKeys('membershipRole__basicMember')), value: 'basic_member' },
    { label: t(localizationKeys('membershipRole__guestMember')), value: 'guest_member' },
  ];

  return (
    <Select
      options={roles.map(r => r.label)}
      value={value}
      onChange={val => onChange(roles.find(r => r.label === val)!.value)}
    >
      <SelectButton
        sx={t => ({
          border: 'none',
          color: t.colors.$colorTextSecondary,
          backgroundColor: 'transparent',
        })}
        isDisabled={isDisabled}
      >
        {roles.find(r => r.value === value)!.label}
      </SelectButton>
      <SelectOptionList />
    </Select>
  );
};
