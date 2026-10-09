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
    pageSize: 10,
    isLoading: false,
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

  it('chooses loading, retained rows, an empty list, and the error state from the supplied state', () => {
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
    expect(screen.getByRole('status')).toHaveTextContent('No pending invitations');
    rerender(
      <MosaicProvider>
        <InvitationsTableTabView
          {...propsFor()}
          isFetching
        />
      </MosaicProvider>,
    );
    expect(screen.getByText('ada@example.com')).toBeVisible();
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
    rerender(
      <MosaicProvider>
        <InvitationsTableTabView
          {...propsFor()}
          isError
          onRetry={vi.fn()}
        />
      </MosaicProvider>,
    );
    expect(screen.queryByText('ada@example.com')).toBeNull();
    expect(within(screen.getByRole('table')).getByRole('alert')).toHaveTextContent('Unable to load invitations');
    expect(screen.getAllByRole('button', { name: 'Try again' })).toHaveLength(1);
  });

  it('forwards paging without search, sorting, or page-size controls', async () => {
    const user = userEvent.setup();
    const { props } = renderView({ totalCount: 21, onBulkAction: vi.fn() });
    await user.click(screen.getByRole('checkbox', { name: 'Select ada@example.com' }));
    expect(screen.getByRole('checkbox', { name: 'Select ada@example.com' })).toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Next invitations page' }));
    expect(props.onPageChange).toHaveBeenCalledWith(2);
    expect(screen.queryByRole('searchbox')).toBeNull();
    expect(screen.queryByRole('combobox', { name: /^Results per page/ })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Invited' })).toBeNull();
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
