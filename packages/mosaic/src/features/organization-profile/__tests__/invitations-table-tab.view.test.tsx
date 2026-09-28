import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { deferred } from '../../../machines/__tests__/test-utils';
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
  it.each(['', '   '])('uses the localized revoke error when the rejection message is "%s"', async message => {
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

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not revoke invitation.');
  });

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

it.each([true, false])(
  'revokes the confirmed invitation and restores focus with invite available: %s',
  async hasInvite => {
    const user = userEvent.setup();
    const pending = deferred<void>();
    const onMutation = vi
      .fn<(id: string) => Promise<void>>()
      .mockImplementationOnce(() => pending.promise)
      .mockResolvedValue(undefined);
    function Example() {
      const [items, setItems] = useState([
        { ...propsFor().invitations[0], id: 'ada', email: 'ada@example.com' },
        { ...propsFor().invitations[0], id: 'grace', email: 'Grace' },
      ]);
      return (
        <MosaicProvider>
          <InvitationsTableTabView
            {...propsFor()}
            invitations={items}
            totalCount={items.length}
            onInvite={hasInvite ? vi.fn() : undefined}
            onRevoke={async id => {
              await onMutation(id);
              setItems(current => current.filter(item => item.id !== id));
            }}
          />
        </MosaicProvider>
      );
    }
    render(<Example />);
    await user.click(screen.getByRole('button', { name: 'Manage ada@example.com' }));
    await user.click(screen.getByRole('menuitem', { name: 'Revoke invitation' }));
    expect(onMutation).not.toHaveBeenCalled();
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Revoke invitation' }));
    expect(onMutation).toHaveBeenCalledExactlyOnceWith('ada');
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await act(async () => {
      pending.resolve();
      await pending.promise;
    });
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Manage Grace' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Manage Grace' }));
    await user.click(screen.getByRole('menuitem', { name: 'Revoke invitation' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Revoke invitation' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(onMutation).toHaveBeenLastCalledWith('grace');
    expect(hasInvite ? screen.getByRole('button', { name: 'Invite' }) : screen.getByRole('searchbox')).toHaveFocus();
  },
);
