import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { useConfirmController } from '../../../../blocks/confirm';
import { MosaicProvider } from '../../../../mosaic-provider';
import { MembersTableTab } from '../members-table-tab';
import type { MembersTableTabViewProps, OrganizationProfileMember } from '../members-table-tab.types';
import { MembersTableTabView } from '../members-table-tab.view';

function MembersWithRemoval(props: MembersTableTabViewProps) {
  const remove = useConfirmController<OrganizationProfileMember>({ onConfirm: () => Promise.resolve() });
  return (
    <MembersTableTabView
      {...props}
      remove={remove}
    />
  );
}

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
    pageSize: 10,
    searchValue: '',
    isLoading: false,
    onSearchChange: vi.fn(),
    onPageChange: vi.fn(),
    registerTrigger: () => null,
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

function renderTab(overrides: Partial<MembersTableTabViewProps> = {}) {
  const props = propsFor(overrides);
  return {
    props,
    ...render(
      <MosaicProvider>
        <MembersTableTab {...props} />
      </MosaicProvider>,
    ),
  };
}

describe('MembersTableTabView', () => {
  it('does not report members as loaded when they fail to load', () => {
    renderView({ isError: true, onRetry: vi.fn() });
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load members');
    expect(screen.queryByText('Members loaded')).toBeNull();
  });

  it('chooses loading, retained rows, and filtered empty results from the supplied state', () => {
    const { props, rerender } = renderTab({ members: [], totalCount: 0, isLoading: true });
    expect(screen.getByRole('status')).toHaveTextContent('Loading members');
    rerender(
      <MosaicProvider>
        <MembersTableTab
          {...props}
          isLoading={false}
        />
      </MosaicProvider>,
    );
    expect(screen.getByText('No members yet')).toBeVisible();
    rerender(
      <MosaicProvider>
        <MembersTableTab
          {...props}
          isLoading={false}
          searchValue='Nobody'
        />
      </MosaicProvider>,
    );
    expect(within(screen.getByRole('table')).getByRole('status')).toHaveTextContent('No members found');
    rerender(
      <MosaicProvider>
        <MembersTableTab
          {...propsFor()}
          isFetching
          searchValue='Nobody'
        />
      </MosaicProvider>,
    );
    expect(screen.getByText('Grace Hopper')).toBeVisible();
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
  });
  it('shows roles as text instead of a role picker while members load', () => {
    renderTab({
      members: [],
      totalCount: 0,
      isLoading: true,
      onChangeRole: vi.fn(),
      roles: [
        { value: 'org:admin', label: 'Admin' },
        { value: 'org:member', label: 'Member' },
      ],
    });
    expect(screen.queryAllByRole('combobox', { hidden: true })).toHaveLength(0);
  });

  it('forwards table controls and clears selection when changing the result set', async () => {
    const user = userEvent.setup();
    const { props } = renderView({
      totalCount: 25,
      onBulkAction: vi.fn(),
    });
    await user.click(screen.getByRole('checkbox', { name: 'Select all members on this page' }));
    expect(screen.getByRole('checkbox', { name: 'Select Ada Lovelace' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Select Grace Hopper' })).toBeChecked();
    await user.type(screen.getByRole('searchbox', { name: 'Search members' }), 'G');
    expect(props.onSearchChange).toHaveBeenCalledWith('G');
    await user.click(screen.getByRole('button', { name: 'Next members page' }));
    expect(props.onPageChange).toHaveBeenCalledWith(2);
    expect(screen.queryByRole('combobox', { name: /^Results per page/ })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Joined' })).toBeNull();
  });
  it('locks paging while a page loads', () => {
    renderView({ totalCount: 25, page: 2, isFetching: true });
    expect(screen.getByRole('button', { name: 'Previous members page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next members page' })).toBeDisabled();
  });

  it('does not retain hidden selection for protected members within a Shift-click range', async () => {
    const user = userEvent.setup();
    const member = propsFor().members[1];
    const members = [
      { ...member, id: 'first', name: 'First' },
      { ...member, id: 'self', name: 'Self', isCurrentUser: true },
      { ...member, id: 'deprovisioned', name: 'Deprovisioned', isDeprovisioned: true },
      { ...member, id: 'last', name: 'Last' },
    ];
    const { props, rerender } = renderView({ members, totalCount: members.length, onBulkAction: vi.fn() });
    await user.click(screen.getByRole('checkbox', { name: 'Select First' }));
    await user.keyboard('{Shift>}');
    await user.click(screen.getByRole('checkbox', { name: 'Select Last' }));
    await user.keyboard('{/Shift}');
    expect(screen.getByRole('checkbox', { name: 'Select First' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Select Last' })).toBeChecked();
    rerender(
      <MosaicProvider>
        <MembersTableTabView
          {...props}
          members={members.map(item => ({ ...item, isCurrentUser: false, isDeprovisioned: false }))}
        />
      </MosaicProvider>,
    );
    expect(screen.getByRole('checkbox', { name: 'Select Self' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Select Deprovisioned' })).not.toBeChecked();
  });

  it('marks deprovisioned members as inactive', () => {
    const member = propsFor().members[1];
    renderView({ members: [member, { ...member, id: 'gone', name: 'Gone', isDeprovisioned: true }], totalCount: 2 });
    expect(screen.getByRole('row', { name: /Gone/ })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('row', { name: /Grace Hopper/ })).not.toHaveAttribute('aria-disabled');
  });

  it('routes invite and role changes while withholding protected member actions', async () => {
    const user = userEvent.setup();
    const props = propsFor({ onChangeRole: vi.fn(), onInvite: vi.fn() });
    render(
      <MosaicProvider>
        <MembersWithRemoval {...props} />
      </MosaicProvider>,
    );
    expect(screen.getByRole('button', { name: 'Manage Grace Hopper' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Manage Ada Lovelace' })).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /^Change role for Ada Lovelace/ })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Invite' }));
    expect(props.onInvite).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('combobox', { name: /^Change role for Grace Hopper/ }));
    await user.click(screen.getByRole('option', { name: 'Admin' }));
    expect(props.onChangeRole).toHaveBeenCalledWith('grace', 'admin');
  });
  it('withholds controls when their callbacks are unavailable', () => {
    renderView();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Manage|Invite/ })).not.toBeInTheDocument();
  });
});
