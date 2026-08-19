import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import { Avatar } from '../components/avatar';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { Icon } from '../components/icon';
import { mergeStyleProps, themeProps } from '../props';
import { styles } from './organization-profile-members-section.styles';

export type OrganizationProfileMemberStatus = 'active' | 'invited' | 'request';

export interface OrganizationProfileMember {
  id: string;
  name: string;
  emailAddress: string;
  status: OrganizationProfileMemberStatus;
  addedAtLabel?: string;
  imageUrl?: string;
  initials?: string;
  roleLabel?: string;
}

export interface OrganizationProfileMembersPagination {
  page: number;
  pageCount: number;
  pageSize: number;
  pageSizeOptions?: readonly number[];
}

export interface OrganizationProfileMembersSectionViewProps {
  members: OrganizationProfileMember[];
  selectedIds: readonly string[];
  pagination?: OrganizationProfileMembersPagination;
  onAcceptRequest?: (id: string) => void;
  onDeclineRequest?: (id: string) => void;
  onManageMember?: (id: string) => void;
  onManageRole?: (id: string) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSelectionChange: (ids: string[]) => void;
}

export function OrganizationProfileMembersSectionView({
  members,
  selectedIds,
  pagination,
  onAcceptRequest,
  onDeclineRequest,
  onManageMember,
  onManageRole,
  onPageChange,
  onPageSizeChange,
  onSelectionChange,
}: OrganizationProfileMembersSectionViewProps): ReactElement {
  const allSelected = members.length > 0 && members.every(member => selectedIds.includes(member.id));

  const toggleAll = () => {
    onSelectionChange(allSelected ? [] : members.map(member => member.id));
  };

  const toggleOne = (id: string) => {
    onSelectionChange(
      selectedIds.includes(id) ? selectedIds.filter(selectedId => selectedId !== id) : [...selectedIds, id],
    );
  };

  return (
    <section {...mergeStyleProps(themeProps('organization-profile-members-section'), stylex.props(styles.root))}>
      {/* TODO: Replace this inline implementation with the Mosaic Table component. */}
      <div {...stylex.props(styles.tableShell)}>
        <div {...stylex.props(styles.tableScroller)}>
          <table {...stylex.props(styles.table)}>
            <thead {...stylex.props(styles.header)}>
              <tr>
                <th
                  scope='col'
                  {...stylex.props(styles.headerCell, styles.checkboxCell)}
                >
                  {/* TODO: Replace these inline selection controls with the Mosaic Checkbox component. */}
                  <input
                    aria-label='Select all members'
                    checked={allSelected}
                    type='checkbox'
                    {...stylex.props(styles.checkbox)}
                    onChange={toggleAll}
                  />
                </th>
                <th
                  scope='col'
                  {...stylex.props(styles.headerCell, styles.memberColumn)}
                >
                  Name
                </th>
                <th
                  scope='col'
                  {...stylex.props(styles.headerCell)}
                >
                  Added
                </th>
                <th
                  scope='col'
                  {...stylex.props(styles.headerCell)}
                >
                  Role
                </th>
                <th
                  aria-label='Actions'
                  scope='col'
                  {...stylex.props(styles.headerCell, styles.actionCell)}
                />
              </tr>
            </thead>
            <tbody>
              {members.length > 0 ? (
                members.map(member => (
                  <tr
                    key={member.id}
                    {...stylex.props(styles.row)}
                  >
                    <td {...stylex.props(styles.cell, styles.checkboxCell)}>
                      <input
                        aria-label={`Select ${member.name}`}
                        checked={selectedIds.includes(member.id)}
                        type='checkbox'
                        {...stylex.props(styles.checkbox)}
                        onChange={() => toggleOne(member.id)}
                      />
                    </td>
                    <td {...stylex.props(styles.cell)}>
                      <div {...stylex.props(styles.member)}>
                        <Avatar.Root
                          size='sm'
                          {...stylex.props(styles.avatar)}
                        >
                          <Avatar.Image
                            alt=''
                            src={member.imageUrl}
                          />
                          <Avatar.Fallback>{member.initials ?? member.name.slice(0, 1)}</Avatar.Fallback>
                        </Avatar.Root>
                        <div {...stylex.props(styles.memberIdentity)}>
                          <div {...stylex.props(styles.memberName)}>
                            <span>{member.name}</span>
                            {member.status === 'request' ? <Badge color='neutral'>Request</Badge> : null}
                            {member.status === 'invited' ? <Badge color='neutral'>Invited</Badge> : null}
                          </div>
                          <div {...stylex.props(styles.memberEmail)}>{member.emailAddress}</div>
                        </div>
                      </div>
                    </td>
                    <td {...stylex.props(styles.cell)}>{member.addedAtLabel}</td>
                    <td {...stylex.props(styles.cell)}>
                      {member.status !== 'request' && member.roleLabel ? (
                        onManageRole ? (
                          <Button
                            aria-label={`Change role for ${member.name}`}
                            color='neutral'
                            size='sm'
                            touchTarget={false}
                            variant='ghost'
                            {...stylex.props(styles.roleButton)}
                            onClick={() => onManageRole(member.id)}
                          >
                            {member.roleLabel}
                            <Icon name='chevron-down' />
                          </Button>
                        ) : (
                          member.roleLabel
                        )
                      ) : null}
                    </td>
                    <td {...stylex.props(styles.cell, styles.actionCell)}>
                      {member.status === 'request' ? (
                        <div {...stylex.props(styles.requestActions)}>
                          {onDeclineRequest ? (
                            <Button
                              color='neutral'
                              size='sm'
                              touchTarget={false}
                              variant='ghost'
                              onClick={() => onDeclineRequest(member.id)}
                            >
                              Decline
                            </Button>
                          ) : null}
                          {onAcceptRequest ? (
                            <Button
                              size='sm'
                              touchTarget={false}
                              onClick={() => onAcceptRequest(member.id)}
                            >
                              Accept
                            </Button>
                          ) : null}
                        </div>
                      ) : onManageMember ? (
                        <Button
                          aria-label={`Manage ${member.name}`}
                          color='neutral'
                          shape='square'
                          size='sm'
                          touchTarget={false}
                          variant='ghost'
                          onClick={() => onManageMember(member.id)}
                        >
                          <Icon name='ellipsis' />
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))
              ) : (
                <tr {...stylex.props(styles.row)}>
                  <td
                    colSpan={5}
                    {...stylex.props(styles.emptyCell)}
                  >
                    No members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {pagination ? (
        // TODO: Replace this inline implementation with the Mosaic Pagination component.
        <div {...stylex.props(styles.pagination)}>
          <div {...stylex.props(styles.paginationControls)}>
            <Button
              aria-label='Previous members page'
              color='neutral'
              disabled={pagination.page <= 1}
              shape='square'
              size='sm'
              touchTarget={false}
              variant='ghost'
              onClick={() => onPageChange?.(pagination.page - 1)}
            >
              <Icon name='chevron-left' />
            </Button>
            <span>{`${pagination.page} of ${pagination.pageCount}`}</span>
            <Button
              aria-label='Next members page'
              color='neutral'
              disabled={pagination.page >= pagination.pageCount}
              shape='square'
              size='sm'
              touchTarget={false}
              variant='ghost'
              onClick={() => onPageChange?.(pagination.page + 1)}
            >
              <Icon name='chevron-right' />
            </Button>
          </div>
          <label {...stylex.props(styles.pageSizeLabel)}>
            <span>Results per page</span>
            {/* TODO: Replace this inline implementation with the Mosaic Select component. */}
            <select
              aria-label='Results per page'
              value={pagination.pageSize}
              {...stylex.props(styles.pageSizeSelect)}
              onChange={event => onPageSizeChange?.(Number(event.currentTarget.value))}
            >
              {(pagination.pageSizeOptions ?? [10, 25, 50]).map(pageSize => (
                <option
                  key={pageSize}
                  value={pageSize}
                >
                  {pageSize}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
    </section>
  );
}
