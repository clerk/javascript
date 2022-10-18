import { UserResource } from '@clerk/types';
import React from 'react';

import { Box, Button, Col, Icon, Table, Tbody, Td, Th, Thead, Tr } from '../../customizables';
import {
  InputWithIcon,
  Menu,
  MenuItem,
  MenuList,
  MenuTrigger,
  Pagination,
  usePagination,
  UserPreview,
} from '../../elements';
import { useSearchInput } from '../../hooks';
import { MagnifyingGlass, ThreeDots } from '../../icons';

const searchTermForUser = (user: any) => {
  return [
    user.firstName,
    user.lastName,
    user.username,
    user.primaryEmailAddress?.emailAddress,
    user.primaryPhoneNumber?.phoneNumber,
    user.role,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
};

const MAX_ROWS_PER_PAGE = 10;

type UserAction = { label: string; destructive?: boolean; onClick: (user: any) => Promise<unknown> | void };

type MembersListProps = {
  users: any[];
  actions: UserAction[];
};

export const MembersListTable = (props: MembersListProps) => {
  const { actions, users } = props;
  const { page, changePage } = usePagination();
  const { filteredItems, searchInputProps } = useSearchInput({
    items: users,
    comparator: (term, _, itemTerm) => (itemTerm || '').includes(term.toLowerCase()),
    searchTermForItem: searchTermForUser,
  });
  const pageCount = Math.ceil(filteredItems.length / MAX_ROWS_PER_PAGE);
  const startRowIndex = (page - 1) * MAX_ROWS_PER_PAGE;
  const endRowIndex = Math.min(page * MAX_ROWS_PER_PAGE, filteredItems.length);

  React.useEffect(() => {
    changePage(1);
  }, [filteredItems]);

  return (
    <Col sx={t => ({ width: '100%', padding: `${t.space.$8} 0` })}>
      <Box sx={{ width: 'min(30ch, 100%)' }}>
        <InputWithIcon
          {...searchInputProps}
          placeholder={'Search'}
          autoFocus
          leftIcon={
            <Icon
              colorScheme='neutral'
              icon={MagnifyingGlass}
            />
          }
        />
      </Box>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ width: '100%' }}>
          <Thead>
            <Tr>
              <Th>User</Th>
              <Th>Role</Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {filteredItems.slice(startRowIndex, endRowIndex).map(user => (
              <UserRow
                key={user.id}
                user={user}
                actions={actions}
              />
            ))}
          </Tbody>
        </Table>
      </Box>
      {!!pageCount && (
        <Pagination
          count={pageCount}
          page={page}
          onChange={changePage}
          siblingCount={1}
          rowInfo={{
            allRowsCount: filteredItems.length,
            startingRow: startRowIndex + 1,
            endingRow: endRowIndex,
          }}
        />
      )}
    </Col>
  );
};

const UserRow = (props: { user: Partial<UserResource>; actions: UserAction[] }) => {
  const { user, actions } = props;
  return (
    <Tr sx={t => ({ ':hover': { backgroundColor: t.colors.$blackAlpha50 } })}>
      <Td sx={{ width: '70%' }}>
        <UserPreview user={user} />
      </Td>
      <Td>{user.role}</Td>
      <Td>
        <Menu>
          <MenuTrigger>
            <Button variant='ghostIcon'>
              <Icon icon={ThreeDots} />
            </Button>
          </MenuTrigger>
          <MenuList>
            {actions.map(action => {
              return (
                <MenuItem
                  key={action.label}
                  destructive={action.destructive}
                  onClick={() => action.onClick(user)}
                >
                  {action.label}
                </MenuItem>
              );
            })}
          </MenuList>
        </Menu>
      </Td>
    </Tr>
  );
};
