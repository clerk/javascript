import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { holdRequests, serveFapi } from '../../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiEnvironment, fapiPasskey, fapiSession, fapiUser } from '../../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../../__tests__/feature/render';
import { MosaicProvider } from '../../../../mosaic-provider';
import { UserProfilePasskeysSection } from '../user-profile-passkeys-section';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function accounts() {
  vi.spyOn(navigator, 'webdriver', 'get').mockReturnValue(false);
  const environment = fapiEnvironment();
  environment.user_settings.attributes.passkey.enabled = true;
  return serveFapi({
    environment,
    client: fapiClient([
      fapiSession({
        id: 'sess_a',
        user: fapiUser({ id: 'user_a', passkeys: [fapiPasskey({ id: 'pk_a', name: 'Alice laptop' })] }),
      }),
      fapiSession({
        id: 'sess_b',
        user: fapiUser({ id: 'user_b', passkeys: [fapiPasskey({ id: 'pk_b', name: 'Bob phone' })] }),
      }),
    ]),
  });
}

async function openRename() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Manage Alice laptop' }));
  await user.click(screen.getByRole('menuitem', { name: 'Rename' }));
  const input = screen.getByRole('textbox', { name: 'Passkey name' });
  await waitFor(() => expect(input).toHaveFocus());
  return { user, input };
}

describe('Passkey interactions across resource changes', () => {
  it('refreshes the saved name when the same row is renamed twice', async () => {
    accounts();
    await renderWithClerk(<UserProfilePasskeysSection />);
    const { user, input } = await openRename();
    await user.clear(input);
    await user.type(input, 'Alice work laptop');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await user.click(screen.getByRole('button', { name: 'Manage Alice work laptop' }));
    await user.click(screen.getByRole('menuitem', { name: 'Rename' }));
    expect(screen.getByRole('textbox', { name: 'Passkey name' })).toHaveValue('Alice work laptop');
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('drops a held rename failure after switching users', async () => {
    accounts();
    const { clerk } = await renderWithClerk(<UserProfilePasskeysSection />);
    const { user, input } = await openRename();
    await user.type(input, ' edited');
    const held = holdRequests('post', '/v1/me/passkeys/pk_a');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(held.requests).toHaveLength(1));
    await act(() => clerk.setActive({ session: 'sess_b' }));
    held.fail('form_param_invalid', 'Alice delayed rename error');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByText('Bob phone')).toBeVisible();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('reports a removed stale row through the localized model error', async () => {
    const fapi = accounts();
    await renderWithClerk(
      <MosaicProvider localization={{ messages: { errors: { resource_not_found: 'Cette clé a été supprimée.' } } }}>
        <UserProfilePasskeysSection />
      </MosaicProvider>,
    );
    const { user, input } = await openRename();
    fapi.client.sessions = fapi.client.sessions.map(session =>
      session.id === 'sess_a' ? { ...session, user: { ...session.user, passkeys: [] } } : session,
    );
    await user.type(input, ' edited');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Cette clé a été supprimée.'));
    expect(input).toHaveValue('Alice laptop edited');
  });

  it('deduplicates removal keyboard actions while the request is held', async () => {
    accounts();
    await renderWithClerk(<UserProfilePasskeysSection />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Manage Alice laptop' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove passkey' }));
    const held = holdRequests('post', '/v1/me/passkeys/pk_a');
    const remove = screen.getByRole('button', { name: 'Remove' });
    await user.click(remove);
    await waitFor(() => expect(held.requests).toHaveLength(1));
    await user.keyboard('{Enter}{Enter}{Escape}');
    expect(held.requests).toHaveLength(1);
    expect(screen.getByRole('alertdialog')).toBeVisible();
    held.release();
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(screen.getByText('No passkeys added')).toBeVisible();
  });
});
