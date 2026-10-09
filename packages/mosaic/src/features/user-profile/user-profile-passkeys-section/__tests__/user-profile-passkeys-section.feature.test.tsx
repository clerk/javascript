import type { PasskeyJSON } from '@clerk/shared/types';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { fapiUrl, holdRequests, serveFapi, worker } from '../../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEnterpriseAccount,
  fapiEnvironment,
  fapiPasskey,
  fapiSession,
  fapiUser,
} from '../../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../../__tests__/feature/render';
import { MosaicProvider } from '../../../../mosaic-provider';
import { UserProfilePasskeysSectionView } from '../../user-profile-passkeys-section.view';
import { UserProfileSecurityPanelView } from '../../user-profile-security-panel.view';
import { passkeysSectionNode, UserProfilePasskeysSection } from '../user-profile-passkeys-section';
import { useUserProfilePasskeysModel } from '../user-profile-passkeys-section.model';

function ReadonlyPasskeys() {
  const model = useUserProfilePasskeysModel();
  return model.status === 'ready' ? <UserProfilePasskeysSectionView passkeys={model.passkeys} /> : null;
}

function SecurityPanel() {
  const passkeysSlot = passkeysSectionNode(useUserProfilePasskeysModel());
  return <UserProfileSecurityPanelView passkeysSlot={passkeysSlot} />;
}

