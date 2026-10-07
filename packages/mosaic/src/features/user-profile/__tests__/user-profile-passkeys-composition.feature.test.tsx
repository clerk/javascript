import { act, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiEnvironment, fapiPasskey, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { UserProfileView } from '../user-profile.view';
import { UserProfilePasskeysSectionView } from '../user-profile-passkeys-section.view';
import { passkeysSectionNode } from '../user-profile-passkeys-section/user-profile-passkeys-section';
import { useUserProfilePasskeysModel } from '../user-profile-passkeys-section/user-profile-passkeys-section.model';
import { renderPasswordSection } from '../user-profile-password-section/user-profile-password-section';
import { useUserProfilePasswordModel } from '../user-profile-password-section/user-profile-password-section.model';
import { UserProfileSecurityPanelView } from '../user-profile-security-panel.view';

afterEach(() => vi.restoreAllMocks());

function serveAccounts() {
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

function SecurityHost() {
  const passwordSlot = renderPasswordSection(useUserProfilePasswordModel(), null);
  const passkeysSlot = passkeysSectionNode(useUserProfilePasskeysModel());
  return (
    <UserProfileSecurityPanelView
      passwordSlot={passwordSlot}
      passkeysSlot={passkeysSlot}
      mfaMethods={[]}
      devices={[]}
    />
  );
}

function ProfileHost() {
  const passwordSlot = renderPasswordSection(useUserProfilePasswordModel(), null);
  const passkeysSlot = passkeysSectionNode(useUserProfilePasskeysModel());
  return (
    <UserProfileView
      activePage='security'
      onPageChange={() => {}}
      pages={{ account: {}, security: { passwordSlot, passkeysSlot, mfaMethods: [], devices: [] } }}
    />
  );
}

describe('Composing connected authentication sections', () => {
  it('renders a plain passkeys section node inside Authentication', async () => {
    serveAccounts();
    await renderWithClerk(
      <UserProfileSecurityPanelView
        passkeysSlot={
          <UserProfilePasskeysSectionView
            passkeys={[]}
            onAdd={vi.fn()}
          />
        }
      />,
    );

    const authentication = screen.getByRole('region', { name: 'Authentication' });
    expect(within(authentication).getByText('No passkeys added')).toBeVisible();
    expect(within(authentication).getByRole('button', { name: 'Add passkey' })).toBeVisible();
  });

  it.each([
    { name: 'Security', Host: SecurityHost },
    { name: 'UserProfile', Host: ProfileHost },
  ])('keeps one current-account section of each kind after a user switch in $name', async ({ Host }) => {
    serveAccounts();
    const { clerk } = await renderWithClerk(<Host />);
    expect(screen.getAllByRole('group', { name: 'Password' })).toHaveLength(1);
    expect(screen.getAllByRole('group', { name: 'Passkeys' })).toHaveLength(1);
    await act(() => clerk.setActive({ session: 'sess_b' }));
    expect(await screen.findByText('Bob phone')).toBeVisible();
    expect(screen.getAllByRole('group', { name: 'Password' })).toHaveLength(1);
    expect(screen.getAllByRole('group', { name: 'Passkeys' })).toHaveLength(1);
    expect(screen.queryByText('Alice laptop')).toBeNull();
  });

  it('places Password and Passkeys before MFA and devices', async () => {
    serveAccounts();
    await renderWithClerk(<SecurityHost />);
    const authentication = screen.getByRole('region', { name: 'Authentication' });
    const password = within(authentication).getByText('Password');
    const passkeys = within(authentication).getByText('Passkeys');
    const mfa = within(authentication).getByText('2-step verification');
    expect(password.compareDocumentPosition(passkeys) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(passkeys.compareDocumentPosition(mfa) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(
      mfa.compareDocumentPosition(screen.getByText('Active devices')) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
