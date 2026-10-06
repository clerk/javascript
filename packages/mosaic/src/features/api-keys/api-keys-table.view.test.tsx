import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { apiKeysTableMessages, resolveAPIKeysTableMessages } from './api-keys-table.messages';
import { APIKeysTableSkeleton } from './api-keys-table.skeleton';
import type { APIKey, APIKeysTableViewProps } from './api-keys-table.types';
import { APIKeysTableView } from './api-keys-table.view';

const messages = resolveAPIKeysTableMessages(apiKeysTableMessages, 'user');

const keys = (count: number, start = 1): APIKey[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `ak_${start + index}`,
    name: `Key ${start + index}`,
    createdAtLabel: 'Jan 5, 2026',
    expiresAtLabel: null,
    lastUsedAtLabel: null,
  }));

function props(overrides: Partial<APIKeysTableViewProps> = {}): APIKeysTableViewProps {
  return {
    messages,
    apiKeys: keys(10),
    totalCount: 12,
    page: 1,
    searchValue: '',
    isLoading: false,
    onPageChange: vi.fn(),
    onSearchChange: vi.fn(),
    refetchSkeleton: true,
    ...overrides,
  };
}

const bodyRows = (container: HTMLElement) => container.querySelectorAll('tbody tr');

describe('APIKeysTableView skeleton', () => {
  it('renders the first load as three placeholder rows behind a loading status', () => {
    const { container } = render(<APIKeysTableSkeleton />);

    expect(screen.getByRole('status')).toHaveTextContent(messages.loading);
    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.queryByRole('searchbox')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
    expect(bodyRows(container)).toHaveLength(3);
  });

  it('shows exactly the rows of the next page while it loads', async () => {
    const view = props();
    const { container, rerender } = render(<APIKeysTableView {...view} />);

    await userEvent.click(screen.getByRole('button', { name: messages.nextPage }));
    expect(view.onPageChange).toHaveBeenCalledWith(2);
    rerender(
      <APIKeysTableView
        {...view}
        page={2}
        isFetching
      />,
    );

    expect(bodyRows(container)).toHaveLength(2);
    expect(container.querySelector('tbody')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('columnheader', { name: messages.name })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(messages.loading);
  });

  it('shows three rows while a new search loads', async () => {
    const view = props();
    const { container, rerender } = render(<APIKeysTableView {...view} />);

    await userEvent.type(screen.getByRole('searchbox', { name: messages.search }), 'k');
    expect(view.onSearchChange).toHaveBeenCalledWith('k');
    rerender(
      <APIKeysTableView
        {...view}
        searchValue='k'
        isFetching
      />,
    );

    expect(bodyRows(container)).toHaveLength(3);
  });

  it('keeps the current rows while fetching without refetchSkeleton', () => {
    render(
      <APIKeysTableView
        {...props({ refetchSkeleton: false })}
        page={2}
        isFetching
      />,
    );

    expect(within(screen.getByRole('table')).getByText('Key 1')).toBeInTheDocument();
    expect(screen.queryByRole('status')).toBeNull();
  });
});
