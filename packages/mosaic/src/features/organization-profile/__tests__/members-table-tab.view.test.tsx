import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import type { MembersTableTabViewProps } from '../members-table-tab.types';
import { MembersTableTabView } from '../members-table-tab.view';

function propsFor(overrides: Partial<MembersTableTabViewProps> = {}): MembersTableTabViewProps {
  return {
    members: [
      {
        id: 'ada',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        joinedAtLabel: 'Sep 1, 2026',
        role: 'admin',
        roleLabel: 'Admin',
        isCurrentUser: true,
      },
      {
        id: 'grace',
        name: 'Grace Hopper',
        email: 'grace@example.com',
        joinedAtLabel: 'Sep 2, 2026',
        role: 'member',
        roleLabel: 'Member',
      },
    ],
    roles: [
      { value: 'admin', label: 'Admin' },
      { value: 'member', label: 'Member' },
    ],
    totalCount: 2,
    page: 1,
    searchValue: '',
    isLoading: false,
    onSearchChange: vi.fn(),
    onPageChange: vi.fn(),
    ...overrides,
  };
}

function renderView(overrides: Partial<MembersTableTabViewProps> = {}) {
  const props = propsFor(overrides);
  return {
    props,
    ...render(
      <MosaicProvider>
        <MembersTableTabView {...props} />
      </MosaicProvider>,
    ),
  };
}

describe('MembersTableTabView', () => {
  it('chooses loading, retained rows, and filtered empty results from the supplied state', () => {
    const { props, rerender } = renderView({ members: [], totalCount: 0, isLoading: true });
    expect(screen.getByRole('status')).toHaveTextContent('Loading members');
    expect(screen.queryByText('No members yet')).not.toBeInTheDocument();
    rerender(
      <MosaicProvider>
        <MembersTableTabView
          {...props}
          isLoading={false}
        />
      </MosaicProvider>,
    );
    expect(screen.getByText('No members yet')).toBeVisible();
    rerender(
      <MosaicProvider>
        <MembersTableTabView
          {...props}
          isLoading={false}
          searchValue='Nobody'
        />
      </MosaicProvider>,
    );
    expect(screen.getByText('No members found')).toBeVisible();
    rerender(
      <MosaicProvider>
        <MembersTableTabView
          {...propsFor()}
          isFetching
          searchValue='Nobody'
        />
      </MosaicProvider>,
    );
    expect(screen.getByText('Grace Hopper')).toBeVisible();
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
  });
  it('forwards table controls and clears selection when changing the result set', async () => {
    const user = userEvent.setup();
    const { props } = renderView({
      totalCount: 25,
      onBulkAction: vi.fn(),
      onSortChange: vi.fn(),
      onPageSizeChange: vi.fn(),
    });
    await user.click(screen.getByRole('checkbox', { name: 'Select all members on this page' }));
    expect(screen.getByRole('checkbox', { name: 'Select Ada Lovelace' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Select Grace Hopper' })).toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Joined' }));
    expect(props.onSortChange).toHaveBeenCalledWith({ column: 'joinedAt', direction: 'ascending' });
    expect(screen.getByRole('checkbox', { name: 'Select Grace Hopper' })).not.toBeChecked();
    await user.type(screen.getByRole('searchbox', { name: 'Search members' }), 'G');
    expect(props.onSearchChange).toHaveBeenCalledWith('G');
    await user.click(screen.getByRole('button', { name: 'Next members page' }));
    expect(props.onPageChange).toHaveBeenCalledWith(2);
    await user.click(screen.getByRole('combobox', { name: /^Results per page/ }));
    await user.click(screen.getByRole('option', { name: '20', exact: true }));
    expect(props.onPageSizeChange).toHaveBeenCalledWith(20);
    expect(props.onPageChange).toHaveBeenLastCalledWith(1);
    expect(props.onBulkAction).not.toHaveBeenCalled();
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
  });
  it('routes member actions by id and excludes protected members from removal and role editing', async () => {
    const user = userEvent.setup();
    const { props } = renderView({ onRemove: vi.fn(), onChangeRole: vi.fn(), onInvite: vi.fn() });
    expect(screen.queryByRole('button', { name: 'Manage Ada Lovelace' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /^Change role for Ada Lovelace/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Invite members' }));
    expect(props.onInvite).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('combobox', { name: /^Change role for Grace Hopper/ }));
    await user.click(screen.getByRole('option', { name: 'Admin' }));
    expect(props.onChangeRole).toHaveBeenCalledWith('grace', 'admin');
    await user.click(screen.getByRole('button', { name: 'Manage Grace Hopper' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove from organization' }));
    expect(props.onRemove).toHaveBeenCalledWith('grace');
  });
  it('renders the supplied member metadata without optional controls', () => {
    renderView();
    const table = screen.getByRole('table', { name: 'Members' });
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map(header => header.textContent),
    ).toEqual(['User', 'Joined', 'Role']);
    expect(within(table).getByText('ada@example.com')).toBeVisible();
    expect(within(table).getByText('Sep 2, 2026')).toBeVisible();
    expect(within(table).getByText('You')).toBeVisible();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Manage|Invite/ })).not.toBeInTheDocument();
  });
});
