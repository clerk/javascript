import { act, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiEnvironment, fapiPasskey, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { UserProfileView } from '../user-profile.view';
import { UserProfilePasskeysSection } from '../user-profile-passkeys-section/user-profile-passkeys-section';
import { UserProfilePasswordSection } from '../user-profile-password-section/user-profile-password-section';
import { UserProfileSecurityPanel } from '../user-profile-security-panel';

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

function ProfileHost() {
  return (
    <UserProfileView
      activePage='security'
      onPageChange={() => {}}
      pages={{
        account: {},
        security: {
          children: (
            <>
              <UserProfilePasswordSection />
              <UserProfilePasskeysSection />
            </>
          ),
        },
      }}
    />
  );
}

describe('Composing connected security sections', () => {
  it.each([
    { name: 'Security', Host: UserProfileSecurityPanel },
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
});
