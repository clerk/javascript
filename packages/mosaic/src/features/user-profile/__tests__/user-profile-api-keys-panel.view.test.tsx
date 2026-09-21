import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { deferred } from '../../../machines/__tests__/test-utils';
import { MosaicProvider } from '../../../MosaicProvider';
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

function propsFor(overrides: Partial<UserProfileApiKeysPanelViewProps> = {}): UserProfileApiKeysPanelViewProps {
  return {
    apiKeys,
    totalCount: 2,
    page: 1,
    searchValue: '',
    isLoading: false,
    onSearchChange: vi.fn(),
    onPageChange: vi.fn(),
    onCreate: vi.fn(),
    onRevoke: vi.fn(async () => {}),
    ...overrides,
  };
}

function renderView(overrides: Partial<UserProfileApiKeysPanelViewProps> = {}) {
  const props = propsFor(overrides);
  return {
    props,
    ...render(
      <MosaicProvider>
        <UserProfileApiKeysPanelView {...props} />
      </MosaicProvider>,
    ),
  };
}

describe('UserProfileApiKeysPanelView', () => {
  it.each([
    ['', 'No API Keys created', 'API keys allow apps and scripts access your account without signing in'],
    ['   ', 'No API Keys created', 'API keys allow apps and scripts access your account without signing in'],
    ['Special Key', 'No API keys found', 'Your search for "Special Key" did not return any results.'],
  ])('shows the empty state for search "%s"', (searchValue, label, description) => {
    renderView({ apiKeys: [], totalCount: 0, searchValue });

    expect(screen.getByText(label)).toBeVisible();
    expect(screen.getByText(description)).toBeVisible();
  });

  it('localizes the shared confirmation for each selected key', async () => {
    const user = userEvent.setup();
    const onRevoke = vi.fn<(id: string) => Promise<void>>().mockRejectedValueOnce(null);
    render(
      <MosaicProvider
        localization={{
          overrides: {
            'userProfileApiKeysPanel.revokeTitle': 'Retirer {name} ?',
            'userProfileApiKeysPanel.cancel': 'Annuler',
            'userProfileApiKeysPanel.pageSize': 'Résultats par page',
            'userProfileApiKeysPanel.revokeError': 'Impossible de révoquer cette clé.',
          },
        }}
      >
        <UserProfileApiKeysPanelView {...propsFor({ onRevoke, onPageSizeChange: vi.fn() })} />
      </MosaicProvider>,
    );
    expect(screen.getByRole('combobox', { name: 'Résultats par page 10' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Manage Primary API Key' }));
    await user.click(screen.getByRole('menuitem', { name: 'Revoke key' }));
    expect(screen.getByRole('alertdialog')).toHaveAccessibleName('Retirer Primary API Key ?');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Revoke key' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Impossible de révoquer cette clé.');
    await user.click(screen.getByRole('button', { name: 'Annuler' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Manage Legacy API Key' }));
    await user.click(screen.getByRole('menuitem', { name: 'Revoke key' }));
    expect(screen.getByRole('alertdialog')).toHaveAccessibleName('Retirer Legacy API Key ?');
    expect(onRevoke).toHaveBeenCalledExactlyOnceWith('primary');
  });
  it('localizes complete sentences and renders supplied rows even when their names do not match search', () => {
    render(
      <MosaicProvider
        localization={{
          overrides: {
            'userProfileApiKeysPanel.expires': 'Expiration: {expiresDate}',
            'userProfileApiKeysPanel.search': 'Find a key',
          },
        }}
      >
        <UserProfileApiKeysPanelView
          {...propsFor({
            searchValue: 'unmatched',
            apiKeys: [{ ...apiKeys[0], id: 'ak_1234567890FKWO', expiresAtLabel: 'Jul 1, 2025' }],
          })}
        />
      </MosaicProvider>,
    );
    expect(screen.getByText('ak_...FKWO', { exact: false })).toBeVisible();
    expect(screen.getByText('Expiration: Jul 1, 2025')).toBeVisible();
    expect(screen.getByText('Primary API Key')).toBeVisible();
    expect(screen.queryByText('Expired')).not.toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Find a key' })).toHaveValue('unmatched');
  });

  it.each([true, false])(
    'restores focus after the last row is removed with creation available: %s',
    async hasCreate => {
      const user = userEvent.setup();
      const pending = deferred<void>();
      function Example() {
        const [items, setItems] = useState([apiKeys[0]]);
        return (
          <MosaicProvider>
            <UserProfileApiKeysPanelView
              {...propsFor({ onCreate: hasCreate ? vi.fn() : undefined })}
              apiKeys={items}
              totalCount={items.length}
              onRevoke={async () => {
                await pending.promise;
                setItems([]);
              }}
            />
          </MosaicProvider>
        );
      }
      render(<Example />);
      await user.click(screen.getByRole('button', { name: 'Manage Primary API Key' }));
      await user.click(screen.getByRole('menuitem', { name: 'Revoke key' }));
      await user.click(screen.getByRole('button', { name: 'Revoke key' }));
      await act(async () => {
        pending.resolve();
        await pending.promise;
      });
      await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
      expect(screen.getByText('No API Keys created')).toBeVisible();
      expect(
        hasCreate ? screen.getByRole('button', { name: 'Create API key' }) : screen.getByRole('searchbox'),
      ).toHaveFocus();
    },
  );

  it('holds the selected identity while pending, explains failure, and retries successfully', async () => {
    const user = userEvent.setup();
    const attempt = deferred<void>();
    const onRevoke = vi
      .fn<(id: string) => Promise<void>>()
      .mockImplementationOnce(() => attempt.promise)
      .mockResolvedValueOnce(undefined);
    renderView({ onRevoke });
    await user.click(screen.getByRole('button', { name: 'Manage Legacy API Key' }));
    await user.click(screen.getByRole('menuitem', { name: 'Revoke key' }));
    const dialog = screen.getByRole('alertdialog', { name: 'Revoke Legacy API Key?' });
    const confirm = within(dialog).getByRole('button', { name: 'Revoke key' });
    await user.click(confirm);
    expect(confirm).toHaveAttribute('aria-busy', 'true');
    expect(onRevoke).toHaveBeenCalledExactlyOnceWith('legacy');
    expect(dialog).toBeInTheDocument();
    await act(async () => {
      attempt.reject(new Error('Could not revoke this key. Try again.'));
      await attempt.promise.catch(() => {});
    });
    expect(await screen.findByText('Could not revoke this key. Try again.')).toBeVisible();
    expect(dialog).toHaveAccessibleName('Revoke Legacy API Key?');
    await user.click(confirm);
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(onRevoke.mock.calls).toEqual([['legacy'], ['legacy']]);
  });
  it('confirms without typing, cancels safely, and revokes multiple keys with removal focus', async () => {
    const user = userEvent.setup();
    const onRevoke = vi.fn<(id: string) => Promise<void>>(async () => {});
    function Example() {
      const [items, setItems] = useState(apiKeys);
      return (
        <MosaicProvider>
          <UserProfileApiKeysPanelView
            {...propsFor({ onCreate: undefined })}
            apiKeys={items}
            totalCount={items.length}
            onRevoke={async id => {
              await onRevoke(id);
              setItems(current => current.filter(item => item.id !== id));
            }}
          />
        </MosaicProvider>
      );
    }
    render(<Example />);
    await user.click(screen.getByRole('button', { name: 'Manage Primary API Key' }));
    await user.click(screen.getByRole('menuitem', { name: 'Revoke key' }));
    let dialog = screen.getByRole('alertdialog', { name: 'Revoke Primary API Key?' });
    expect(onRevoke).not.toHaveBeenCalled();
    expect(within(dialog).queryByRole('textbox')).not.toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Revoke key' })).toBeEnabled();
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Manage Primary API Key' })).toHaveFocus());
    for (const name of ['Primary API Key', 'Legacy API Key']) {
      await user.click(screen.getByRole('button', { name: `Manage ${name}` }));
      await user.click(screen.getByRole('menuitem', { name: 'Revoke key' }));
      dialog = screen.getByRole('alertdialog', { name: `Revoke ${name}?` });
      expect(within(dialog).queryByRole('textbox')).not.toBeInTheDocument();
      await user.click(within(dialog).getByRole('button', { name: 'Revoke key' }));
      await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
      expect(screen.queryByText(name)).not.toBeInTheDocument();
      if (name === 'Primary API Key') {
        expect(screen.getByRole('button', { name: 'Manage Legacy API Key' })).toHaveFocus();
      }
    }
    expect(onRevoke.mock.calls).toEqual([['primary'], ['legacy']]);
    expect(screen.getByText('No API Keys created')).toBeVisible();
    expect(screen.getByRole('searchbox', { name: 'Search API keys' })).toHaveFocus();
  });
  it('only offers selection with an injected bulk action and has no bulk action button', async () => {
    const user = userEvent.setup();
    const onBulkAction = vi.fn();
    const { props, rerender } = renderView({ onBulkAction });
    expect(screen.queryByRole('button', { name: 'Bulk actions' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'Select Primary API Key' }));
    expect(screen.getByRole('checkbox', { name: 'Select all API keys' })).toBePartiallyChecked();
    expect(screen.getByRole('checkbox', { name: 'Select Primary API Key' })).toBeChecked();
    await user.click(screen.getByRole('checkbox', { name: 'Select all API keys' }));
    expect(screen.getByRole('checkbox', { name: 'Select all API keys' })).toBeChecked();
    rerender(
      <MosaicProvider>
        <UserProfileApiKeysPanelView
          {...props}
          apiKeys={[apiKeys[1]]}
          totalCount={1}
        />
      </MosaicProvider>,
    );
    expect(screen.getByRole('checkbox', { name: 'Select Legacy API Key' })).toBeChecked();
    expect(onBulkAction).not.toHaveBeenCalled();
    rerender(
      <MosaicProvider>
        <UserProfileApiKeysPanelView
          {...props}
          onBulkAction={undefined}
        />
      </MosaicProvider>,
    );
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Bulk actions' })).not.toBeInTheDocument();
  });
  it('navigates actual pages and clears controlled search without changing page size', async () => {
    const user = userEvent.setup();
    const items: UserProfileAPIKey[] = Array.from({ length: 11 }, (_, index) => ({
      ...apiKeys[0],
      id: `key-${index}`,
      name: `Key ${index + 1}`,
    }));
    function Example() {
      const [page, setPage] = useState(1);
      const [searchValue, setSearchValue] = useState('');
      const filtered = items.filter(item => item.name.includes(searchValue));
      return (
        <MosaicProvider>
          <UserProfileApiKeysPanelView
            {...propsFor()}
            apiKeys={filtered.slice((page - 1) * 10, page * 10)}
            totalCount={filtered.length}
            page={page}
            onPageChange={setPage}
            searchValue={searchValue}
            onSearchChange={value => {
              setSearchValue(value);
              setPage(1);
            }}
          />
        </MosaicProvider>
      );
    }
    render(<Example />);
    expect(screen.getByRole('button', { name: '1' })).toHaveAttribute('aria-current', 'page');
    await user.click(screen.getByRole('button', { name: 'Next API keys page' }));
    expect(screen.getByText('Key 11')).toBeVisible();
    expect(screen.queryByText('Key 1')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');
    await user.click(screen.getByRole('button', { name: 'Previous API keys page' }));
    expect(screen.getByText('Key 1')).toBeVisible();
    const input = screen.getByRole('searchbox', { name: 'Search API keys' });
    await user.type(input, 'Key 11');
    expect(input).toHaveValue('Key 11');
    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
    expect(screen.getByRole('button', { name: '1' })).toHaveAttribute('aria-current', 'page');
  });
  it('distinguishes initial loading from retained rows and empty read-only results', () => {
    const props = propsFor({ apiKeys: [], totalCount: 0, isLoading: true, onCreate: undefined, onRevoke: undefined });
    const view = render(
      <MosaicProvider>
        <UserProfileApiKeysPanelView {...props} />
      </MosaicProvider>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Loading API keys');
    expect(screen.queryByText('No API Keys created')).not.toBeInTheDocument();
    view.rerender(
      <MosaicProvider>
        <UserProfileApiKeysPanelView
          {...props}
          apiKeys={apiKeys}
          totalCount={2}
          isLoading={false}
          isFetching
        />
      </MosaicProvider>,
    );
    expect(screen.getByText('Primary API Key')).toBeVisible();
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Actions' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Create API key' })).not.toBeInTheDocument();
    view.rerender(
      <MosaicProvider>
        <UserProfileApiKeysPanelView
          {...props}
          isLoading={false}
        />
      </MosaicProvider>,
    );
    expect(screen.getByText('No API Keys created')).toBeVisible();
    expect(screen.getAllByRole('columnheader')).toHaveLength(3);
  });
  it('renders complete metadata with only the shipped columns and calls creation', async () => {
    const user = userEvent.setup();
    const { props } = renderView();
    expect(screen.getByRole('heading', { name: 'API Keys' })).toBeVisible();
    expect(screen.getAllByRole('columnheader').map(header => header.textContent)).toEqual([
      'Name',
      'Date created',
      'Last used',
      'Actions',
    ]);
    expect(screen.getByRole('cell', { name: 'Jan 5, 2026' })).toBeVisible();
    expect(screen.getByText('Expires Dec 31, 2027')).toBeVisible();
    expect(screen.getByRole('cell', { name: 'Jul 1, 2024' })).toBeVisible();
    expect(screen.getByText('Never expires')).toBeVisible();
    expect(screen.getByText('2 minutes ago')).toBeVisible();
    expect(screen.getByText('-')).toBeVisible();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search API keys' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Create API key' }));
    expect(props.onCreate).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('button', { name: 'Manage Primary API Key' }));
    expect(
      within(screen.getByRole('menu'))
        .getAllByRole('menuitem')
        .map(item => item.textContent),
    ).toEqual(['Revoke key']);
  });
});