function servePasskeys(passkeys: PasskeyJSON[] = [fapiPasskey({ id: 'pk_1' })]) {
  const environment = fapiEnvironment();
  environment.user_settings.attributes.passkey.enabled = true;
  return serveFapi({
    environment,
    client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1', passkeys }) })]),
  });
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function fakeAuthenticator() {
  vi.spyOn(navigator, 'webdriver', 'get').mockReturnValue(false);
  const credential = {
    id: 'credential_1',
    type: 'public-key',
    rawId: new Uint8Array([1, 2, 3]).buffer,
    authenticatorAttachment: 'platform',
    response: {
      clientDataJSON: new TextEncoder().encode('{}').buffer,
      attestationObject: new Uint8Array([4, 5, 6]).buffer,
      getTransports: () => ['internal'],
    },
  };
  return vi.spyOn(navigator.credentials, 'create').mockResolvedValue(credential);
}

describe('Seeing passkeys', () => {
  it('renders the readonly view contract when action callbacks are omitted', async () => {
    servePasskeys([fapiPasskey({ id: 'pk_1', name: 'Laptop' }), fapiPasskey({ id: 'pk_2', name: 'Phone' })]);
    await renderWithClerk(<ReadonlyPasskeys />);
    expect(screen.getByRole('group', { name: 'Passkeys' })).toBeVisible();
    expect(screen.getByText('Laptop')).toBeVisible();
    expect(screen.getByText('Phone')).toBeVisible();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('localizes the passkey section, row actions, and dialogs', async () => {
    servePasskeys();
    await renderWithClerk(
      <MosaicProvider
        localization={{
          messages: {
            userProfilePasskeys: {
              label: 'Clés d’accès',
              add: 'Ajouter',
              addLabel: 'Ajouter une clé',
              manage: 'Gérer {name}',
              rename: 'Renommer',
              renameTitle: 'Renommer la clé',
              renameDescription: 'Choisissez un nouveau nom.',
              nameLabel: 'Nom de la clé',
              save: 'Enregistrer',
              cancel: 'Annuler',
              removeAction: 'Supprimer la clé',
              removeTitle: 'Supprimer la clé',
              removeDescription: '{name} sera supprimée de ce compte.',
              remove: 'Supprimer',
            },
          },
        }}
      >
        <UserProfilePasskeysSection />
      </MosaicProvider>,
    );

    expect(screen.getByRole('group', { name: 'Clés d’accès' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Ajouter une clé' })).toBeVisible();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Gérer Laptop' }));
    await user.click(screen.getByRole('menuitem', { name: 'Renommer' }));
    const rename = screen.getByRole('dialog', { name: 'Renommer la clé' });
    expect(rename).toHaveTextContent('Choisissez un nouveau nom.');
    await waitFor(() => expect(within(rename).getByRole('textbox', { name: 'Nom de la clé' })).toBeVisible());
    expect(within(rename).getByRole('button', { name: 'Enregistrer' })).toBeVisible();
    await user.click(within(rename).getByRole('button', { name: 'Annuler' }));

    await user.click(screen.getByRole('button', { name: 'Gérer Laptop' }));
    await user.click(screen.getByRole('menuitem', { name: 'Supprimer la clé' }));
    const removal = screen.getByRole('alertdialog', { name: 'Supprimer la clé' });
    expect(removal).toHaveAccessibleDescription('Laptop sera supprimée de ce compte.');
    await waitFor(() => expect(within(removal).getByRole('button', { name: 'Supprimer' })).toBeVisible());
    expect(within(removal).getByRole('button', { name: 'Annuler' })).toBeVisible();
  });

  it.each([
    [-8, '8.9.2026'],
    [-3, 'Letzten Sonntag um 12:30'],
    [-1, 'Gestern um 12:30'],
    [0, 'Heute um 12:30'],
    [1, 'Morgen um 12:30'],
    [3, 'Samstag um 12:30'],
    [8, '24.9.2026'],
  ])('localizes passkey dates %i days from today', async (offset, lastUsed) => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 8, 16, 12, 30));
    servePasskeys([
      fapiPasskey({
        id: 'pk_1',
        created_at: new Date(2026, 7, 20, 12, 30).getTime(),
        last_used_at: new Date(2026, 8, 16 + offset, 12, 30).getTime(),
      }),
    ]);
    await renderWithClerk(
      <MosaicProvider
        localization={{
          locale: 'de-DE',
          messages: {
            userProfilePasskeys: {
              createdAt: 'Erstellt: {date}',
              lastUsedAt: 'Zuletzt verwendet: {date}',
              dates: {
                sameDay: 'Heute um {time}',
                lastDay: 'Gestern um {time}',
                nextDay: 'Morgen um {time}',
                previous6Days: 'Letzten {weekday} um {time}',
                next6Days: '{weekday} um {time}',
              },
            },
          },
        }}
      >
        <UserProfilePasskeysSection />
      </MosaicProvider>,
    );
    expect(screen.getByText(/Created:|Erstellt:/)).toHaveTextContent(
      `Erstellt: 20.8.2026 · Zuletzt verwendet: ${lastUsed}`,
    );
  });

  it('refreshes created and last-used dates after midnight without a user update', async () => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
    vi.setSystemTime(new Date(2026, 8, 16, 23, 59, 30));
    servePasskeys([
      fapiPasskey({
        id: 'pk_1',
        created_at: new Date(2026, 8, 16, 12, 30).getTime(),
        last_used_at: new Date(2026, 8, 16, 14, 45).getTime(),
      }),
    ]);
    await renderWithClerk(<UserProfilePasskeysSection />);
    const details = screen.getByText(/Created:/);
    expect(details).toHaveTextContent(/Created: Today at .+ · Last used: Today at/);

    await act(() => vi.advanceTimersByTimeAsync(60_000));

    expect(details).toHaveTextContent(/Created: Yesterday at .+ · Last used: Yesterday at/);
  });

  it('shows a fallback while Clerk loads and then shows existing passkeys', async () => {
    servePasskeys();
    const environment = holdRequests('get', '/v1/environment');
    const rendering = renderWithClerk(<UserProfilePasskeysSection fallback={<p>Loading passkeys</p>} />);
    expect(await screen.findByText('Loading passkeys')).toBeVisible();
    environment.release();
    await rendering;
    expect(screen.queryByText('Loading passkeys')).toBeNull();
    expect(screen.getByText('Laptop')).toBeVisible();
  });

  it.each(['signed out', 'disabled', 'managed by enterprise'] as const)('hides the section when %s', async state => {
    const fapi = servePasskeys();
    if (state === 'signed out') {
      fapi.client = fapiClient();
    } else if (state === 'disabled') {
      fapi.environment.user_settings.attributes.passkey.enabled = false;
    } else {
      fapi.environment.user_settings.enterprise_sso.enabled = true;
      const session = fapi.client.sessions[0];
      if (session) {
        session.user.enterprise_accounts = [fapiEnterpriseAccount({ id: 'enterprise_1' })];
      }
    }
    await renderWithClerk(<UserProfilePasskeysSection />);
    expect(screen.queryByRole('group', { name: 'Passkeys' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Add passkey' })).toBeNull();
  });
});

describe('Adding a passkey', () => {
  it('holds Add pending, creates one credential, and displays the new passkey', async () => {
    const fapi = servePasskeys([]);
    const authenticator = fakeAuthenticator();
    await renderWithClerk(<UserProfilePasskeysSection />);
    expect(screen.getByText('No passkeys added')).toBeVisible();
    const creation = holdRequests('post', '/v1/me/passkeys');
    const user = userEvent.setup();
    const add = screen.getByRole('button', { name: 'Add passkey' });
    await user.click(add);
    await waitFor(() => expect(creation.requests).toHaveLength(1));
    expect(add).toHaveTextContent(/^Add$/);
    expect(add).toBeDisabled();
    expect(add).toHaveAttribute('aria-busy', 'true');
    await user.click(add);
    expect(creation.requests).toHaveLength(1);
    creation.release();
    expect(await screen.findByText('Chrome on macOS')).toBeVisible();
    expect(fapi.client.sessions[0]?.user.passkeys).toHaveLength(1);
    expect(authenticator).toHaveBeenCalledOnce();
    expect(add).toBeEnabled();
  });

  it.each(['session_reverification_required', 'form_param_invalid'])(
    'shows %s and allows a manual retry',
    async code => {
      const fapi = servePasskeys([]);
      fakeAuthenticator();
      await renderWithClerk(<UserProfilePasskeysSection />);
      const creation = holdRequests('post', '/v1/me/passkeys');
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: 'Add passkey' }));
      await waitFor(() => expect(creation.requests).toHaveLength(1));
      creation.fail(code);
      expect(await screen.findByRole('alert')).toHaveTextContent(code);
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(creation.requests).toHaveLength(1);
      const retried = serveFapi(fapi);
      await user.click(screen.getByRole('button', { name: 'Add passkey' }));
      expect(await screen.findByText('Chrome on macOS')).toBeVisible();
      expect(retried.client.sessions[0]?.user.passkeys).toHaveLength(1);
      expect(screen.queryByRole('alert')).toBeNull();
    },
  );

  it('uses the localized fallback when FAPI rejects creation without a message', async () => {
    servePasskeys([]);
    fakeAuthenticator();
    worker.use(
      http.post(fapiUrl('/v1/me/passkeys'), () =>
        HttpResponse.json(
          {
            errors: [{ code: 'unknown_passkey_failure', message: '', long_message: '' }],
          },
          { status: 400 },
        ),
      ),
    );
    await renderWithClerk(
      <MosaicProvider
        localization={{ messages: { userProfilePasskeys: { saveError: 'Impossible de créer la clé.' } } }}
      >
        <UserProfilePasskeysSection />
      </MosaicProvider>,
    );
    await userEvent.setup().click(screen.getByRole('button', { name: 'Add passkey' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Impossible de créer la clé.'));
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('data-open');
    await waitFor(() => expect(alert).toBeVisible());
    expect(screen.getByRole('button', { name: 'Add passkey' })).toBeEnabled();
  });

  it('shows an authenticator cancellation and allows another attempt', async () => {
    servePasskeys([]);
    fakeAuthenticator().mockRejectedValueOnce(new DOMException('Canceled', 'NotAllowedError'));
    await renderWithClerk(<UserProfilePasskeysSection />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add passkey' }));
    expect(await screen.findByRole('alert')).toBeVisible();
    expect(screen.getByText('No passkeys added')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Add passkey' }));
    expect(await screen.findByText('Chrome on macOS')).toBeVisible();
  });
});

describe('Renaming a passkey', () => {
  it('validates a prefilled name, holds the dialog pending, and saves the raw name', async () => {
    const fapi = servePasskeys();
    await renderWithClerk(<UserProfilePasskeysSection />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Manage Laptop' }));
    await user.click(screen.getByRole('menuitem', { name: 'Rename' }));
    const dialog = screen.getByRole('dialog');
    const input = within(dialog).getByRole('textbox', { name: 'Passkey name' });
    const save = within(dialog).getByRole('button', { name: 'Save' });
    expect(input).toHaveValue('Laptop');
    await waitFor(() => expect(input).toHaveFocus());
    expect(save).toHaveAttribute('aria-disabled', 'true');
    await user.clear(input);
    await user.type(input, 'A');
    expect(save).toHaveAttribute('aria-disabled', 'true');
    await user.clear(input);
    await user.type(input, ' Work laptop ');
    const rename = holdRequests('post', '/v1/me/passkeys/pk_1');
    await user.click(save);
    await waitFor(() => expect(rename.requests).toHaveLength(1));
    expect(input).toBeDisabled();
    expect(save).toHaveAttribute('aria-busy', 'true');
    await user.keyboard('{Escape}');
    expect(dialog).toBeVisible();
    rename.release();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('button', { name: 'Manage Work laptop' })).toBeVisible();
    expect(fapi.client.sessions[0]?.user.passkeys[0]?.name).toBe(' Work laptop ');
  });

  it('uses the localized API code and parameter for name errors without a server message', async () => {
    servePasskeys();
    worker.use(
      http.post(fapiUrl('/v1/me/passkeys/pk_1'), () =>
        HttpResponse.json(
          {
            errors: [{ code: 'form_param_invalid', message: '', meta: { param_name: 'name' } }],
          },
          { status: 400 },
        ),
      ),
    );
    await renderWithClerk(
      <MosaicProvider localization={{ messages: { errors: { form_param_invalid__name: 'Ce nom est invalide.' } } }}>
        <UserProfilePasskeysSection />
      </MosaicProvider>,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Manage Laptop' }));
    await user.click(screen.getByRole('menuitem', { name: 'Rename' }));
    await user.type(screen.getByRole('textbox', { name: 'Passkey name' }), ' modifié');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.getByText('Ce nom est invalide.')).toBeVisible());
    expect(screen.getByRole('textbox', { name: 'Passkey name' })).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('textbox', { name: 'Passkey name' })).toHaveAccessibleDescription('Ce nom est invalide.');
    expect(screen.getByRole('textbox', { name: 'Passkey name' })).toHaveValue('Laptop modifié');
  });

  it('preserves the draft after an API failure and retries with the edited name', async () => {
    const fapi = servePasskeys();
    await renderWithClerk(<UserProfilePasskeysSection />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Manage Laptop' }));
    await user.click(screen.getByRole('menuitem', { name: 'Rename' }));
    const input = screen.getByRole('textbox', { name: 'Passkey name' });
    await user.clear(input);
    await user.type(input, 'Work laptop');
    const rename = holdRequests('post', '/v1/me/passkeys/pk_1');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(rename.requests).toHaveLength(1));
    rename.fail();
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('form_param_invalid'));
    expect(input).toHaveValue('Work laptop');
    await user.type(input, ' updated');
    const retried = serveFapi(fapi);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByText('Work laptop updated')).toBeVisible();
    expect(retried.client.sessions[0]?.user.passkeys[0]?.name).toBe('Work laptop updated');
  });
});

