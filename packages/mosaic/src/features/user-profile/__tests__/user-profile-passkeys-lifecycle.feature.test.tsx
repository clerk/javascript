import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { holdRequests, serveFapi } from '../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEnterpriseAccount,
  fapiEnvironment,
  fapiPasskey,
  fapiSession,
  fapiUser,
} from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { MosaicProvider } from '../../../mosaic-provider';
import {
  UserProfilePasskeysSection,
  useUserProfilePasskeysSlot,
} from '../user-profile-passkeys-section/user-profile-passkeys-section';
import {
  UserProfileSecurityPanelView,
  type UserProfileSecurityPanelViewProps,
} from '../user-profile-security-panel.view';

afterEach(() => vi.restoreAllMocks());

function SecurityHost(props: Pick<UserProfileSecurityPanelViewProps, 'mfaMethods' | 'devices'> = {}) {
  const passkeysSlot = useUserProfilePasskeysSlot();
  return (
    <UserProfileSecurityPanelView
      {...props}
      passkeysSlot={passkeysSlot}
    />
  );
}

function serveAccounts(enabled = true) {
  vi.spyOn(navigator, 'webdriver', 'get').mockReturnValue(false);
  const environment = fapiEnvironment();
  environment.user_settings.attributes.passkey.enabled = enabled;
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

function authenticator() {
  vi.spyOn(navigator, 'webdriver', 'get').mockReturnValue(false);
  return vi.spyOn(navigator.credentials, 'create').mockResolvedValue({
    id: 'credential_1',
    type: 'public-key',
    rawId: new Uint8Array([1, 2, 3]).buffer,
    authenticatorAttachment: 'platform',
    response: {
      clientDataJSON: new TextEncoder().encode('{}').buffer,
      attestationObject: new Uint8Array([4, 5, 6]).buffer,
      getTransports: () => ['internal'],
    },
  });
}

describe('Changing the active passkey account', () => {
  it('clears the previous account Add error after a user switch', async () => {
    serveAccounts();
    const { clerk } = await renderWithClerk(<UserProfilePasskeysSection />);
    const creation = holdRequests('post', '/v1/me/passkeys');
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add passkey' }));
    await waitFor(() => expect(creation.requests).toHaveLength(1));
    creation.fail('form_param_invalid', 'Alice credential failed');
    expect(await screen.findByRole('alert')).toHaveTextContent('Alice credential failed');
    await act(() => clerk.setActive({ session: 'sess_b' }));
    expect(await screen.findByText('Bob phone')).toBeVisible();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('drops a held creation failure after switching users', async () => {
    serveAccounts();
    const { clerk } = await renderWithClerk(<UserProfilePasskeysSection />);
    const creation = holdRequests('post', '/v1/me/passkeys');
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add passkey' }));
    await waitFor(() => expect(creation.requests).toHaveLength(1));
    await act(() => clerk.setActive({ session: 'sess_b' }));
    expect(await screen.findByText('Bob phone')).toBeVisible();
    creation.fail('form_param_invalid', 'Alice pending credential failed');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add passkey' })).toBeEnabled());
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('clears a failed Add after signing out the active account', async () => {
    serveAccounts();
    const { clerk } = await renderWithClerk(<UserProfilePasskeysSection />);
    const creation = holdRequests('post', '/v1/me/passkeys');
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add passkey' }));
    await waitFor(() => expect(creation.requests).toHaveLength(1));
    creation.fail('form_param_invalid', 'Signed-out account error');
    expect(await screen.findByRole('alert')).toBeVisible();
    await act(() => clerk.signOut({ sessionId: 'sess_a' }));
    await act(() => clerk.setActive({ session: 'sess_b' }));
    expect(await screen.findByText('Bob phone')).toBeVisible();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('hides the section during sign-out even with a held request', async () => {
    serveAccounts();
    const { clerk } = await renderWithClerk(<UserProfilePasskeysSection />);
    const creation = holdRequests('post', '/v1/me/passkeys');
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add passkey' }));
    await waitFor(() => expect(creation.requests).toHaveLength(1));
    await act(() => clerk.signOut());
    creation.fail('form_param_invalid');
    await waitFor(() => expect(screen.queryByRole('group', { name: 'Passkeys' })).toBeNull());
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('does not verify Alice pending credentials onto Bob in the FAPI fake', async () => {
    const fapi = serveAccounts();
    authenticator();
    const { clerk } = await renderWithClerk(<UserProfilePasskeysSection />);
    const verification = holdRequests('post', '/v1/me/passkeys/passkey_1/attempt_verification');
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add passkey' }));
    await waitFor(() => expect(verification.requests).toHaveLength(1));
    await act(() => clerk.setActive({ session: 'sess_b' }));
    verification.release();
    await waitFor(() =>
      expect(
        fapi.client.sessions.find(session => session.id === 'sess_a')?.user.passkeys.map(passkey => passkey.name),
      ).toContain('Chrome on macOS'),
    );
    expect(
      fapi.client.sessions.find(session => session.id === 'sess_b')?.user.passkeys.map(passkey => passkey.name),
    ).toEqual(['Bob phone']);
  });
});

describe('Composing passkeys in Security', () => {
  it('checks disabled passkey absence against the real group DOM', async () => {
    serveAccounts(false);
    await renderWithClerk(<UserProfilePasskeysSection />);
    expect(screen.queryByRole('group', { name: 'Passkeys' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Add passkey' })).toBeNull();
  });

  it('does not leave an empty Authentication region when a connected passkeys slot is hidden', async () => {
    serveAccounts(false);
    await renderWithClerk(<SecurityHost />);
    expect(screen.queryByText('Passkeys')).toBeNull();
    expect(screen.queryByRole('region', { name: 'Authentication' })).toBeNull();
  });

  it('orders connected passkeys before MFA and active devices', async () => {
    serveAccounts();
    await renderWithClerk(
      <SecurityHost
        mfaMethods={[]}
        devices={[]}
      />,
    );
    expect(screen.getByRole('region', { name: 'Authentication' })).toHaveTextContent('Passkeys');
    expect(
      screen.getByText('Passkeys').compareDocumentPosition(screen.getByText('2-step verification')) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});

describe('Submitting passkey actions', () => {
  it('deduplicates keyboard rename submissions while a request is held', async () => {
    serveAccounts();
    await renderWithClerk(<UserProfilePasskeysSection />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Manage Alice laptop' }));
    await user.keyboard('{ArrowDown}{Enter}');
    const dialog = await screen.findByRole('dialog');
    const input = within(dialog).getByRole('textbox', { name: 'Passkey name' });
    await user.clear(input);
    await user.type(input, 'Alice work laptop');
    const rename = holdRequests('post', '/v1/me/passkeys/pk_a');
    await user.keyboard('{Enter}{Enter}');
    await waitFor(() => expect(rename.requests).toHaveLength(1));
    await user.keyboard('{Escape}');
    expect(dialog).toBeVisible();
    rename.release();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByText('Alice work laptop')).toBeVisible();
  });

  it('rejects passkey creation in the fake when instance passkeys are disabled', async () => {
    serveAccounts(false);
    authenticator();
    const { clerk } = await renderWithClerk(<UserProfilePasskeysSection />);
    const user = clerk.user;
    expect(user).toBeDefined();
    if (!user) {
      throw new Error('Missing user');
    }
    await expect(user.createPasskey()).rejects.toBeDefined();
  });

  it('uses localized coded cancellation errors', async () => {
    serveAccounts();
    authenticator().mockRejectedValueOnce(new DOMException('Cancelled', 'NotAllowedError'));
    await renderWithClerk(
      <MosaicProvider
        localization={{
          locale: 'fr-FR',
          messages: { errors: { passkey_registration_cancelled: 'Création annulée.' } },
        }}
      >
        <UserProfilePasskeysSection />
      </MosaicProvider>,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add passkey' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Création annulée.');
  });
});

describe('Passkey backend contract', () => {
  it('rejects creation at the ten claimed passkey quota', async () => {
    const fapi = serveAccounts();
    fapi.client = fapiClient([
      fapiSession({
        id: 'sess_a',
        user: fapiUser({
          id: 'user_a',
          passkeys: Array.from({ length: 10 }, (_, index) => fapiPasskey({ id: `pk_${index}` })),
        }),
      }),
    ]);
    authenticator();
    const { clerk } = await renderWithClerk(<UserProfilePasskeysSection />);
    const current = clerk.user;
    if (!current) {
      throw new Error('Missing user');
    }
    await expect(current.createPasskey()).rejects.toMatchObject({ errors: [{ code: 'passkey_quota_exceeded' }] });
    expect(fapi.client.sessions.find(session => session.id === 'sess_a')?.user.passkeys).toHaveLength(10);
  });

  it('rejects creation for a managed enterprise account', async () => {
    const fapi = serveAccounts();
    fapi.environment.user_settings.enterprise_sso.enabled = true;
    fapi.client = fapiClient([
      fapiSession({
        id: 'sess_a',
        user: fapiUser({ id: 'user_a', enterprise_accounts: [fapiEnterpriseAccount({ id: 'ea_1' })] }),
      }),
    ]);
    authenticator();
    const { clerk } = await renderWithClerk(<UserProfilePasskeysSection />);
    const current = clerk.user;
    if (!current) {
      throw new Error('Missing user');
    }
    await expect(current.createPasskey()).rejects.toMatchObject({
      errors: [{ code: 'enterprise_sso_additional_identifications_disabled' }],
    });
    expect(fapi.client.sessions.find(session => session.id === 'sess_a')?.user.passkeys).toHaveLength(0);
  });

  it('returns verified registration metadata at the nine-key boundary', async () => {
    const fapi = serveAccounts();
    fapi.client = fapiClient([
      fapiSession({
        id: 'sess_a',
        user: fapiUser({
          id: 'user_a',
          passkeys: Array.from({ length: 9 }, (_, index) => fapiPasskey({ id: `pk_${index}` })),
        }),
      }),
    ]);
    authenticator();
    const { clerk } = await renderWithClerk(<UserProfilePasskeysSection />);
    const current = clerk.user;
    if (!current) {
      throw new Error('Missing user');
    }
    const passkey = await current.createPasskey();
    expect(passkey.verification).toMatchObject({ strategy: 'passkey', status: 'verified' });
    expect(passkey.lastUsedAt).toBeInstanceOf(Date);
    expect(fapi.client.sessions.find(session => session.id === 'sess_a')?.user.passkeys).toHaveLength(10);
  });

  it.each([64, 65])('enforces the UTF-8 name boundary for %i four-byte characters', async count => {
    serveAccounts();
    const { clerk } = await renderWithClerk(<UserProfilePasskeysSection />);
    const passkey = clerk.user?.passkeys.find(candidate => candidate.id === 'pk_a');
    if (!passkey) {
      throw new Error('Missing passkey');
    }
    const name = '🔑'.repeat(count);
    if (count === 64) {
      const renamed = await passkey.update({ name });
      expect(renamed.name).toBe(name);
    } else {
      await expect(passkey.update({ name })).rejects.toMatchObject({
        errors: [{ code: 'form_param_max_length_exceeded' }],
      });
      expect(passkey.name).toBe('Alice laptop');
    }
  });
});

describe('Passkey identity and policy at action time', () => {
  it('clears Add state when the same user changes sessions', async () => {
    const fapi = serveAccounts();
    const alice = fapi.client.sessions.find(session => session.id === 'sess_a')?.user;
    if (!alice) {
      throw new Error('Missing user');
    }
    fapi.client = fapiClient([...fapi.client.sessions, fapiSession({ id: 'sess_a2', user: alice })]);
    const { clerk } = await renderWithClerk(<UserProfilePasskeysSection />);
    const creation = holdRequests('post', '/v1/me/passkeys');
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add passkey' }));
    await waitFor(() => expect(creation.requests).toHaveLength(1));
    creation.fail('form_param_invalid', 'Old session error');
    expect(await screen.findByRole('alert')).toHaveTextContent('Old session error');
    await act(() => clerk.setActive({ session: 'sess_a2' }));
    expect(clerk.session?.id).toBe('sess_a2');
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByRole('button', { name: 'Add passkey' })).toBeEnabled();
  });

  it('closes an old account rename dialog when the active user changes', async () => {
    serveAccounts();
    const { clerk } = await renderWithClerk(<UserProfilePasskeysSection />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Manage Alice laptop' }));
    await user.click(screen.getByRole('menuitem', { name: 'Rename' }));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeVisible());
    await act(() => clerk.setActive({ session: 'sess_b' }));
    expect(await screen.findByText('Bob phone')).toBeVisible();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('rejects a rename if passkeys become disabled before Save', async () => {
    serveAccounts();
    const { clerk } = await renderWithClerk(<UserProfilePasskeysSection />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Manage Alice laptop' }));
    await user.click(screen.getByRole('menuitem', { name: 'Rename' }));
    const input = screen.getByRole('textbox', { name: 'Passkey name' });
    await user.clear(input);
    await user.type(input, 'Blocked rename');
    const environment = clerk.__internal_environment;
    if (!environment) {
      throw new Error('Missing environment');
    }
    environment.userSettings.attributes.passkey.enabled = false;
    const rename = holdRequests('post', '/v1/me/passkeys/pk_a');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    rename.release();
    expect(await screen.findByRole('alert')).toBeVisible();
    expect(rename.requests).toHaveLength(0);
    expect(clerk.user?.passkeys.find(passkey => passkey.id === 'pk_a')?.name).toBe('Alice laptop');
  });
});

describe('Held passkey creation ownership', () => {
  it('rejects verification issued by a different account after a held creation', async () => {
    const fapi = serveAccounts();
    authenticator();
    const { clerk } = await renderWithClerk(<UserProfilePasskeysSection />);
    const creation = holdRequests('post', '/v1/me/passkeys');
    const verification = holdRequests('post', '/v1/me/passkeys/passkey_1/attempt_verification');
    const alice = clerk.user;
    if (!alice) {
      throw new Error('Missing user');
    }
    const registration = alice.createPasskey();
    const rejected = expect(registration).rejects.toMatchObject({ errors: [{ code: 'resource_forbidden' }] });
    await waitFor(() => expect(creation.requests).toHaveLength(1));
    expect(new URL(creation.requests[0]?.url ?? '').searchParams.get('_clerk_session_id')).toBe('sess_a');
    await act(() => clerk.setActive({ session: 'sess_b' }));
    creation.release();
    await waitFor(() => expect(verification.requests).toHaveLength(1));
    expect(new URL(verification.requests[0]?.url ?? '').searchParams.get('_clerk_session_id')).toBe('sess_b');
    verification.release();
    await rejected;
    expect(
      fapi.client.sessions.find(session => session.id === 'sess_a')?.user.passkeys.map(passkey => passkey.name),
    ).toEqual(['Alice laptop']);
    expect(
      fapi.client.sessions.find(session => session.id === 'sess_b')?.user.passkeys.map(passkey => passkey.name),
    ).toEqual(['Bob phone']);
  });
});

describe('Replacing instance policy while editing', () => {
  it('closes editing without a mutation when policy replacement disables passkeys', async () => {
    const fapi = serveAccounts();
    const { clerk } = await renderWithClerk(<UserProfilePasskeysSection />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Manage Alice laptop' }));
    await user.click(screen.getByRole('menuitem', { name: 'Rename' }));
    const input = screen.getByRole('textbox', { name: 'Passkey name' });
    await user.clear(input);
    await user.type(input, 'Blocked rename');
    const nextEnvironment = fapiEnvironment();
    nextEnvironment.user_settings.attributes.passkey.enabled = false;
    fapi.environment = nextEnvironment;
    const rename = holdRequests('post', '/v1/me/passkeys/pk_a');
    await act(() => clerk.__internal_setEnvironment(nextEnvironment));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.queryByRole('group', { name: 'Passkeys' })).toBeNull();
    expect(rename.requests).toHaveLength(0);
    rename.release();
    expect(clerk.user?.passkeys.find(passkey => passkey.id === 'pk_a')?.name).toBe('Alice laptop');
  });
});
