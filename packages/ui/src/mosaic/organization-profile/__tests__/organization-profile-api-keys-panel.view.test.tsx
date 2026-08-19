import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import { OrganizationProfileApiKeysPanelView } from '../organization-profile-api-keys-panel.view';

const apiKeys = [
  {
    id: 'primary',
    name: 'Primary API Key',
    expirationLabel: 'Expires Dec 31, 2027',
    createdAtLabel: 'Jan 05, 2026',
    lastUsedAtLabel: 'Dec 31, 2026',
  },
  {
    id: 'integration',
    name: 'Integration Key',
    expirationLabel: 'Expires Nov 5, 2026',
    createdAtLabel: 'Nov 5, 2025',
    lastUsedAtLabel: 'Nov 5, 2026',
    isExpired: true,
  },
];

function renderView(overrides: Partial<React.ComponentProps<typeof OrganizationProfileApiKeysPanelView>> = {}) {
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
        <OrganizationProfileApiKeysPanelView {...props} />
      </MosaicProvider>,
    ),
    props,
  };
}

describe('OrganizationProfileApiKeysPanelView', () => {
  it('renders key metadata and expiry states', () => {
    renderView();

    expect(screen.getByRole('heading', { level: 3, name: 'API Keys' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search API keys' })).toBeInTheDocument();
    expect(screen.getByText('Primary API Key')).toBeInTheDocument();
    expect(screen.getByText('Jan 05, 2026')).toBeInTheDocument();
    expect(screen.getByText('Expired')).toBeInTheDocument();
  });

  it('forwards search, create, selection, and row actions', async () => {
    const callbacks = {
      onCreate: vi.fn(),
      onManage: vi.fn(),
      onSearchChange: vi.fn(),
      onSelectionChange: vi.fn(),
    };
    const user = userEvent.setup();

    renderView(callbacks);

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search API keys' }), { target: { value: 'primary' } });
    await user.click(screen.getByRole('button', { name: 'Create API key' }));
    await user.click(screen.getByRole('checkbox', { name: 'Select Primary API Key' }));
    await user.click(screen.getByRole('checkbox', { name: 'Select all API keys' }));
    await user.click(screen.getByRole('button', { name: 'Manage Integration Key' }));

    expect(callbacks.onSearchChange).toHaveBeenCalledWith('primary');
    expect(callbacks.onCreate).toHaveBeenCalledOnce();
    expect(callbacks.onSelectionChange).toHaveBeenNthCalledWith(1, ['primary']);
    expect(callbacks.onSelectionChange).toHaveBeenNthCalledWith(2, ['primary', 'integration']);
    expect(callbacks.onManage).toHaveBeenCalledWith('integration');
  });

  it('preserves selections outside the rendered API keys when selecting all', async () => {
    const onSelectionChange = vi.fn();
    const user = userEvent.setup();
    renderView({ selectedIds: ['hidden'], onSelectionChange });

    await user.click(screen.getByRole('checkbox', { name: 'Select all API keys' }));

    expect(onSelectionChange).toHaveBeenCalledWith(['hidden', 'primary', 'integration']);
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

    await user.click(screen.getByRole('button', { name: 'Previous API keys page' }));
    await user.click(screen.getByRole('button', { name: 'Next API keys page' }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Results per page' }), '25');

    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3);
    expect(onPageSizeChange).toHaveBeenCalledWith(25);

    rerender(
      <MosaicProvider>
        <OrganizationProfileApiKeysPanelView
          apiKeys={[]}
          searchValue=''
          selectedIds={[]}
          onSearchChange={() => undefined}
          onSelectionChange={() => undefined}
        />
      </MosaicProvider>,
    );
    expect(screen.getByText('No API keys found')).toBeInTheDocument();
  });
});
