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
import { UserProfileApiKeysPanel } from '../user-profile-api-keys-panel';

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

const webApp = userKey('ak_1', 'Web app', { expiration: Date.UTC(2027, 11, 31, 12) });
const ciPipeline = userKey('ak_2', 'CI pipeline', { last_used_at: Date.now() - 2 * 60_000 });

const manyKeys = Array.from({ length: 11 }, (_, index) => userKey(`ak_${index + 1}`, `Key ${index + 1}`));

function signedIn(apiKeys: ApiKeyJSON[] = [webApp, ciPipeline], overrides: FakeFapiSeed = {}): FakeFapiSeed {
  return {
    environment: fapiEnvironment({ api_keys_settings: { user_api_keys_enabled: true } }),
    client: fapiClient([fapiSession({ id: 'sess_1', user: alice, last_active_organization_id: acme.id })]),
    apiKeys,
    ...overrides,
  };
}

async function renderPanel(seed: FakeFapiSeed = signedIn()) {
  const fapi = serveFapi(seed);
  const view = await renderWithClerk(<UserProfileApiKeysPanel />);
  return { ...view, fapi, user: userEvent.setup() };
}

type User = ReturnType<typeof userEvent.setup>;

const table = () => screen.getByRole('table', { name: 'API Keys' });

async function openCreate(user: User) {
  await user.click(await screen.findByRole('button', { name: 'Create API key' }));
  return screen.findByRole('dialog', { name: 'Add new API key' });
}

async function fillCreate(user: User, dialog: HTMLElement, name: string, expiration: string) {
  await user.type(within(dialog).getByRole('textbox', { name: 'Secret key name' }), name);
  await user.click(within(dialog).getByRole('combobox', { name: /^Expiration/ }));
  await user.click(await screen.findByRole('option', { name: expiration }));
}

async function openRevoke(user: User, name: string) {
  await user.click(await screen.findByRole('button', { name: `Manage ${name}` }));
  await user.click(await screen.findByRole('menuitem', { name: 'Revoke key' }));
  const dialog = await screen.findByRole('dialog', { name: `Revoke ${name}?` });
  await user.type(within(dialog).getByRole('textbox'), name);
  return dialog;
}

