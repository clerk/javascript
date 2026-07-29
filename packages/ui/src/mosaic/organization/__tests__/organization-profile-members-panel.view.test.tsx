import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Snapshot } from '../../machine/types';
import { MosaicProvider } from '../../MosaicProvider';
import type { MemberRow } from '../organization-profile-members-panel.controller';
import type { OrganizationProfileMembersPanelContext } from '../organization-profile-members-panel.machine';
import { OrganizationProfileMembersPanelView } from '../organization-profile-members-panel.view';

function snapshot(
  overrides: Partial<OrganizationProfileMembersPanelContext> = {},
): Snapshot<OrganizationProfileMembersPanelContext> {
  return {
    value: 'ready',
    status: 'active',
    context: {
      search: '',
      query: '',
      pendingMembershipId: null,
      removeMember: async () => {},
      error: null,
      ...overrides,
    },
  };
}

function row(overrides: Partial<MemberRow> = {}): MemberRow {
  return {
    id: 'mem_1',
    name: 'Alice Doe',
    identifier: 'alice@example.com',
    roleLabel: 'Admin',
    joinedAt: '1/1/2024',
    isCurrentUser: false,
    isBanned: false,
    onRemove: vi.fn(),
    ...overrides,
  };
}

function renderView(props: Partial<Parameters<typeof OrganizationProfileMembersPanelView>[0]> = {}) {
  const send = vi.fn();
  const onPageChange = vi.fn();
  render(
    <MosaicProvider>
      <OrganizationProfileMembersPanelView
        snapshot={snapshot()}
        send={send}
        rows={[row()]}
        canManage
        page={1}
        pageCount={1}
        isLoading={false}
        onPageChange={onPageChange}
        {...props}
      />
    </MosaicProvider>,
  );
  return { send, onPageChange };
}

describe('OrganizationProfileMembersPanelView', () => {
  it('renders a member row with name, identifier, role, and joined date', () => {
    renderView();

    expect(screen.getByText('Alice Doe')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('1/1/2024')).toBeInTheDocument();
  });

  it('emits SEARCH_CHANGE while typing without committing the query', () => {
    const { send } = renderView();

    fireEvent.change(screen.getByLabelText('Search members'), { target: { value: 'bob' } });

    expect(send).toHaveBeenCalledWith({ type: 'SEARCH_CHANGE', value: 'bob' });
    expect(send).not.toHaveBeenCalledWith({ type: 'SEARCH_SUBMIT' });
  });

  it('emits SEARCH_SUBMIT when the search form is submitted', () => {
    const { send } = renderView();

    const form = screen.getByLabelText('Search members').closest('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form!);

    expect(send).toHaveBeenCalledWith({ type: 'SEARCH_SUBMIT' });
  });

  it('marks the current user with a badge and disables their remove action', () => {
    renderView({ rows: [row({ isCurrentUser: true })] });

    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove' })).toBeDisabled();
  });

  it('marks banned members with a badge', () => {
    renderView({ rows: [row({ isBanned: true })] });

    expect(screen.getByText('Banned')).toBeInTheDocument();
  });

  it('invokes the row remove handler when Remove is clicked', () => {
    const onRemove = vi.fn();
    renderView({ rows: [row({ onRemove })] });

    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('hides the remove action entirely when the user cannot manage members', () => {
    renderView({ canManage: false });

    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();
    expect(screen.queryByText('Actions')).not.toBeInTheDocument();
  });

  it('disables and relabels the row currently being removed', () => {
    renderView({
      snapshot: { ...snapshot({ pendingMembershipId: 'mem_1' }), value: 'removing' },
      rows: [row({ id: 'mem_1' })],
    });

    expect(screen.getByRole('button', { name: 'Removing…' })).toBeDisabled();
  });

  it('shows an empty state when there are no members and it is not loading', () => {
    renderView({ rows: [] });

    expect(screen.getByText('There are no members to display')).toBeInTheDocument();
  });

  it('does not show the empty state while loading', () => {
    renderView({ rows: [], isLoading: true });

    expect(screen.queryByText('There are no members to display')).not.toBeInTheDocument();
  });

  it('surfaces a machine error without Clerk fixtures', () => {
    renderView({ snapshot: snapshot({ error: 'Removal failed' }) });

    expect(screen.getByRole('alert')).toHaveTextContent('Removal failed');
  });

  it('renders pagination and moves pages via onPageChange', () => {
    const { onPageChange } = renderView({ page: 2, pageCount: 3 });

    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onPageChange).toHaveBeenCalledWith(3);

    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('hides pagination when there is a single page', () => {
    renderView({ page: 1, pageCount: 1 });

    expect(screen.queryByText(/Page 1 of/)).not.toBeInTheDocument();
  });
});
