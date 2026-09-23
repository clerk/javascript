import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import type { InvitationsTableTabViewProps } from '../invitations-table-tab.types';
import { InvitationsTableTabView } from '../invitations-table-tab.view';

function propsFor(overrides: Partial<InvitationsTableTabViewProps> = {}): InvitationsTableTabViewProps {
  return {
    invitations: [{ id: 'invite-1', email: 'ada@example.com', invitedAtLabel: 'Sep 1, 2026', roleLabel: 'Admin' }],
    totalCount: 1,
    page: 1,
    searchValue: '',
    isLoading: false,
    onSearchChange: vi.fn(),
    onPageChange: vi.fn(),
    ...overrides,
  };
}
function renderView(overrides: Partial<InvitationsTableTabViewProps> = {}) {
  const props = propsFor(overrides);
  return {
    props,
    ...render(
      <MosaicProvider>
        <InvitationsTableTabView {...props} />
      </MosaicProvider>,
    ),
  };
}

describe('InvitationsTableTabView', () => {
  it('distinguishes loading, an empty invitation list, and an empty search', () => {
    const { props, rerender } = renderView({ invitations: [], totalCount: 0, isLoading: true });
    expect(screen.getByRole('status')).toHaveTextContent('Loading invitations');
    rerender(
      <MosaicProvider>
        <InvitationsTableTabView
          {...props}
          isLoading={false}
        />
      </MosaicProvider>,
    );
    expect(screen.getByText('No pending invitations')).toBeVisible();
    rerender(
      <MosaicProvider>
        <InvitationsTableTabView
          {...props}
          isLoading={false}
          searchValue='Nobody'
        />
      </MosaicProvider>,
    );
    expect(screen.getByText('No invitations found')).toBeVisible();
    rerender(
      <MosaicProvider>
        <InvitationsTableTabView
          {...propsFor()}
          isFetching
          searchValue='Nobody'
        />
      </MosaicProvider>,
    );
    expect(screen.getByText('ada@example.com')).toBeVisible();
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
  });
  it('connects invitation search, sorting, and paging while clearing the old selection', async () => {
    const user = userEvent.setup();
    const { props, rerender } = renderView({
      totalCount: 21,
      onBulkAction: vi.fn(),
      onSortChange: vi.fn(),
      onPageSizeChange: vi.fn(),
    });
    await user.click(screen.getByRole('checkbox', { name: 'Select ada@example.com' }));
    await user.click(screen.getByRole('button', { name: 'Invited' }));
    expect(props.onSortChange).toHaveBeenCalledWith({ column: 'invitedAt', direction: 'ascending' });
    expect(screen.getByRole('checkbox', { name: 'Select ada@example.com' })).not.toBeChecked();
    rerender(
      <MosaicProvider>
        <InvitationsTableTabView
          {...props}
          sort={{ column: 'invitedAt', direction: 'ascending' }}
        />
      </MosaicProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Invited' }));
    expect(props.onSortChange).toHaveBeenLastCalledWith({ column: 'invitedAt', direction: 'descending' });
    await user.type(screen.getByRole('searchbox', { name: 'Search invitations' }), 'A');
    expect(props.onSearchChange).toHaveBeenCalledWith('A');
    await user.click(screen.getByRole('button', { name: 'Next invitations page' }));
    expect(props.onPageChange).toHaveBeenCalledWith(2);
    await user.click(screen.getByRole('combobox', { name: /^Results per page/ }));
    await user.click(screen.getByRole('option', { name: '20', exact: true }));
    expect(props.onPageSizeChange).toHaveBeenCalledWith(20);
    expect(props.onPageChange).toHaveBeenLastCalledWith(1);
    expect(props.onBulkAction).not.toHaveBeenCalled();
  });
  it('renders invitation metadata and routes optional invite and revoke commands', async () => {
    const user = userEvent.setup();
    const { props, rerender } = renderView({ onInvite: vi.fn(), onRevoke: vi.fn() });
    const table = screen.getByRole('table', { name: 'Invitations' });
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map(header => header.textContent),
    ).toEqual(['User', 'Invited', 'Role', 'Actions']);
    expect(within(table).getByText('ada@example.com')).toBeVisible();
    expect(within(table).getByText('Sep 1, 2026')).toBeVisible();
    expect(within(table).getByText('Admin')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Invite members' }));
    expect(props.onInvite).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('button', { name: 'Manage ada@example.com' }));
    await user.click(screen.getByRole('menuitem', { name: 'Revoke invitation' }));
    expect(props.onRevoke).toHaveBeenCalledWith('invite-1');
    rerender(
      <MosaicProvider>
        <InvitationsTableTabView
          {...props}
          onInvite={undefined}
          onRevoke={undefined}
        />
      </MosaicProvider>,
    );
    expect(screen.queryByRole('columnheader', { name: 'Actions' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Manage|Invite/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});
