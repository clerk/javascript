import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { deferred } from '../../../machines/__tests__/test-utils';
import { MosaicProvider } from '../../../MosaicProvider';
import type { RequestsTableTabViewProps } from '../requests-table-tab.types';
import { RequestsTableTabView } from '../requests-table-tab.view';

function propsFor(overrides: Partial<RequestsTableTabViewProps> = {}): RequestsTableTabViewProps {
  return {
    requests: [{ id: 'request-1', email: 'ada@example.com', name: 'Ada Lovelace', requestedAtLabel: 'Sep 1, 2026' }],
    totalCount: 1,
    page: 1,
    searchValue: '',
    isLoading: false,
    onSearchChange: vi.fn(),
    onPageChange: vi.fn(),
    ...overrides,
  };
}
function renderView(overrides: Partial<RequestsTableTabViewProps> = {}) {
  const props = propsFor(overrides);
  return {
    props,
    ...render(
      <MosaicProvider>
        <RequestsTableTabView {...props} />
      </MosaicProvider>,
    ),
  };
}

describe('RequestsTableTabView', () => {
  it.each(['Accept', 'Decline'] as const)(
    'holds the row while %s is pending and allows retry after failure',
    async action => {
      const user = userEvent.setup();
      const attempt = deferred<void>();
      const onDecision = vi
        .fn()
        .mockImplementationOnce(() => attempt.promise)
        .mockResolvedValue(undefined);
      const onOtherDecision = vi.fn();
      renderView({
        onAccept: action === 'Accept' ? onDecision : onOtherDecision,
        onDecline: action === 'Decline' ? onDecision : onOtherDecision,
      });

      await user.click(screen.getByRole('button', { name: `${action} Ada Lovelace` }));
      await user.click(screen.getByRole('button', { name: 'Accept Ada Lovelace' }));
      await user.click(screen.getByRole('button', { name: 'Decline Ada Lovelace' }));
      expect(onDecision).toHaveBeenCalledExactlyOnceWith('request-1');
      expect(onOtherDecision).not.toHaveBeenCalled();

      await act(() => attempt.reject(new Error()));
      expect(await screen.findByRole('alert')).toHaveTextContent(
        action === 'Accept'
          ? 'Unable to accept this request. Please try again.'
          : 'Unable to decline this request. Please try again.',
      );
      await user.click(screen.getByRole('button', { name: `${action} Ada Lovelace` }));
      expect(onDecision).toHaveBeenCalledTimes(2);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    },
  );

  it('distinguishes pending requests from initial loading and empty search results', () => {
    const { props, rerender } = renderView({ requests: [], totalCount: 0, isLoading: true });
    expect(screen.getByRole('status')).toHaveTextContent('Loading requests');
    rerender(
      <MosaicProvider>
        <RequestsTableTabView
          {...props}
          isLoading={false}
          isFetching
        />
      </MosaicProvider>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Loading requests');
    rerender(
      <MosaicProvider>
        <RequestsTableTabView
          {...props}
          isLoading={false}
        />
      </MosaicProvider>,
    );
    expect(screen.getByText('No pending requests')).toBeVisible();
    rerender(
      <MosaicProvider>
        <RequestsTableTabView
          {...props}
          isLoading={false}
          searchValue='Nobody'
        />
      </MosaicProvider>,
    );
    expect(screen.getByText('No requests found')).toBeVisible();
    rerender(
      <MosaicProvider>
        <RequestsTableTabView
          {...propsFor()}
          isFetching
          searchValue='Nobody'
        />
      </MosaicProvider>,
    );
    expect(screen.getByText('ada@example.com')).toBeVisible();
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
  });
  it('connects request controls to caller state and clears selection on search', async () => {
    const user = userEvent.setup();
    const { props } = renderView({
      totalCount: 21,
      onBulkAction: vi.fn(),
      onSortChange: vi.fn(),
      onPageSizeChange: vi.fn(),
    });
    await user.click(screen.getByRole('checkbox', { name: 'Select ada@example.com' }));
    await user.type(screen.getByRole('searchbox', { name: 'Search requests' }), 'A');
    expect(props.onSearchChange).toHaveBeenCalledWith('A');
    expect(screen.getByRole('checkbox', { name: 'Select ada@example.com' })).not.toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Requested' }));
    expect(props.onSortChange).toHaveBeenCalledWith({ column: 'requestedAt', direction: 'ascending' });
    await user.click(screen.getByRole('button', { name: 'Next requests page' }));
    expect(props.onPageChange).toHaveBeenCalledWith(2);
    await user.click(screen.getByRole('combobox', { name: /^Results per page/ }));
    await user.click(screen.getByRole('option', { name: '20', exact: true }));
    expect(props.onPageSizeChange).toHaveBeenCalledWith(20);
    expect(props.onPageChange).toHaveBeenLastCalledWith(1);
  });
  it('holds both request actions while that row has a pending decision', async () => {
    const user = userEvent.setup();
    const { props } = renderView({
      requests: [
        { id: 'request-1', email: 'ada@example.com', requestedAtLabel: 'Sep 1, 2026', pendingAction: 'accept' },
      ],
      onAccept: vi.fn(),
      onDecline: vi.fn(),
    });
    await user.click(screen.getByRole('button', { name: 'Accept ada@example.com' }));
    await user.click(screen.getByRole('button', { name: 'Decline ada@example.com' }));
    expect(props.onAccept).not.toHaveBeenCalled();
    expect(props.onDecline).not.toHaveBeenCalled();
  });
  it('offers only the supplied request actions', () => {
    const { props, rerender } = renderView({ onAccept: vi.fn(), onDecline: vi.fn() });
    expect(screen.getByRole('button', { name: 'Accept Ada Lovelace' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Decline Ada Lovelace' })).toBeVisible();
    rerender(
      <MosaicProvider>
        <RequestsTableTabView
          {...props}
          onAccept={undefined}
        />
      </MosaicProvider>,
    );
    expect(screen.queryByRole('button', { name: 'Accept Ada Lovelace' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Decline Ada Lovelace' })).toBeVisible();
    rerender(
      <MosaicProvider>
        <RequestsTableTabView
          {...props}
          onAccept={undefined}
          onDecline={undefined}
        />
      </MosaicProvider>,
    );
    expect(screen.queryByRole('button', { name: /Accept|Decline/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});

it.each(['Accept', 'Decline'] as const)(
  'runs %s immediately and restores focus as requests leave the list',
  async action => {
    const user = userEvent.setup();
    const onAccept = vi.fn<(id: string) => Promise<void>>().mockResolvedValue(undefined);
    const onDecline = vi.fn<(id: string) => Promise<void>>().mockResolvedValue(undefined);
    const onDecision = action === 'Accept' ? onAccept : onDecline;
    const onOtherDecision = action === 'Accept' ? onDecline : onAccept;
    function Example() {
      const [items, setItems] = useState([
        { id: 'ada', email: 'ada@example.com', requestedAtLabel: 'Sep 1, 2026' },
        { id: 'grace', email: 'grace@example.com', requestedAtLabel: 'Sep 2, 2026' },
      ]);
      return (
        <MosaicProvider>
          <RequestsTableTabView
            {...propsFor()}
            requests={items}
            totalCount={items.length}
            onAccept={async id => {
              await onAccept(id);
              setItems(current => current.filter(item => item.id !== id));
            }}
            onDecline={async id => {
              await onDecline(id);
              setItems(current => current.filter(item => item.id !== id));
            }}
          />
        </MosaicProvider>
      );
    }
    render(<Example />);
    for (const id of ['ada', 'grace']) {
      await user.click(screen.getByRole('button', { name: `${action} ${id}@example.com` }));
      expect(onDecision).toHaveBeenLastCalledWith(id);
      expect(onOtherDecision).not.toHaveBeenCalled();
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      await waitFor(() =>
        expect(
          id === 'ada'
            ? screen.getByRole('button', { name: `${action} grace@example.com` })
            : screen.getByRole('searchbox'),
        ).toHaveFocus(),
      );
    }
  },
);