describe('Removing a passkey', () => {
  it('confirms the literal name and cancels without a mutation', async () => {
    const fapi = servePasskeys([fapiPasskey({ id: 'pk_1', name: '$& laptop' })]);
    await renderWithClerk(<UserProfilePasskeysSection />);
    const user = userEvent.setup();
    const trigger = screen.getByRole('button', { name: 'Manage $& laptop' });
    await user.click(trigger);
    await user.click(screen.getByRole('menuitem', { name: 'Remove passkey' }));
    expect(screen.getByRole('alertdialog')).toHaveAccessibleDescription('$& laptop will be removed from this account.');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(fapi.client.sessions[0]?.user.passkeys).toHaveLength(1);
    await user.click(trigger);
    await user.click(screen.getByRole('menuitem', { name: 'Remove passkey' }));
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(fapi.client.sessions[0]?.user.passkeys).toHaveLength(0);
  });

  it.each([
    ['Laptop', 'Phone'],
    ['Phone', 'Laptop'],
  ])('removes %s and keeps %s', async (removed, remaining) => {
    const fapi = servePasskeys([
      fapiPasskey({ id: 'pk_1', name: 'Laptop' }),
      fapiPasskey({ id: 'pk_2', name: 'Phone' }),
    ]);
    await renderWithClerk(<UserProfilePasskeysSection />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: `Manage ${removed}` }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove passkey' }));
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(fapi.client.sessions[0]?.user.passkeys.map(passkey => passkey.name)).toEqual([remaining]);
  });

  it('holds the final removal pending until it succeeds', async () => {
    const fapi = servePasskeys();
    await renderWithClerk(<UserProfilePasskeysSection />);
    const removal = holdRequests('post', '/v1/me/passkeys/pk_1');
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Manage Laptop' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove passkey' }));
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(removal.requests).toHaveLength(1));
    expect(screen.getByRole('button', { name: 'Remove' })).toHaveAttribute('aria-busy', 'true');
    await user.keyboard('{Escape}');
    expect(screen.getByRole('alertdialog')).toBeVisible();
    removal.release();
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(screen.getByText('No passkeys added')).toBeVisible();
    expect(fapi.client.sessions[0]?.user.passkeys).toEqual([]);
  });

  it('keeps confirmation open on localized verification-required errors and retries manually', async () => {
    const fapi = servePasskeys();
    await renderWithClerk(
      <MosaicProvider
        localization={{
          messages: { errors: { session_reverification_required: 'Veuillez confirmer votre identité.' } },
        }}
      >
        <UserProfilePasskeysSection />
      </MosaicProvider>,
    );
    const removal = holdRequests('post', '/v1/me/passkeys/pk_1');
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Manage Laptop' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove passkey' }));
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(removal.requests).toHaveLength(1));
    removal.fail('session_reverification_required');
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Veuillez confirmer votre identité.'));
    expect(screen.getByRole('alertdialog')).toBeVisible();
    expect(screen.queryByLabelText('Password')).toBeNull();
    expect(removal.requests).toHaveLength(1);
    const retried = serveFapi(fapi);
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(retried.client.sessions[0]?.user.passkeys).toHaveLength(0);
  });
});

