import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../mosaic-provider';
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
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(['', 'Cannot read properties of undefined'])(
    'shows the localized revoke error, never the message "%s" of an unexpected error',
    async message => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const user = userEvent.setup();
      render(
        <MosaicProvider
          localization={{ overrides: { 'invitationsTableTab.revokeError': 'Could not revoke invitation.' } }}
        >
          <InvitationsTableTabView {...propsFor({ onRevoke: vi.fn().mockRejectedValue(new Error(message)) })} />
        </MosaicProvider>,
      );

      await user.click(screen.getByRole('button', { name: 'Manage ada@example.com' }));
      await user.click(screen.getByRole('menuitem', { name: 'Revoke invitation' }));
      await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Revoke invitation' }));

      await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Could not revoke invitation.'));
    },
  );

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
    expect(screen.getByRole('status')).toHaveTextContent('No invitations found');
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
  });
  it('routes invite and withholds unavailable actions', async () => {
    const user = userEvent.setup();
    const { props, rerender } = renderView({ onInvite: vi.fn(), onRevoke: vi.fn() });
    await user.click(screen.getByRole('button', { name: 'Invite' }));
    expect(props.onInvite).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Manage ada@example.com' })).toBeVisible();
    rerender(
      <MosaicProvider>
        <InvitationsTableTabView
          {...props}
          onInvite={undefined}
          onRevoke={undefined}
        />
      </MosaicProvider>,
    );
    expect(screen.queryByRole('button', { name: /Manage|Invite/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});