describe('UserProfileApiKeysPanel', () => {
  describe('listing keys', () => {
    it("shows the user's own keys, not the active organization's", async () => {
      await renderPanel(
        signedIn([webApp, ciPipeline, fapiApiKey({ id: 'ak_org', name: 'Org key', subject: acme.id })]),
      );

      expect(await within(table()).findByText('Web app')).toBeVisible();
      expect(within(table()).getByText('CI pipeline')).toBeVisible();
      expect(within(table()).queryByText('Org key')).toBeNull();
    });

    it('describes when each key was created, last used, and expires', async () => {
      await renderPanel();

      await within(table()).findByText('Web app');
      expect(within(table()).getAllByRole('cell', { name: 'Jan 5, 2026' })).toHaveLength(2);
      expect(within(table()).getByText('Expires Dec 31, 2027')).toBeVisible();
      expect(within(table()).getByText('Never expires')).toBeVisible();
      expect(within(table()).getByRole('cell', { name: '2 minutes ago' })).toBeVisible();
      expect(within(table()).getByRole('cell', { name: '-' })).toBeVisible();
    });

    it('shows loading until the first page arrives', async () => {
      serveFapi(signedIn());
      const list = holdRequests('get', '/api_keys');
      await renderWithClerk(<UserProfileApiKeysPanel />);

      expect(await screen.findByRole('status')).toHaveTextContent('Loading API keys');
      list.release();
      expect(await within(table()).findByText('Web app')).toBeVisible();
      expect(screen.queryByRole('status')).toBeNull();
    });

    it('explains when the user has no keys', async () => {
      await renderPanel(signedIn([]));

      expect(await screen.findByText('No API Keys created')).toBeVisible();
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
      await renderWithClerk(<UserProfileApiKeysPanel />);
      const user = userEvent.setup();

      expect(await screen.findByText('Could not load API keys', undefined, { timeout: 15_000 })).toBeVisible();
      expect(screen.queryByText('No API Keys created')).toBeNull();

      failing = false;
      await user.click(screen.getByRole('button', { name: 'Try again' }));
      expect(await within(table()).findByText('Web app')).toBeVisible();
    });
  });

  describe('searching', () => {
    it('lists only matching keys and explains when nothing matches', async () => {
      const { user } = await renderPanel();
      await within(table()).findByText('CI pipeline');
      const search = screen.getByRole('searchbox', { name: 'Search API keys' });

      await user.type(search, 'web');
      await waitFor(() => expect(within(table()).queryByText('CI pipeline')).toBeNull());
      expect(within(table()).getByText('Web app')).toBeVisible();

      await user.clear(search);
      await user.type(search, 'nothing');
      expect(await screen.findByText('Your search for "nothing" did not return any results.')).toBeVisible();
    });

    it('returns to the first page for a new search', async () => {
      const { user } = await renderPanel(signedIn(manyKeys));

      await user.click(await screen.findByRole('button', { name: 'Next API keys page' }));
      expect(await within(table()).findByText('Key 11')).toBeVisible();

      await user.type(screen.getByRole('searchbox', { name: 'Search API keys' }), 'Key 1');
      expect(await within(table()).findByText('Key 10')).toBeVisible();
      expect(within(table()).getByText('Key 1')).toBeVisible();
    });
  });

  describe('paging', () => {
    it('moves between pages of keys', async () => {
      const { user } = await renderPanel(signedIn(manyKeys));

      expect(await within(table()).findByText('Key 1')).toBeVisible();
      expect(screen.getByText('1/2')).toBeVisible();

      await user.click(screen.getByRole('button', { name: 'Next API keys page' }));
      expect(await within(table()).findByText('Key 11')).toBeVisible();
      expect(within(table()).queryByText('Key 1')).toBeNull();

      await user.click(screen.getByRole('button', { name: 'Previous API keys page' }));
      expect(await within(table()).findByText('Key 1')).toBeVisible();
    });

    it.todo('uses a configured page size');
  });

  describe('creating a key', () => {
    it('creates a key for the user, shows its secret once, and lists it', async () => {
      const { fapi, user } = await renderPanel();
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
      const { fapi, user } = await renderPanel();
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
      const { fapi, user } = await renderPanel();
      const dialog = await openCreate(user);
      await fillCreate(user, dialog, 'Deploy', 'Never');
      await user.click(within(dialog).getByRole('button', { name: 'Add API Key' }));

      await user.click(await within(dialog).findByRole('button', { name: 'Copy API key' }));

      await expect(navigator.clipboard.readText()).resolves.toBe(`ak_secret_${fapi.apiKeys[0].id}`);
      expect(screen.getByRole('alertdialog', { name: 'Add new API key' })).toBeVisible();
    });

    it('keeps the secret open on an outside click but closes it on Escape', async () => {
      const { user } = await renderPanel();
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
      const { user } = await renderPanel();
      const dialog = await openCreate(user);
      await fillCreate(user, dialog, 'Deploy', 'Never');
      await user.click(within(dialog).getByRole('button', { name: 'Add API Key' }));
      await within(dialog).findByRole('textbox', { name: 'API key' });
      const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('blocked'));
      onTestFinished(() => writeText.mockRestore());

      await user.click(within(dialog).getByRole('button', { name: 'Copy and close' }));
      expect(await within(dialog).findByRole('alert')).toHaveTextContent('Could not copy the API key. Try again.');
      expect(dialog).toBeVisible();
    });

    it('requires a name longer than two characters', async () => {
      const { user } = await renderPanel();
      const dialog = await openCreate(user);
      const add = within(dialog).getByRole('button', { name: 'Add API Key' });

      await fillCreate(user, dialog, 'ab', 'Never');
      expect(add).toBeDisabled();

      await user.type(within(dialog).getByRole('textbox', { name: 'Secret key name' }), 'c');
      expect(add).toBeEnabled();
    });

    it('holds the form while the key is created', async () => {
      const { user } = await renderPanel();
      const dialog = await openCreate(user);
      await fillCreate(user, dialog, 'Deploy', 'Never');
      const create = holdRequests('post', '/api_keys');

      await user.click(within(dialog).getByRole('button', { name: 'Add API Key' }));
      await waitFor(() => expect(within(dialog).getByRole('textbox', { name: 'Secret key name' })).toBeDisabled());
      expect(within(dialog).getByRole('button', { name: 'Add API Key' })).toHaveAttribute('aria-busy', 'true');

      create.release();
      expect(await within(dialog).findByRole('textbox', { name: 'API key' })).toBeVisible();
    });

    it('explains a name that is already taken and keeps the form', async () => {
      const { user } = await renderPanel();
      const dialog = await openCreate(user);

      await fillCreate(user, dialog, 'Web app', 'Never');
      await user.click(within(dialog).getByRole('button', { name: 'Add API Key' }));

      expect(await within(dialog).findByRole('alert')).toHaveTextContent('API Key name already exists.');
      expect(within(dialog).getByRole('textbox', { name: 'Secret key name' })).toHaveValue('Web app');
    });

    it('explains when the usage limit is reached', async () => {
      const { user } = await renderPanel();
      const dialog = await openCreate(user);
      await fillCreate(user, dialog, 'Deploy', 'Never');
      const create = holdRequests('post', '/api_keys');

      await user.click(within(dialog).getByRole('button', { name: 'Add API Key' }));
      create.fail('token_quota_exceeded');

      expect(await within(dialog).findByRole('alert')).toHaveTextContent(
        'You have reached your usage limit. You can remove the limit by upgrading to a paid plan.',
      );
    });

    it.todo('creates a key with an optional description when descriptions are enabled');
  });

  describe('revoking a key', () => {
    it('revokes the key once its name is typed and removes it from the list', async () => {
      const { fapi, user } = await renderPanel();
      const dialog = await openRevoke(user, 'Web app');

      await user.click(within(dialog).getByRole('button', { name: 'Revoke key' }));

      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      await waitFor(() => expect(within(table()).queryByText('Web app')).toBeNull());
      expect(within(table()).getByText('CI pipeline')).toBeVisible();
      expect(fapi.apiKeys.find(key => key.id === webApp.id)?.revoked).toBe(true);
    });

    it('explains a failed revoke and keeps the dialog open', async () => {
      const { user } = await renderPanel();
      const dialog = await openRevoke(user, 'Web app');
      const revoke = holdRequests('post', `/api_keys/${webApp.id}/revoke`);

      await user.click(within(dialog).getByRole('button', { name: 'Revoke key' }));
      revoke.fail('api_key_revoke_failed');

      await waitFor(() =>
        expect(within(dialog).getByRole('textbox')).toHaveAccessibleDescription('api_key_revoke_failed'),
      );
      expect(screen.getByRole('dialog', { name: 'Revoke Web app?' })).toBeVisible();
    });

    it('returns to the previous page when the last key on a page is revoked', async () => {
      const { user } = await renderPanel(signedIn(manyKeys));
      await user.click(await screen.findByRole('button', { name: 'Next API keys page' }));
      const dialog = await openRevoke(user, 'Key 11');

      await user.click(within(dialog).getByRole('button', { name: 'Revoke key' }));

      expect(await within(table()).findByText('Key 1')).toBeVisible();
      await waitFor(() => expect(screen.queryByRole('button', { name: 'Next API keys page' })).toBeNull());
    });
  });
});
