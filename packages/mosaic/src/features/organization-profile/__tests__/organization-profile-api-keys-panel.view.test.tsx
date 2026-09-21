import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { deferred } from '../../../machines/__tests__/test-utils';
import { MosaicProvider } from '../../../MosaicProvider';
import type {
  OrganizationProfileAPIKey,
  OrganizationProfileApiKeysPanelViewProps,
} from '../organization-profile-api-keys-panel.types';
import { OrganizationProfileApiKeysPanelView } from '../organization-profile-api-keys-panel.view';
import type { OrganizationProfileCreateAPIKeyDialogProps } from '../organization-profile-create-api-key.dialog';

const apiKeys: OrganizationProfileAPIKey[] = [
  {
    id: 'primary',
    name: 'Primary API Key',
    createdAtLabel: 'Jan 5, 2026',
    expiresAtLabel: 'Dec 31, 2027',
    lastUsedAtLabel: '2 minutes ago',
  },
  { id: 'legacy', name: 'Legacy API Key', createdAtLabel: 'Jul 1, 2024', expiresAtLabel: null, lastUsedAtLabel: null },
];

function propsFor(
  overrides: Partial<OrganizationProfileApiKeysPanelViewProps> = {},
): OrganizationProfileApiKeysPanelViewProps {
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

function renderView(overrides: Partial<OrganizationProfileApiKeysPanelViewProps> = {}) {
  const props = propsFor(overrides);
  return {
    props,
    ...render(
      <MosaicProvider>
        <OrganizationProfileApiKeysPanelView {...props} />
      </MosaicProvider>,
    ),
  };
}

describe('OrganizationProfileApiKeysPanelView', () => {
  it('renders supplied metadata and only offers actions when callbacks are provided', async () => {
    const user = userEvent.setup();
    const { props, rerender } = renderView();
    const table = screen.getByRole('table', { name: 'API Keys' });
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map(header => header.textContent),
    ).toEqual(['Name', 'Date created', 'Last used', 'Actions']);
    expect(within(table).getByText('Expires Dec 31, 2027')).toBeVisible();
    expect(within(table).getByText('Never expires')).toBeVisible();
    expect(within(table).getByRole('cell', { name: '2 minutes ago' })).toBeVisible();
    expect(within(table).getByRole('cell', { name: '-' })).toBeVisible();
    expect(within(table).queryByRole('checkbox')).not.toBeInTheDocument();
    expect(within(table).queryByRole('button', { name: /sort/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Create API key' }));
    expect(props.onCreate).toHaveBeenCalledOnce();
    rerender(
      <MosaicProvider>
        <OrganizationProfileApiKeysPanelView
          {...props}
          onCreate={undefined}
          onRevoke={undefined}
        />
      </MosaicProvider>,
    );
    expect(screen.getByText('Primary API Key')).toBeVisible();
    expect(screen.getAllByRole('columnheader').map(header => header.textContent)).toEqual([
      'Name',
      'Date created',
      'Last used',
    ]);
    expect(screen.queryByRole('button', { name: 'Create API key' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Manage/ })).not.toBeInTheDocument();
  });
  it.each([
    ['', 'No API Keys created', 'API keys allow apps and scripts to access your organization without signing in.'],
    ['   ', 'No API Keys created', 'API keys allow apps and scripts to access your organization without signing in.'],
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
            'organizationProfileApiKeysPanel.revokeTitle': 'Retirer {name} ?',
            'organizationProfileApiKeysPanel.cancel': 'Annuler',
            'organizationProfileApiKeysPanel.pageSize': 'Résultats par page',
            'organizationProfileApiKeysPanel.revokeError': 'Impossible de révoquer cette clé.',
          },
        }}
      >
        <OrganizationProfileApiKeysPanelView {...propsFor({ onRevoke, onPageSizeChange: vi.fn() })} />
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
            'organizationProfileApiKeysPanel.expires': 'Expiration: {expiresDate}',
            'organizationProfileApiKeysPanel.search': 'Find a key',
          },
        }}
      >
        <OrganizationProfileApiKeysPanelView
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
            <OrganizationProfileApiKeysPanelView
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
          <OrganizationProfileApiKeysPanelView
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
  it('navigates actual pages and clears controlled search without changing page size', async () => {
    const user = userEvent.setup();
    const items: OrganizationProfileAPIKey[] = Array.from({ length: 11 }, (_, index) => ({
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
          <OrganizationProfileApiKeysPanelView
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
        <OrganizationProfileApiKeysPanelView {...props} />
      </MosaicProvider>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Loading API keys');
    expect(screen.queryByText('No API Keys created')).not.toBeInTheDocument();
    view.rerender(
      <MosaicProvider>
        <OrganizationProfileApiKeysPanelView
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
        <OrganizationProfileApiKeysPanelView
          {...props}
          isLoading={false}
        />
      </MosaicProvider>,
    );
    expect(screen.getByText('No API Keys created')).toBeVisible();
    expect(screen.getAllByRole('columnheader')).toHaveLength(3);
  });
});

function dialogPropsFor(
  overrides: Partial<OrganizationProfileCreateAPIKeyDialogProps> = {},
): OrganizationProfileCreateAPIKeyDialogProps {
  return {
    open: true,
    onOpenChange: vi.fn(),
    name: '',
    onNameChange: vi.fn(),
    expiration: null,
    expirationDateLabel: null,
    onExpirationChange: vi.fn(),
    secret: null,
    isPending: false,
    error: null,
    onSubmit: vi.fn(),
    onCopy: vi.fn(),
    ...overrides,
  };
}

function dialogView(createDialog: OrganizationProfileCreateAPIKeyDialogProps) {
  return (
    <MosaicProvider>
      <OrganizationProfileApiKeysPanelView {...propsFor({ createDialog })} />
    </MosaicProvider>
  );
}

describe('organization API key creation', () => {
  it('focuses the name and requires a trimmed name and explicit expiration before submitting', async () => {
    const user = userEvent.setup();
    const props = dialogPropsFor();
    const view = render(dialogView(props));
    const dialog = screen.getByRole('dialog', { name: 'Add new API key' });
    const submit = within(dialog).getByRole('button', { name: 'Add API Key' });
    await waitFor(() => expect(within(dialog).getByRole('textbox', { name: 'Secret key name' })).toHaveFocus());
    expect(submit).toBeDisabled();
    expect(within(dialog).queryByText('This key will never expire')).not.toBeInTheDocument();
    await user.type(within(dialog).getByRole('textbox', { name: 'Secret key name' }), 'A');
    expect(props.onNameChange).toHaveBeenCalledWith('A');
    view.rerender(dialogView({ ...props, name: 'A' }));
    await user.keyboard('{Enter}');
    expect(props.onSubmit).not.toHaveBeenCalled();
    await user.click(within(dialog).getByRole('combobox', { name: /^Expiration/ }));
    expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual([
      'Never',
      '1 Day',
      '7 Days',
      '30 Days',
      '60 Days',
      '90 Days',
      '180 Days',
      '1 Year',
    ]);
    await user.click(screen.getByRole('option', { name: 'Never' }));
    expect(props.onExpirationChange).toHaveBeenCalledWith('never');
    view.rerender(dialogView({ ...props, name: '   ', expiration: 'never' }));
    expect(submit).toBeDisabled();
    view.rerender(dialogView({ ...props, name: 'A', expiration: 'never' }));
    expect(within(dialog).getByText('This key will never expire')).toBeVisible();
    await user.click(submit);
    expect(props.onSubmit).toHaveBeenCalledOnce();
  });

  it('holds the form while pending and displays errors without losing input before retry', async () => {
    const user = userEvent.setup();
    const props = dialogPropsFor({ name: 'Deploy', expiration: '7d', expirationDateLabel: 'Sep 28, 2026' });
    const view = render(dialogView(props));
    expect(screen.getByText('This key will expire on Sep 28, 2026')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Add API Key' }));
    view.rerender(dialogView({ ...props, isPending: true }));
    expect(screen.getByRole('textbox', { name: 'Secret key name' })).toBeDisabled();
    expect(screen.getByRole('combobox', { name: /^Expiration/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Add API Key' })).toHaveAttribute('aria-disabled', 'true');
    await user.click(screen.getByRole('button', { name: 'Add API Key' }));
    expect(props.onSubmit).toHaveBeenCalledOnce();
    await user.keyboard('{Escape}');
    expect(props.onOpenChange).not.toHaveBeenCalled();
    view.rerender(dialogView({ ...props, error: 'Creation failed. Try again.' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Creation failed. Try again.');
    expect(screen.getByRole('textbox', { name: 'Secret key name' })).toHaveValue('Deploy');
    await user.click(screen.getByRole('button', { name: 'Add API Key' }));
    expect(props.onSubmit).toHaveBeenCalledTimes(2);
  });

  it('focuses Copy beside the secret text and keeps both copy intents retryable', async () => {
    const user = userEvent.setup();
    const props = dialogPropsFor({ name: 'Deploy', expiration: 'never' });
    const view = render(dialogView(props));
    await user.click(screen.getByRole('button', { name: 'Add API Key' }));
    const returned = { ...props, secret: 'ak_org_secret' };
    view.rerender(dialogView(returned));
    const dialog = await screen.findByRole('dialog', { name: 'Copy your API Key' });
    const secret = within(dialog).getByText('ak_org_secret');
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Copy API key' })).toHaveFocus());
    expect(secret).toBeVisible();
    expect(within(dialog).queryByRole('textbox')).not.toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Copy API key' }));
    expect(props.onCopy).toHaveBeenLastCalledWith(false);
    view.rerender(dialogView({ ...returned, isPending: true }));
    expect(within(dialog).getByRole('button', { name: 'Copy API key' })).toBeDisabled();
    expect(within(dialog).getByRole('button', { name: 'Copy and close' })).toHaveAttribute('aria-disabled', 'true');
    await user.click(within(dialog).getByRole('button', { name: 'Copy and close' }));
    expect(props.onCopy).toHaveBeenCalledOnce();
    await user.keyboard('{Escape}');
    expect(props.onOpenChange).not.toHaveBeenCalled();
    view.rerender(dialogView({ ...returned, error: 'Copy failed. Try again.' }));
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Copy failed. Try again.');
    expect(secret).toHaveTextContent('ak_org_secret');
    await user.click(within(dialog).getByRole('button', { name: 'Copy and close' }));
    expect(props.onCopy).toHaveBeenNthCalledWith(1, false);
    expect(props.onCopy).toHaveBeenNthCalledWith(2, true);
    await user.keyboard('{Escape}');
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });
});
