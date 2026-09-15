import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import { UserProfileApiKeysPanelView } from '../user-profile-api-keys-panel.view';

const apiKeys = [
  {
    id: 'primary',
    name: 'Primary API Key',
    expirationLabel: 'Expires Dec 31, 2027',
    createdAtLabel: 'Jan 05, 2026',
    lastUsedAtLabel: 'Dec 31, 2026',
  },
  {
    id: 'legacy',
    name: 'Legacy API Key',
    expirationLabel: 'Expired Jul 1, 2025',
    createdAtLabel: 'Jul 1, 2024',
    lastUsedAtLabel: 'Jul 1, 2025',
    isExpired: true,
  },
];

function renderView(overrides: Partial<React.ComponentProps<typeof UserProfileApiKeysPanelView>> = {}) {
  const props = {
    apiKeys,
    searchValue: '',
    selectedIds: [],
    onSearchChange: vi.fn(),
    onSelectionChange: vi.fn(),
    ...overrides,
  };

  return {
    ...render(
      <MosaicProvider>
        <UserProfileApiKeysPanelView {...props} />
      </MosaicProvider>,
    ),
    props,
  };
}

describe('UserProfileApiKeysPanelView', () => {
  it('renders search, key metadata, and expired state', () => {
    renderView();

    expect(screen.getByRole('heading', { level: 3, name: 'API Keys' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search API keys' })).toBeInTheDocument();
    expect(screen.getByText('Primary API Key')).toBeInTheDocument();
    expect(screen.getByText('Expired')).toBeInTheDocument();
  });

  it('forwards search, selection, creation, and revoke actions', async () => {
    const onCreate = vi.fn();
    const onRevoke = vi.fn();
    const onSearchChange = vi.fn();
    const onSelectionChange = vi.fn();
    const user = userEvent.setup();

    renderView({ onCreate, onRevoke, onSearchChange, onSelectionChange });

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search API keys' }), { target: { value: 'primary' } });
    await user.click(screen.getByRole('button', { name: 'Create API key' }));
    await user.click(screen.getByRole('checkbox', { name: 'Select Primary API Key' }));
    await user.click(screen.getByRole('checkbox', { name: 'Select all API keys' }));
    await user.click(screen.getByRole('button', { name: 'Manage Primary API Key' }));
    await user.click(screen.getByRole('menuitem', { name: 'Revoke' }));

    expect(onSearchChange).toHaveBeenCalledWith('primary');
    expect(onCreate).toHaveBeenCalledOnce();
    expect(onSelectionChange).toHaveBeenNthCalledWith(1, ['primary']);
    expect(onSelectionChange).toHaveBeenNthCalledWith(2, ['primary', 'legacy']);
    expect(onRevoke).toHaveBeenCalledWith('primary');
  });

  it('forwards page and results-per-page changes', async () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();
    const user = userEvent.setup();

    renderView({
      pagination: { page: 2, pageCount: 3, pageSize: 10, pageSizeOptions: [10, 25] },
      onPageChange,
      onPageSizeChange,
    });

    await user.click(screen.getByRole('button', { name: 'Previous API keys page' }));
    await user.click(screen.getByRole('button', { name: 'Next API keys page' }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Results per page' }), '25');

    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3);
    expect(onPageSizeChange).toHaveBeenCalledWith(25);
  });

  it('renders an empty state', () => {
    renderView({ apiKeys: [] });

    expect(screen.getByText('No API keys found')).toBeInTheDocument();
  });
});
