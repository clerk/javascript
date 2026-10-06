import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { fapiUrl, serveFapi, worker } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiEnvironment, fapiPasskey, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { MosaicProvider } from '../../../mosaic-provider';
import { UserProfilePasskeysSection } from '../user-profile-passkeys-section/user-profile-passkeys-section';

afterEach(() => vi.restoreAllMocks());

function servePasskeys() {
  const environment = fapiEnvironment();
  environment.user_settings.attributes.passkey.enabled = true;
  return serveFapi({
    environment,
    client: fapiClient([
      fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1', passkeys: [fapiPasskey({ id: 'pk_1' })] }) }),
    ]),
  });
}

describe('Validating a passkey name', () => {
  it('uses the localized Form fallback for an unknown rename failure and preserves the draft', async () => {
    servePasskeys();
    const { clerk } = await renderWithClerk(
      <MosaicProvider localization={{ messages: { form: { error: 'Impossible de sauvegarder.' } } }}>
        <UserProfilePasskeysSection />
      </MosaicProvider>,
    );
    const passkey = clerk.user?.passkeys[0];
    if (!passkey) {
      throw new Error('Expected the signed-in passkey');
    }
    vi.spyOn(passkey, 'update').mockRejectedValue(new Error('Private native failure'));
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Manage Laptop' }));
    await user.click(screen.getByRole('menuitem', { name: 'Rename' }));
    const input = screen.getByRole('textbox', { name: 'Passkey name' });
    await user.type(input, ' renamed');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Impossible de sauvegarder.'));
    expect(screen.queryByText('Private native failure')).toBeNull();
    expect(input).toHaveValue('Laptop renamed');
    expect(screen.getByRole('dialog')).toBeVisible();
    expect(input).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('marks localized server name errors on the field and clears them when the draft changes', async () => {
    servePasskeys();
    worker.use(
      http.post(fapiUrl('/v1/me/passkeys/pk_1'), () =>
        HttpResponse.json(
          { errors: [{ code: 'form_param_invalid', message: '', meta: { param_name: 'name' } }] },
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
    const input = screen.getByRole('textbox', { name: 'Passkey name' });
    await user.type(input, ' modifié');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.getByText('Ce nom est invalide.')).toBeVisible());
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Ce nom est invalide.');
    expect(input).toHaveValue('Laptop modifié');
    await user.type(input, ' encore');
    expect(input).not.toHaveAttribute('aria-invalid', 'true');
    await waitFor(() => expect(screen.queryByText('Ce nom est invalide.')).toBeNull());
  });

  it('rejects names over 256 UTF-8 bytes before submission and saves a name at the limit', async () => {
    const fapi = servePasskeys();
    let requests = 0;
    worker.use(
      http.post(fapiUrl('/v1/me/passkeys/pk_1'), () => {
        requests += 1;
      }),
    );
    await renderWithClerk(<UserProfilePasskeysSection />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Manage Laptop' }));
    await user.click(screen.getByRole('menuitem', { name: 'Rename' }));
    const input = screen.getByRole('textbox', { name: 'Passkey name' });
    const save = screen.getByRole('button', { name: 'Save' });
    await user.clear(input);
    await user.type(input, '😀'.repeat(65));
    await user.tab();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(save).toHaveAttribute('aria-disabled', 'true');
    await user.click(save);
    expect(requests).toBe(0);
    await user.clear(input);
    await user.type(input, '😀'.repeat(64));
    expect(input).not.toHaveAttribute('aria-invalid', 'true');
    await user.click(save);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(requests).toBe(1);
    expect(fapi.client.sessions[0]?.user.passkeys[0]?.name).toBe('😀'.repeat(64));
  });
});
