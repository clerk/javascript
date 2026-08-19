import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import { OrganizationProfileMembersPanelView } from '../organization-profile-members-panel.view';

const members = [
  {
    id: 'request',
    name: 'Preston Booth',
    emailAddress: 'preston@clerk.dev',
    status: 'request' as const,
  },
  {
    id: 'invited',
    name: 'Bertram Gilfoyle',
    emailAddress: 'gilfoyle@clerk.dev',
    status: 'invited' as const,
    addedAtLabel: '5/11/26',
    roleLabel: 'Member',
  },
  {
    id: 'active',
    name: 'Dinesh Chugtai',
    emailAddress: 'dinesh@clerk.dev',
    status: 'active' as const,
    addedAtLabel: '5/11/26',
    roleLabel: 'Member',
  },
];

function renderView(overrides: Partial<React.ComponentProps<typeof OrganizationProfileMembersPanelView>> = {}) {
  const props = {
    members,
    searchValue: '',
    selectedIds: [],
    onSearchChange: vi.fn(),
    onSelectionChange: vi.fn(),
    ...overrides,
  };

  return {
    ...render(
      <MosaicProvider>
        <OrganizationProfileMembersPanelView {...props} />
      </MosaicProvider>,
    ),
    props,
  };
}

describe('OrganizationProfileMembersPanelView', () => {
  it('renders member states and metadata', () => {
    renderView();

    expect(screen.getByRole('heading', { level: 3, name: 'Members' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search members' })).toBeInTheDocument();
    expect(screen.getByText('Request')).toBeInTheDocument();
    expect(screen.getByText('Invited')).toBeInTheDocument();
    expect(screen.getByText('Dinesh Chugtai')).toBeInTheDocument();
  });

  it('forwards toolbar, selection, request, role, and row actions', async () => {
    const callbacks = {
      onAcceptRequest: vi.fn(),
      onDeclineRequest: vi.fn(),
      onFilter: vi.fn(),
      onInvite: vi.fn(),
      onManageMember: vi.fn(),
      onManageRole: vi.fn(),
      onSearchChange: vi.fn(),
      onSelectionChange: vi.fn(),
    };
    const user = userEvent.setup();

    renderView(callbacks);

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search members' }), { target: { value: 'preston' } });
    await user.click(screen.getByRole('button', { name: 'Filter members' }));
    await user.click(screen.getByRole('button', { name: 'Invite' }));
    await user.click(screen.getByRole('checkbox', { name: 'Select Preston Booth' }));
    await user.click(screen.getByRole('checkbox', { name: 'Select all members' }));
    await user.click(screen.getByRole('button', { name: 'Decline' }));
    await user.click(screen.getByRole('button', { name: 'Accept' }));
    await user.click(screen.getByRole('button', { name: 'Change role for Dinesh Chugtai' }));
    await user.click(screen.getByRole('button', { name: 'Manage Bertram Gilfoyle' }));
    await user.click(screen.getByRole('button', { name: 'Manage Dinesh Chugtai' }));

    expect(callbacks.onSearchChange).toHaveBeenCalledWith('preston');
    expect(callbacks.onFilter).toHaveBeenCalledOnce();
    expect(callbacks.onInvite).toHaveBeenCalledOnce();
    expect(callbacks.onSelectionChange).toHaveBeenNthCalledWith(1, ['request']);
    expect(callbacks.onSelectionChange).toHaveBeenNthCalledWith(2, ['request', 'invited', 'active']);
    expect(callbacks.onDeclineRequest).toHaveBeenCalledWith('request');
    expect(callbacks.onAcceptRequest).toHaveBeenCalledWith('request');
    expect(callbacks.onManageRole).toHaveBeenCalledWith('active');
    expect(callbacks.onManageMember).toHaveBeenNthCalledWith(1, 'invited');
    expect(callbacks.onManageMember).toHaveBeenNthCalledWith(2, 'active');
  });

  it('preserves selections outside the rendered members when selecting all', async () => {
    const onSelectionChange = vi.fn();
    const user = userEvent.setup();
    renderView({ selectedIds: ['hidden'], onSelectionChange });

    await user.click(screen.getByRole('checkbox', { name: 'Select all members' }));

    expect(onSelectionChange).toHaveBeenCalledWith(['hidden', 'request', 'invited', 'active']);
  });

  it('forwards pagination changes and renders an empty state', async () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();
    const user = userEvent.setup();

    const { rerender } = renderView({
      pagination: { page: 2, pageCount: 3, pageSize: 10, pageSizeOptions: [10, 25] },
      onPageChange,
      onPageSizeChange,
    });

    await user.click(screen.getByRole('button', { name: 'Previous members page' }));
    await user.click(screen.getByRole('button', { name: 'Next members page' }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Results per page' }), '25');

    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3);
    expect(onPageSizeChange).toHaveBeenCalledWith(25);

    rerender(
      <MosaicProvider>
        <OrganizationProfileMembersPanelView
          members={[]}
          searchValue=''
          selectedIds={[]}
          onSearchChange={() => undefined}
          onSelectionChange={() => undefined}
        />
      </MosaicProvider>,
    );
    expect(screen.getByText('No members found')).toBeInTheDocument();
  });
});
