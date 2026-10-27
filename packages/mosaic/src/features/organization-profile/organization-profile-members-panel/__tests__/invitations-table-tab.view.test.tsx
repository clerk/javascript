import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { useConfirmController } from '../../../../blocks/confirm';
import { MosaicProvider } from '../../../../mosaic-provider';
import { InvitationsTableTab } from '../invitations-table-tab';
import type { InvitationsTableTabViewProps, OrganizationProfileInvitation } from '../invitations-table-tab.types';
import { InvitationsTableTabView } from '../invitations-table-tab.view';

function InvitationsWithRevoke(props: InvitationsTableTabViewProps) {
  const revoke = useConfirmController<OrganizationProfileInvitation>({ onConfirm: () => Promise.resolve() });
  return (
    <InvitationsTableTabView
      {...props}
      revoke={revoke}
    />
  );
}

function propsFor(overrides: Partial<InvitationsTableTabViewProps> = {}): InvitationsTableTabViewProps {
  return {
    invitations: [{ id: 'invite-1', email: 'ada@example.com', invitedAtLabel: 'Sep 1, 2026', roleLabel: 'Admin' }],
    totalCount: 1,
    page: 1,
    pageSize: 10,
    isLoading: false,
    onPageChange: vi.fn(),
    registerTrigger: () => null,
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

function renderTab(overrides: Partial<InvitationsTableTabViewProps> = {}) {
  const props = propsFor(overrides);
  return {
    props,
    ...render(
      <MosaicProvider>
        <InvitationsTableTab {...props} />
      </MosaicProvider>,
    ),
  };
}

describe('InvitationsTableTabView', () => {
  it('does not report invitations as loaded when they fail to load', () => {
    renderView({ isError: true, onRetry: vi.fn() });
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load invitations');
    expect(screen.queryByText('Invitations loaded')).toBeNull();
  });

  it('chooses loading, retained rows, an empty list, and the error state from the supplied state', () => {
    const { props, rerender } = renderTab({ invitations: [], totalCount: 0, isLoading: true });
    expect(screen.getByRole('status')).toHaveTextContent('Loading invitations');
    rerender(
      <MosaicProvider>
        <InvitationsTableTab
          {...props}
          isLoading={false}
        />
      </MosaicProvider>,
    );
    expect(within(screen.getByRole('table')).getByRole('status')).toHaveTextContent('No pending invitations');
    rerender(
      <MosaicProvider>
        <InvitationsTableTab
          {...propsFor()}
          isFetching
        />
      </MosaicProvider>,
    );
    expect(screen.getByText('ada@example.com')).toBeVisible();
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
    rerender(
      <MosaicProvider>
        <InvitationsTableTab
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

  it('locks paging while a page loads', () => {
    renderView({ totalCount: 25, page: 2, isFetching: true });
    expect(screen.getByRole('button', { name: 'Previous invitations page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next invitations page' })).toBeDisabled();
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
    const props = propsFor({ onInvite: vi.fn() });
    const { rerender } = render(
      <MosaicProvider>
        <InvitationsWithRevoke {...props} />
      </MosaicProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Invite' }));
    expect(props.onInvite).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Manage ada@example.com' })).toBeVisible();
    rerender(
      <MosaicProvider>
        <InvitationsTableTabView
          {...props}
          onInvite={undefined}
        />
      </MosaicProvider>,
    );
    expect(screen.queryByRole('button', { name: /Manage|Invite/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});
