import type { ApiKeyJSON } from '@clerk/shared/types';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, onTestFinished, vi } from 'vitest';

import { type FakeFapiSeed, fapiUrl, holdRequests, serveFapi, worker } from '../../../__tests__/feature/fake-fapi';
import {
  fapiApiKey,
  fapiClient,
  fapiEmailAddress,
  fapiEnvironment,
  fapiMembership,
  fapiOrganization,
  fapiSession,
  fapiUser,
} from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { MosaicProvider } from '../../../mosaic-provider';
import type { APIKeysTableProps } from '../api-keys-table';
import { APIKeysTable } from '../api-keys-table';

const DAY = 24 * 60 * 60 * 1000;

const acme = fapiOrganization({ id: 'org_1', name: 'Acme' });

const alice = fapiUser({
  id: 'user_1',
  first_name: 'Alice',
  email_addresses: [fapiEmailAddress({ id: 'idn_alice', email_address: 'alice@example.com' })],
  organization_memberships: [fapiMembership(acme)],
});

const userKey = (id: string, name: string, overrides: Partial<ApiKeyJSON> = {}) =>
  fapiApiKey({ id, name, subject: alice.id, created_at: Date.UTC(2026, 0, 5, 12), ...overrides });

const webApp = userKey('ak_1234567890FKWO', 'Web app', { expiration: Date.UTC(2027, 11, 31, 12) });
const ciPipeline = userKey('ak_2', 'CI pipeline', { last_used_at: Date.now() - 2 * 60_000 });

const manyKeys = Array.from({ length: 11 }, (_, index) => userKey(`ak_${index + 1}`, `Key ${index + 1}`));

function signedIn(apiKeys: ApiKeyJSON[] = [webApp, ciPipeline], overrides: FakeFapiSeed = {}): FakeFapiSeed {
  return {
    environment: fapiEnvironment({ api_keys_settings: { user_api_keys_enabled: true, orgs_api_keys_enabled: true } }),
    client: fapiClient([fapiSession({ id: 'sess_1', user: alice, last_active_organization_id: acme.id })]),
    apiKeys,
    ...overrides,
  };
}

async function renderTable(seed: FakeFapiSeed = signedIn(), props: Partial<APIKeysTableProps> = {}) {
  const fapi = serveFapi(seed);
  const view = await renderWithClerk(
    <APIKeysTable
      subject={alice.id}
      {...props}
    />,
  );
  return { ...view, fapi, user: userEvent.setup() };
}

type User = ReturnType<typeof userEvent.setup>;

const table = () => screen.getByRole('table', { name: 'API Keys' });

