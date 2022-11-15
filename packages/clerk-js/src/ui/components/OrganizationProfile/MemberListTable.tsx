import { MembershipRole } from '@clerk/types';
import React from 'react';

import {
  Col,
  Flex,
  LocalizationKey,
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
import { Pagination, Select, SelectButton, SelectOptionList } from '../../elements';
import { PropsOfComponent } from '../../styledSystem';
import { roleLocalizationKey } from '../../utils';

type MembersListTableProps = {
  headers: LocalizationKey[];
  rows: React.ReactNode[];
  isLoading?: boolean;
  page: number;
  onPageChange: (page: number) => void;
  itemCount: number;
  itemsPerPage: number;
};

export const MembersListTable = (props: MembersListTableProps) => {
  const { headers, page, onPageChange, rows, isLoading, itemCount, itemsPerPage } = props;

  const pageCount = rows.length !== 0 ? Math.ceil(itemCount / itemsPerPage) : 1;
  const startRowIndex = (page - 1) * rows.length;
  const endRowIndex = Math.min(page * rows.length);

  return (
    <Col
      gap={4}
      sx={t => ({ width: '100%', padding: `${t.space.$8} 0` })}
    >
      <Flex sx={{ overflowX: 'auto' }}>
        <Table sx={{ width: '100%' }}>
          <Thead>
            <Tr>
              {headers.map((h, index) => (
                <Th
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
                  <Spinner sx={{ margin: 'auto', display: 'block' }} />
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

const EmptyRow = () => {
  return (
    <Tr>
      <Td
        colSpan={3}
        localizationKey={localizationKeys('organizationProfile.membersPage.detailsTitle__emptyRow')}
      />
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
      options={roles}
      value={value}
      onChange={role => onChange(role.value)}
    >
      <SelectButton
        sx={t => ({
          border: 'none',
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
