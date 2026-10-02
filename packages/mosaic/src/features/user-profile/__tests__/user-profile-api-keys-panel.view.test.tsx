import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../mosaic-provider';
import type { UserProfileAPIKey, UserProfileApiKeysPanelViewProps } from '../user-profile-api-keys-panel.types';
import { UserProfileApiKeysPanelView } from '../user-profile-api-keys-panel.view';

const apiKeys: UserProfileAPIKey[] = [
  {
    id: 'primary',
    name: 'Primary API Key',
    createdAtLabel: 'Jan 5, 2026',
    expiresAtLabel: 'Dec 31, 2027',
    lastUsedAtLabel: '2 minutes ago',
  },
  { id: 'legacy', name: 'Legacy API Key', createdAtLabel: 'Jul 1, 2024', expiresAtLabel: null, lastUsedAtLabel: null },
];

function renderView(overrides: Partial<UserProfileApiKeysPanelViewProps> = {}) {
  const props: UserProfileApiKeysPanelViewProps = {
    apiKeys,
    totalCount: 2,
    page: 1,
    searchValue: '',
    isLoading: false,
    onSearchChange: vi.fn(),
    onPageChange: vi.fn(),
    ...overrides,
  };
  render(
    <MosaicProvider>
      <UserProfileApiKeysPanelView {...props} />
    </MosaicProvider>,
  );
  return props;
}

const columnHeaders = () =>
  within(screen.getByRole('table', { name: 'API Keys' }))
    .getAllByRole('columnheader')
    .map(header => header.textContent);

describe('UserProfileApiKeysPanelView', () => {
  it('renders read-only without create or revoke callbacks', () => {
    renderView();

    expect(screen.getByText('Primary API Key')).toBeVisible();
    expect(columnHeaders()).toEqual(['Name', 'Date created', 'Last used']);
    expect(screen.queryByRole('button', { name: 'Create API key' })).toBeNull();
    expect(screen.queryByRole('button', { name: /^Manage/ })).toBeNull();
  });

  it('offers create and revoke when their callbacks are given', () => {
    renderView({ onCreate: vi.fn(), onRevoke: vi.fn(async () => {}) });

    expect(columnHeaders()).toEqual(['Name', 'Date created', 'Last used', 'Actions']);
    expect(screen.getByRole('button', { name: 'Create API key' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Manage Primary API Key' })).toBeVisible();
  });

  it('only offers selection with a bulk action', async () => {
    const user = userEvent.setup();
    const onBulkAction = vi.fn();
    renderView({ onBulkAction });

    await user.click(screen.getByRole('checkbox', { name: 'Select Primary API Key' }));
    expect(screen.getByRole('checkbox', { name: 'Select all API keys' })).toBePartiallyChecked();
    await user.click(screen.getByRole('checkbox', { name: 'Select all API keys' }));
    expect(screen.getByRole('checkbox', { name: 'Select Legacy API Key' })).toBeChecked();
    expect(onBulkAction).not.toHaveBeenCalled();
  });

  it('has no selection without a bulk action', () => {
    renderView();

    expect(screen.queryByRole('checkbox')).toBeNull();
  });

  it('changes the page size and returns to the first page', async () => {
    const user = userEvent.setup();
    const props = renderView({ page: 2, totalCount: 25, onPageSizeChange: vi.fn() });

    await user.click(screen.getByRole('combobox', { name: /Results per page/ }));
    await user.click(screen.getByRole('option', { name: '20' }));

    expect(props.onPageSizeChange).toHaveBeenCalledWith(20);
    expect(props.onPageChange).toHaveBeenCalledWith(1);
  });

  it('shows a load error instead of the empty state', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    renderView({ apiKeys: [], totalCount: 0, isError: true, onRetry });

    expect(screen.getByText('Could not load API keys')).toBeVisible();
    expect(screen.queryByText('No API Keys created')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