async function expectFallback(seed: FakeFapiSeed, props: Partial<APIKeysTableProps> = {}) {
  await renderTable(seed, { fallback: <p>Unavailable</p>, ...props });

  expect(await screen.findByText('Unavailable')).toBeVisible();
  expect(screen.queryByRole('table', { name: 'API Keys' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Create API key' })).toBeNull();
}

async function openCreate(user: User) {
  await user.click(await screen.findByRole('button', { name: 'Create API key' }));
  return screen.findByRole('dialog', { name: 'Add new API key' });
}

async function fillCreate(user: User, dialog: HTMLElement, name: string, expiration: string) {
  await user.type(within(dialog).getByRole('textbox', { name: 'Secret key name' }), name);
  await user.click(within(dialog).getByRole('combobox', { name: /^Expiration/ }));
  await user.click(await screen.findByRole('option', { name: expiration }));
}

async function startRevoke(user: User, name: string) {
  await user.click(await screen.findByRole('button', { name: `Manage ${name}` }));
  await user.click(await screen.findByRole('menuitem', { name: 'Revoke key' }));
  return screen.findByRole('dialog', { name: `Revoke ${name}?` });
}

async function openRevoke(user: User, name: string) {
  const dialog = await startRevoke(user, name);
  await user.type(within(dialog).getByRole('textbox'), name);
  return dialog;
}

function failRevokeOnce(id: string) {
  worker.use(
    http.post(
      fapiUrl(`/api_keys/${id}/revoke`),
      () =>
        HttpResponse.json(
          {
            errors: [
              {
                code: 'api_key_revoke_failed',
                message: 'api_key_revoke_failed',
                long_message: 'api_key_revoke_failed',
              },
            ],
          },
          { status: 400 },
        ),
      { once: true },
    ),
  );
}

describe('APIKeysTable', () => {
  describe('listing keys', () => {
    it("shows the user's own keys, not the active organization's", async () => {
      await renderTable(
        signedIn([webApp, ciPipeline, fapiApiKey({ id: 'ak_org', name: 'Org key', subject: acme.id })]),
      );

      expect(await within(table()).findByText('Web app')).toBeVisible();
      expect(within(table()).getByText('CI pipeline')).toBeVisible();
      expect(within(table()).queryByText('Org key')).toBeNull();
    });

    it('describes when each key was created, last used, and expires', async () => {
      await renderTable();

      await within(table()).findByText('Web app');
      expect(within(table()).getAllByRole('cell', { name: 'Jan 5, 2026' })).toHaveLength(2);
      expect(within(table()).getByText('Expires Dec 31, 2027')).toBeVisible();
      expect(within(table()).getByText('Never expires')).toBeVisible();
      expect(within(table()).getByRole('cell', { name: '2 minutes ago' })).toBeVisible();
      expect(within(table()).getByRole('cell', { name: '-' })).toBeVisible();
      expect(within(table()).getByText('ak_...FKWO', { exact: false })).toBeVisible();
    });

    it('describes a key last used after the table read the time as used now', async () => {
      await renderTable(signedIn([userKey('ak_3', 'Worker', { last_used_at: Date.now() + 5 * 60_000 })]));

      expect(await within(table()).findByRole('cell', { name: 'now' })).toBeVisible();
    });

    it('shows loading until the first page arrives', async () => {
      serveFapi(signedIn());
      const list = holdRequests('get', '/api_keys');
      await renderWithClerk(<APIKeysTable subject={alice.id} />);

      expect(await screen.findByRole('status')).toHaveTextContent('Loading API keys');
      list.release();
      expect(await within(table()).findByText('Web app')).toBeVisible();
      expect(screen.queryByRole('status')).toBeNull();
    });

    it('explains when the user has no keys', async () => {
      await renderTable(signedIn([]));

      expect(await screen.findByText('No API Keys created')).toBeVisible();
      expect(
        screen.getByText('API keys allow apps and scripts to access your account without signing in.'),
      ).toBeVisible();
    });

    it('treats a blank search as no search', async () => {
      const { user } = await renderTable(signedIn([]));
      await screen.findByText('No API Keys created');

      await user.type(screen.getByRole('searchbox', { name: 'Search API keys' }), '   ');

      expect(screen.getByText('No API Keys created')).toBeVisible();
      expect(screen.queryByText(/did not return any results/)).toBeNull();
    });

    it('uses the messages it is given over its own', async () => {
      await renderTable(signedIn([]), { messages: { noKeys: 'Nothing here yet' } });

      expect(await screen.findByText('Nothing here yet')).toBeVisible();
    });

    it('uses the localization of its provider', async () => {
      serveFapi(signedIn());
      await renderWithClerk(
        <MosaicProvider
          localization={{
            overrides: {
              'apiKeysTable.search': 'Find a key',
              'apiKeysTable.expires': 'Expiration: {expiresDate}',
              'apiKeysTable.revokeTitle': 'Retirer {name} ?',
            },
          }}
        >
          <APIKeysTable subject={alice.id} />
        </MosaicProvider>,
      );
      const user = userEvent.setup();

      expect(await within(table()).findByText('Expiration: Dec 31, 2027')).toBeVisible();
      expect(screen.getByRole('searchbox', { name: 'Find a key' })).toBeVisible();
      await user.click(screen.getByRole('button', { name: 'Manage Web app' }));
      await user.click(await screen.findByRole('menuitem', { name: 'Revoke key' }));
      const dialog = await screen.findByRole('dialog', { name: 'Retirer Web app ?' });
      await waitFor(() => expect(dialog).toBeVisible());
    });

    it('explains a failed load instead of showing no keys, and loads again on retry', { timeout: 20_000 }, async () => {
      let failing = true;
      serveFapi(signedIn());
      worker.use(
        http.get(fapiUrl('/api_keys'), () =>
          failing
            ? HttpResponse.json({ errors: [{ code: 'internal_error', message: 'internal_error' }] }, { status: 400 })
            : undefined,
        ),
      );
      await renderWithClerk(<APIKeysTable subject={alice.id} />);
      const user = userEvent.setup();

      expect(await screen.findByText('Could not load API keys', undefined, { timeout: 15_000 })).toBeVisible();
      expect(screen.queryByText('No API Keys created')).toBeNull();

      failing = false;
      await user.click(screen.getByRole('button', { name: 'Try again' }));
      expect(await within(table()).findByText('Web app')).toBeVisible();
    });
  });

  describe('availability', () => {
    it('renders the fallback when signed out', async () => {
      await expectFallback(signedIn([], { client: fapiClient([]) }));
    });

    it('renders the fallback when user API keys are disabled', async () => {
      await expectFallback(
        signedIn([], { environment: fapiEnvironment({ api_keys_settings: { orgs_api_keys_enabled: true } }) }),
      );
    });

    it('renders the fallback for a user other than the signed-in one', async () => {
      await expectFallback(signedIn(), { subject: 'user_2' });
    });
  });

  describe('searching', () => {
    it('lists only matching keys and explains when nothing matches', async () => {
      const { user } = await renderTable();
      await within(table()).findByText('CI pipeline');
      const search = screen.getByRole('searchbox', { name: 'Search API keys' });

      await user.type(search, 'web');
      await waitFor(() => expect(within(table()).queryByText('CI pipeline')).toBeNull());
      expect(within(table()).getByText('Web app')).toBeVisible();

      await user.clear(search);
      await user.type(search, 'nothing');
      expect(await screen.findByText('Your search for "nothing" did not return any results.')).toBeVisible();
    });

    it('clears the search and keeps focus in it', async () => {
      const { user } = await renderTable();
      await within(table()).findByText('CI pipeline');
      const search = screen.getByRole('searchbox', { name: 'Search API keys' });
      await user.type(search, 'web');
      await waitFor(() => expect(within(table()).queryByText('CI pipeline')).toBeNull());

      await user.click(screen.getByRole('button', { name: 'Clear search' }));

      expect(search).toHaveValue('');
      expect(search).toHaveFocus();
      expect(await within(table()).findByText('CI pipeline')).toBeVisible();
    });

    it('returns to the first page for a new search', async () => {
      const { user } = await renderTable(signedIn(manyKeys));

      await user.click(await screen.findByRole('button', { name: 'Next API keys page' }));
      expect(await within(table()).findByText('Key 11')).toBeVisible();

      await user.type(screen.getByRole('searchbox', { name: 'Search API keys' }), 'Key 1');
      expect(await within(table()).findByText('Key 10')).toBeVisible();
      expect(within(table()).getByText('Key 1')).toBeVisible();
    });
  });

  describe('paging', () => {
    it('moves between pages of keys', async () => {
      const { user } = await renderTable(signedIn(manyKeys));

      expect(await within(table()).findByText('Key 1')).toBeVisible();
      expect(screen.getByText('1/2')).toBeVisible();

      const next = holdRequests('get', '/api_keys');
      await user.click(screen.getByRole('button', { name: 'Next API keys page' }));
      await waitFor(() => expect(table()).toHaveAttribute('aria-busy', 'true'));
      expect(within(table()).getByText('Key 1')).toBeVisible();
      next.release();
      expect(await within(table()).findByText('Key 11')).toBeVisible();
      expect(within(table()).queryByText('Key 1')).toBeNull();

      await user.click(screen.getByRole('button', { name: 'Previous API keys page' }));
      expect(await within(table()).findByText('Key 1')).toBeVisible();
    });

    it.todo('uses a configured page size');
  });

  describe('creating a key', () => {
    it('creates a key for the user, shows its secret once, and lists it', async () => {
      const { fapi, user } = await renderTable();
      const dialog = await openCreate(user);

      await fillCreate(user, dialog, 'Deploy', '7 Days');
      await user.click(within(dialog).getByRole('button', { name: 'Add API Key' }));

      const secret = await within(dialog).findByRole('textbox', { name: 'API key' });
      const [created] = fapi.apiKeys;
      expect(created).toMatchObject({ name: 'Deploy', subject: alice.id });
      expect(created.expiration).toBeGreaterThan(Date.now() + 6 * DAY);
      expect(secret).toHaveValue(`ak_secret_${created.id}`);

      await user.click(within(dialog).getByRole('button', { name: 'Copy and close' }));
      await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
      expect(await within(table()).findByText('Deploy')).toBeVisible();
    });

    it('shows the secret without waiting for the list to refresh', async () => {
      const { fapi, user } = await renderTable();
      const dialog = await openCreate(user);
      await fillCreate(user, dialog, 'Deploy', 'Never');
      const refresh = holdRequests('get', '/api_keys');

      await user.click(within(dialog).getByRole('button', { name: 'Add API Key' }));

      expect(await within(dialog).findByRole('textbox', { name: 'API key' })).toHaveValue(
        `ak_secret_${fapi.apiKeys[0].id}`,
      );
      refresh.release();
      expect(await within(table()).findByText('Deploy')).toBeVisible();
    });

    it('copies the secret without closing the dialog', async () => {
      await navigator.clipboard.writeText('');
      const { fapi, user } = await renderTable();
      const dialog = await openCreate(user);
      await fillCreate(user, dialog, 'Deploy', 'Never');
      await user.click(within(dialog).getByRole('button', { name: 'Add API Key' }));

      await user.click(await within(dialog).findByRole('button', { name: 'Copy API key' }));

      await expect(navigator.clipboard.readText()).resolves.toBe(`ak_secret_${fapi.apiKeys[0].id}`);
      expect(screen.getByRole('alertdialog', { name: 'Add new API key' })).toBeVisible();
    });

    it('keeps the secret open on an outside click but closes it on Escape', async () => {
      const { user } = await renderTable();
      const dialog = await openCreate(user);
      await fillCreate(user, dialog, 'Deploy', 'Never');
      await user.click(within(dialog).getByRole('button', { name: 'Add API Key' }));
      await within(dialog).findByRole('textbox', { name: 'API key' });
      const backdrop = document.querySelector('.cl-dialog-backdrop');
      if (!backdrop) {
        throw new Error('Expected the dialog backdrop');
      }

      await user.click(backdrop);
      expect(dialog).not.toHaveAttribute('data-closed');
      expect(screen.getByRole('alertdialog', { name: 'Add new API key' })).toBeVisible();

      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    });

    it('explains a failed copy', async () => {
      const { user } = await renderTable();
      const dialog = await openCreate(user);
      await fillCreate(user, dialog, 'Deploy', 'Never');
      await user.click(within(dialog).getByRole('button', { name: 'Add API Key' }));
      await within(dialog).findByRole('textbox', { name: 'API key' });
      const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('blocked'));
      onTestFinished(() => writeText.mockRestore());

      await user.click(within(dialog).getByRole('button', { name: 'Copy and close' }));
      await waitFor(() =>
        expect(within(dialog).getByRole('alert')).toHaveTextContent('Could not copy the API key. Try again.'),
      );
      expect(dialog).toBeVisible();
    });

    it('focuses the name and requires an expiration', async () => {
      const { user } = await renderTable();
      const dialog = await openCreate(user);
      const name = within(dialog).getByRole('textbox', { name: 'Secret key name' });
      const add = within(dialog).getByRole('button', { name: 'Add API Key' });

      await waitFor(() => expect(name).toHaveFocus());
      await user.type(name, 'Deploy');
      expect(add).toBeDisabled();

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
      await waitFor(() => expect(within(dialog).getByText('This key will never expire')).toBeVisible());
      expect(add).toBeEnabled();
    });

    it('requires a name longer than two characters', async () => {
      const { user } = await renderTable();
      const dialog = await openCreate(user);
      const add = within(dialog).getByRole('button', { name: 'Add API Key' });

      await fillCreate(user, dialog, 'ab', 'Never');
      expect(add).toBeDisabled();

      await user.type(within(dialog).getByRole('textbox', { name: 'Secret key name' }), 'c');
      expect(add).toBeEnabled();
    });

    it('holds the form while the key is created', async () => {
      const { user } = await renderTable();
      const dialog = await openCreate(user);
      await fillCreate(user, dialog, 'Deploy', 'Never');
      const create = holdRequests('post', '/api_keys');

      await user.click(within(dialog).getByRole('button', { name: 'Add API Key' }));
      await waitFor(() =>
        expect(within(dialog).getByRole('textbox', { name: 'Secret key name' })).toHaveAttribute(
          'aria-disabled',
          'true',
        ),
      );
      expect(within(dialog).getByRole('button', { name: 'Add API Key' })).toHaveAttribute('aria-busy', 'true');

      create.release();
      expect(await within(dialog).findByRole('textbox', { name: 'API key' })).toBeVisible();
    });

    it('explains a name that is already taken and keeps the form', async () => {
      const { user } = await renderTable();
      const dialog = await openCreate(user);

      await fillCreate(user, dialog, 'Web app', 'Never');
      await user.click(within(dialog).getByRole('button', { name: 'Add API Key' }));

      await waitFor(() => expect(within(dialog).getByRole('alert')).toHaveTextContent('API Key name already exists.'));
      expect(within(dialog).getByRole('textbox', { name: 'Secret key name' })).toHaveValue('Web app');
    });

    it('explains when the usage limit is reached', async () => {
      const { user } = await renderTable();
      const dialog = await openCreate(user);
      await fillCreate(user, dialog, 'Deploy', 'Never');
      const create = holdRequests('post', '/api_keys');

      await user.click(within(dialog).getByRole('button', { name: 'Add API Key' }));
      create.fail('token_quota_exceeded');

      await waitFor(() =>
        expect(within(dialog).getByRole('alert')).toHaveTextContent(
          'You have reached your usage limit. You can remove the limit by upgrading to a paid plan.',
        ),
      );
    });

    it('explains a failure Clerk cannot describe with the create error', async () => {
      const { user } = await renderTable();
      const dialog = await openCreate(user);
      await fillCreate(user, dialog, 'Deploy', 'Never');
      worker.use(http.post(fapiUrl('/api_keys'), () => HttpResponse.json({ errors: [] }, { status: 500 })));

      await user.click(within(dialog).getByRole('button', { name: 'Add API Key' }));

      await waitFor(() =>
        expect(within(dialog).getByRole('alert')).toHaveTextContent('Could not create the API key. Try again.'),
      );
    });

    it.todo('creates a key with an optional description when descriptions are enabled');
  });

  describe('revoking a key', () => {
    it('revokes the key once its name is typed and removes it from the list', async () => {
      const { fapi, user } = await renderTable();
      const dialog = await openRevoke(user, 'Web app');

      await user.click(within(dialog).getByRole('button', { name: 'Revoke key' }));

      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      await waitFor(() => expect(within(table()).queryByText('Web app')).toBeNull());
      expect(within(table()).getByText('CI pipeline')).toBeVisible();
      expect(fapi.apiKeys.find(key => key.id === webApp.id)?.revoked).toBe(true);
    });

    it('revokes only once the exact name is typed, and returns focus on cancel', async () => {
      const { fapi, user } = await renderTable();
      const dialog = await startRevoke(user, 'Web app');

      await user.type(
        within(dialog).getByRole('textbox', { name: 'Type “Web app” below to continue' }),
        'web app{Enter}',
      );
      expect(within(dialog).getByRole('button', { name: 'Revoke key' })).toHaveAttribute('aria-disabled', 'true');

      await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      await waitFor(() => expect(screen.getByRole('button', { name: 'Manage Web app' })).toHaveFocus());
      expect(fapi.apiKeys.find(key => key.id === webApp.id)?.revoked).toBeFalsy();
    });

    it('holds the dialog while the key is revoked', async () => {
      const { user } = await renderTable();
      const dialog = await openRevoke(user, 'Web app');
      const revoke = holdRequests('post', `/api_keys/${webApp.id}/revoke`);

      await user.click(within(dialog).getByRole('button', { name: 'Revoke key' }));
      await waitFor(() => expect(within(dialog).getByRole('textbox')).toBeDisabled());
      expect(within(dialog).getByRole('button', { name: 'Revoke key' })).toHaveAttribute('aria-busy', 'true');

      revoke.release();
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    });

    it('explains a failed revoke, keeps the dialog open, and revokes on retry', async () => {
      const { fapi, user } = await renderTable();
      const dialog = await openRevoke(user, 'Web app');
      failRevokeOnce(webApp.id);

      await user.click(within(dialog).getByRole('button', { name: 'Revoke key' }));

      await waitFor(() =>
        expect(within(dialog).getByRole('textbox')).toHaveAccessibleDescription('api_key_revoke_failed'),
      );
      expect(within(dialog).getByRole('textbox')).toHaveValue('Web app');

      await user.click(within(dialog).getByRole('button', { name: 'Revoke key' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(fapi.apiKeys.find(key => key.id === webApp.id)?.revoked).toBe(true);
    });

    it('starts each revoke without the previous failure', async () => {
      const { user } = await renderTable();
      const first = await openRevoke(user, 'Web app');
      failRevokeOnce(webApp.id);
      await user.click(within(first).getByRole('button', { name: 'Revoke key' }));
      await waitFor(() =>
        expect(within(first).getByRole('textbox')).toHaveAccessibleDescription('api_key_revoke_failed'),
      );
      await user.click(within(first).getByRole('button', { name: 'Cancel' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

      const second = await startRevoke(user, 'CI pipeline');

      expect(within(second).getByRole('textbox')).toHaveValue('');
      expect(within(second).getByRole('textbox')).not.toHaveAccessibleDescription('api_key_revoke_failed');
    });

    it('moves focus to the next key, then to create once no keys are left', async () => {
      const { user } = await renderTable();

      await user.click(within(await openRevoke(user, 'Web app')).getByRole('button', { name: 'Revoke key' }));
      await waitFor(() => expect(screen.getByRole('button', { name: 'Manage CI pipeline' })).toHaveFocus());

      await user.click(within(await openRevoke(user, 'CI pipeline')).getByRole('button', { name: 'Revoke key' }));
      expect(await screen.findByText('No API Keys created')).toBeVisible();
      await waitFor(() => expect(screen.getByRole('button', { name: 'Create API key' })).toHaveFocus());
    });

    it('returns to the previous page when the last key on a page is revoked', async () => {
      const { user } = await renderTable(signedIn(manyKeys));
      await user.click(await screen.findByRole('button', { name: 'Next API keys page' }));
      const dialog = await openRevoke(user, 'Key 11');

      await user.click(within(dialog).getByRole('button', { name: 'Revoke key' }));

      expect(await within(table()).findByText('Key 1')).toBeVisible();
      await waitFor(() => expect(screen.queryByRole('button', { name: 'Next API keys page' })).toBeNull());
    });
  });

  describe('for an organization', () => {
    const readKeys = 'org:sys_api_keys:read';
    const manageKeys = 'org:sys_api_keys:manage';
    const orgKey = fapiApiKey({
      id: 'ak_org',
      name: 'Org key',
      subject: acme.id,
      created_at: Date.UTC(2026, 0, 5, 12),
    });

    function memberOfAcme(permissions: string[], apiKeys: ApiKeyJSON[] = [orgKey, webApp]): FakeFapiSeed {
      const member = fapiUser({ ...alice, organization_memberships: [fapiMembership(acme, { permissions })] });
      return signedIn(apiKeys, {
        client: fapiClient([fapiSession({ id: 'sess_1', user: member, last_active_organization_id: acme.id })]),
      });
    }

    it("lists the organization's keys and lets a manager create one for it", async () => {
      const { fapi, user } = await renderTable(memberOfAcme([readKeys, manageKeys]), { subject: acme.id });

      expect(await within(table()).findByText('Org key')).toBeVisible();
      expect(within(table()).queryByText('Web app')).toBeNull();

      const dialog = await openCreate(user);
      await fillCreate(user, dialog, 'Deploy', 'Never');
      await user.click(within(dialog).getByRole('button', { name: 'Add API Key' }));
      await within(dialog).findByRole('textbox', { name: 'API key' });
      expect(fapi.apiKeys[0]).toMatchObject({ name: 'Deploy', subject: acme.id });
    });

    it('is read-only without permission to manage keys', async () => {
      await renderTable(memberOfAcme([readKeys]), { subject: acme.id });

      expect(await within(table()).findByText('Org key')).toBeVisible();
      expect(screen.queryByRole('button', { name: 'Create API key' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Manage Org key' })).toBeNull();
      expect(screen.queryByRole('columnheader', { name: 'Actions' })).toBeNull();
    });

    it('lets a manager without permission to read keys create one', async () => {
      const { fapi, user } = await renderTable(memberOfAcme([manageKeys]), { subject: acme.id });

      expect(await screen.findByText('No API Keys created')).toBeVisible();
      expect(within(table()).queryByText('Org key')).toBeNull();

      const dialog = await openCreate(user);
      await fillCreate(user, dialog, 'Deploy', 'Never');
      await user.click(within(dialog).getByRole('button', { name: 'Add API Key' }));
      await within(dialog).findByRole('textbox', { name: 'API key' });
      expect(fapi.apiKeys[0]).toMatchObject({ name: 'Deploy', subject: acme.id });
    });

    it('renders the fallback without permission to read or manage keys', async () => {
      await expectFallback(memberOfAcme([]), { subject: acme.id });
    });

    it('renders the fallback for an organization other than the active one', async () => {
      await expectFallback(memberOfAcme([readKeys, manageKeys]), { subject: 'org_2' });
    });

    it('renders the fallback when organization API keys are disabled', async () => {
      await expectFallback(
        {
          ...memberOfAcme([readKeys, manageKeys]),
          environment: fapiEnvironment({ api_keys_settings: { user_api_keys_enabled: true } }),
        },
        { subject: acme.id },
      );
    });

    it('starts over on the first page with no search when the subject changes', async () => {
      const orgKeys = Array.from({ length: 11 }, (_, index) =>
        fapiApiKey({ id: `ak_org_${index + 1}`, name: `Org key ${index + 1}`, subject: acme.id }),
      );
      const { user, rerender } = await renderTable(memberOfAcme([readKeys], [...orgKeys, ...manyKeys]), {
        subject: acme.id,
      });
      await user.click(await screen.findByRole('button', { name: 'Next API keys page' }));
      expect(await within(table()).findByText('Org key 11')).toBeVisible();
      await user.type(screen.getByRole('searchbox', { name: 'Search API keys' }), 'Org');

      rerender(<APIKeysTable subject={alice.id} />);

      expect(await within(table()).findByText('Key 1')).toBeVisible();
      expect(screen.getByRole('searchbox', { name: 'Search API keys' })).toHaveValue('');
      expect(screen.getByText('1/2')).toBeVisible();
    });

    it('explains what organization keys are for', async () => {
      await renderTable(memberOfAcme([readKeys], []), { subject: acme.id });

      expect(
        await screen.findByText('API keys allow apps and scripts to access your organization without signing in.'),
      ).toBeVisible();
    });
  });
});
