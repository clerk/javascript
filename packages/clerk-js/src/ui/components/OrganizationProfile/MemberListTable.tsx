import React, { memo, useMemo } from 'react';

import type { LocalizationKey } from '../../customizables';
import {
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
  useLocalizations,
} from '../../customizables';
import { Pagination, Select, SelectButton, SelectOptionList } from '../../elements';
import { useLocalizeCustomRoles } from '../../hooks/useFetchRoles';
import type { PropsOfComponent, ThemableCssProp } from '../../styledSystem';

type MembersListTableProps = {
  headers: LocalizationKey[];
  rows: React.ReactNode[];
  isLoading?: boolean;
  page: number;
  onPageChange: (page: number) => void;
  itemCount: number;
  emptyStateLocalizationKey: LocalizationKey;
  pageCount: number;
  itemsPerPage: number;
};

export const DataTable = (props: MembersListTableProps) => {
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

const EmptyRow = (props: { localizationKey: LocalizationKey }) => {
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

export const RowContainer = (props: PropsOfComponent<typeof Tr>) => {
  return (
    <Tr
      {...props}
      sx={t => ({ ':hover': { backgroundColor: t.colors.$neutralAlpha50 } })}
    />
  );
};

export const RoleSelect = (props: {
  roles: { label: string; value: string }[] | undefined;
  value: string;
  onChange: (params: string) => unknown;
  isDisabled?: boolean;
  triggerSx?: ThemableCssProp;
  optionListSx?: ThemableCssProp;
  prefixLocalizationKey?: LocalizationKey | string;
}) => {
  const { value, roles, onChange, isDisabled, triggerSx, optionListSx, prefixLocalizationKey } = props;

  const { localizeCustomRole } = useLocalizeCustomRoles();

  const fetchedRoles = useMemo(() => [...(roles || [])], [roles]);

  const selectedRole = useMemo(() => fetchedRoles.find(r => r.value === value), [fetchedRoles]);
  const { t } = useLocalizations();

  const localizedOptions = useMemo(
    () =>
      fetchedRoles.map(role => ({
        value: role.value,
        label: localizeCustomRole(role.value) || role.label,
      })),
    [fetchedRoles, localizeCustomRole],
  );

  return (
    <Select
      elementId='role'
      options={localizedOptions}
      value={value}
      placeholder={t(localizationKeys('organizationProfile.invitePage.selectDropdown__role'))}
      onChange={role => onChange(role.value)}
      renderOption={(option, _index, isSelected) => (
        <RolesListItem
          isSelected={isSelected}
          option={option}
          sx={theme => ({
            '&:hover': {
              backgroundColor: theme.colors.$neutralAlpha100,
            },
            '&[data-focused="true"]': {
              backgroundColor: theme.colors.$neutralAlpha150,
            },
          })}
        />
      )}
    >
      {/*Store value inside an input in order to be accessible as form data*/}
      <input
        name='role'
        type='hidden'
        value={value}
      />
      <SelectButton
        sx={
          triggerSx ||
          (t => ({
            color: t.colors.$colorText,
            backgroundColor: 'transparent',
            textWrap: 'nowrap',
          }))
        }
        isDisabled={isDisabled}
      >
        {(selectedRole?.label || selectedRole?.value) && (
          <Flex
            as='span'
            gap={1}
          >
            {prefixLocalizationKey && (
              <Text
                as='span'
                colorScheme='secondary'
                localizationKey={prefixLocalizationKey}
              />
            )}
            <Text
              as='span'
              sx={t => ({ color: t.colors.$colorText })}
            >
              {localizeCustomRole(selectedRole?.value) || selectedRole?.label}
            </Text>
          </Flex>
        )}
      </SelectButton>
      <SelectOptionList sx={optionListSx} />
    </Select>
  );
};

type RolesListItemProps = PropsOfComponent<typeof Flex> & {
  isSelected?: boolean;
  option?: {
    label: string;
    value: string;
  };
};

const RolesListItem = memo((props: RolesListItemProps) => {
  const { option, isSelected, sx, ...rest } = props;
  return (
    <Flex
      sx={[
        theme => ({
          width: '100%',
          padding: `${theme.space.$2} ${theme.space.$4}`,
          borderRadius: theme.radii.$md,
        }),
        sx,
      ]}
      {...rest}
    >
      <Text colorScheme='secondary'>{option?.label}</Text>
    </Flex>
  );
});
