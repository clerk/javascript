import type { MembershipRole } from '@clerk/types';
import React from 'react';

import type { LocalizationKey } from '../../customizables';
import {
  Col,
  descriptors,
  Flex,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useLocalizations,
} from '../../customizables';
import { Pagination, Select, SelectButton, SelectOptionList } from '../../elements';
import type { PropsOfComponent } from '../../styledSystem';
import { roleLocalizationKey } from '../../utils';

type MembersListTableProps = {
  headers: LocalizationKey[];
  rows: React.ReactNode[];
  isLoading?: boolean;
  page: number;
  onPageChange: (page: number) => void;
  itemCount: number;
  emptyStateLocalizationKey: LocalizationKey;
} & (
  | {
      itemsPerPage?: never;
      pageCount: number;
    }
  | {
      itemsPerPage: number;
      pageCount?: never;
    }
);

export const DataTable = (props: MembersListTableProps) => {
  const {
    headers,
    page,
    onPageChange,
    rows,
    isLoading,
    itemCount,
    itemsPerPage,
    pageCount: pageCountProp,
    emptyStateLocalizationKey,
  } = props;

  const pageCount = rows.length !== 0 ? pageCountProp ?? Math.ceil(itemCount / itemsPerPage) : 1;
  const startRowIndex = (page - 1) * rows.length;
  const endRowIndex = Math.min(page * rows.length);

  return (
    <Col
      gap={4}
      sx={{ width: '100%' }}
    >
      <Flex sx={{ overflowX: 'auto' }}>
        <Table sx={{ width: '100%' }}>
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
                  />
                </Td>
              </Tr>
            ) : !rows.length ? (
              <EmptyRow
                key='empty'
                localizationKey={emptyStateLocalizationKey}
              />
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
          onChange={onPageChange}
          siblingCount={1}
          rowInfo={{
            allRowsCount: itemCount,
            startingRow: rows.length ? startRowIndex + 1 : startRowIndex,
            endingRow: endRowIndex,
          }}
        />
      }
    </Col>
  );
};

const EmptyRow = (props: { localizationKey: LocalizationKey }) => {
  return (
    <Tr>
      <Td colSpan={4}>
        <Text
          localizationKey={props.localizationKey}
          sx={t => ({
            margin: 'auto',
            display: 'block',
            width: 'fit-content',
            fontSize: t.fontSizes.$xs,
          })}
        />
      </Td>
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
    { label: t(roleLocalizationKey('admin')), value: 'admin' },
    { label: t(roleLocalizationKey('basic_member')), value: 'basic_member' },
  ];

  const excludedRoles: Array<{ label: string; value: MembershipRole }> = [
    { label: t(roleLocalizationKey('guest_member')), value: 'guest_member' },
  ];

  const selectedRole = [...roles, ...excludedRoles].find(r => r.value === value);

  return (
    <Select
      elementId='role'
      options={roles}
      value={value}
      onChange={role => onChange(role.value)}
    >
      <SelectButton
        sx={t => ({
          color: t.colors.$colorTextSecondary,
          backgroundColor: 'transparent',
        })}
        isDisabled={isDisabled}
      >
        {selectedRole?.label}
      </SelectButton>
      <SelectOptionList />
    </Select>
  );
};