describe('Satellite passkeys', () => {
  it('keeps an empty section visible without Add', async () => {
    servePasskeys([]);
    const view = await renderWithClerk(<SecurityPanel />);
    vi.spyOn(view.clerk, 'isSatellite', 'get').mockReturnValue(true);
    view.rerender(<SecurityPanel />);
    expect(screen.getByRole('group', { name: 'Passkeys' })).toBeVisible();
    expect(screen.getByText('No passkeys added')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Add passkey' })).toBeNull();
    expect(screen.getByRole('region', { name: 'Authentication' })).toBeVisible();
  });

  it('removes the final passkey without Add', async () => {
    const fapi = servePasskeys();
    const view = await renderWithClerk(<SecurityPanel />);
    vi.spyOn(view.clerk, 'isSatellite', 'get').mockReturnValue(true);
    view.rerender(<SecurityPanel />);
    const removal = holdRequests('post', '/v1/me/passkeys/pk_1');
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Manage Laptop' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove passkey' }));
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(removal.requests).toHaveLength(1));
    expect(screen.getByRole('button', { name: 'Remove' })).toHaveAttribute('aria-busy', 'true');
    removal.release();
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(screen.getByText('No passkeys added')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Add passkey' })).toBeNull();
    expect(fapi.client.sessions[0]?.user.passkeys).toEqual([]);
  });
});

describe('Passkey reverification', () => {
  it.todo('completes reverification before creating, renaming, or removing a passkey');
  it.todo('cancels reverification without changing passkeys and permits retry');
});

describe('Passkey follow-ups', () => {
  it.todo('shows a localized duplicate-passkey message instead of the raw SDK error for passkey_already_exists');
  it.todo('rerenders passkey eligibility when a replaced or fetched environment changes policy');
  it.todo('focuses a surviving passkey row during React cleanup after removal');
});
