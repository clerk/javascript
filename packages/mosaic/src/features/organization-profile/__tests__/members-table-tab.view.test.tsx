import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { deferred } from '../../../__tests__/async';
import { MosaicProvider } from '../../../mosaic-provider';
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
    pageSize: 10,
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
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the localized remove error, never the message of an unexpected error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    render(
      <MosaicProvider localization={{ overrides: { 'membersTableTab.removeError': 'Could not remove member.' } }}>
        <MembersTableTabView
          {...propsFor({ onRemove: vi.fn().mockRejectedValue(new Error('Cannot read properties of undefined')) })}
        />
      </MosaicProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Manage Grace Hopper' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove from organization' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove from organization' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Could not remove member.'));
  });

  it('chooses loading, retained rows, and filtered empty results from the supplied state', () => {
    const { props, rerender } = renderView({ members: [], totalCount: 0, isLoading: true });
    expect(screen.getByRole('status')).toHaveTextContent('Loading members');
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
    expect(screen.getByRole('status')).toHaveTextContent('No members found');
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
  it.each<Partial<MembersTableTabViewProps>>([{ page: 2 }, { pageSize: 20 }, { searchValue: 'Grace' }])(
    'clears selection when the caller changes result state: %j',
    async change => {
      const user = userEvent.setup();
      const { props, rerender } = renderView({ onBulkAction: vi.fn() });
      await user.click(screen.getByRole('checkbox', { name: 'Select Grace Hopper' }));
      rerender(
        <MosaicProvider>
          <MembersTableTabView
            {...props}
            isFetching
          />
        </MosaicProvider>,
      );
      expect(screen.getByRole('checkbox', { name: 'Select Grace Hopper' })).toBeChecked();
      rerender(
        <MosaicProvider>
          <MembersTableTabView
            {...props}
            {...change}
          />
        </MosaicProvider>,
      );
      expect(screen.getByRole('checkbox', { name: 'Select Grace Hopper' })).not.toBeChecked();
    },
  );

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
    const { props } = renderView({ onRemove: vi.fn(), onChangeRole: vi.fn(), onInvite: vi.fn() });
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

it('removes the confirmed member', async () => {
  const user = userEvent.setup();
  const pending = deferred<void>();
  const onMutation = vi
    .fn<(id: string) => Promise<void>>()
    .mockImplementationOnce(() => pending.promise)
    .mockResolvedValue(undefined);
  function Example() {
    const [items, setItems] = useState([
      { ...propsFor().members[1], id: 'ada', name: 'Ada Lovelace' },
      { ...propsFor().members[1], id: 'grace', name: 'Grace' },
    ]);
    return (
      <MosaicProvider>
        <MembersTableTabView
          {...propsFor()}
          members={items}
          totalCount={items.length}
          onRemove={async id => {
            await onMutation(id);
            setItems(current => current.filter(item => item.id !== id));
          }}
        />
      </MosaicProvider>
    );
  }
  render(<Example />);
  await user.click(screen.getByRole('button', { name: 'Manage Ada Lovelace' }));
  await user.click(screen.getByRole('menuitem', { name: 'Remove from organization' }));
  expect(onMutation).not.toHaveBeenCalled();
  await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove from organization' }));
  expect(onMutation).toHaveBeenCalledExactlyOnceWith('ada');
  expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  await act(async () => {
    pending.resolve();
    await pending.promise;
  });
  await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  await user.click(screen.getByRole('button', { name: 'Manage Grace' }));
  await user.click(screen.getByRole('menuitem', { name: 'Remove from organization' }));
  await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove from organization' }));
  await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  expect(onMutation).toHaveBeenLastCalledWith('grace');
});
