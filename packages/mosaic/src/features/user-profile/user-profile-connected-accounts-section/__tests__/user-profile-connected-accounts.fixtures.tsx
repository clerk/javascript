import { screen } from '@testing-library/react';
import type userEvent from '@testing-library/user-event';

import { type FakeFapiSeed, serveFapi } from '../../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEnvironment,
  fapiExternalAccount,
  fapiSession,
  fapiSocial,
  fapiUser,
  fapiVerification,
} from '../../../../__tests__/feature/fapi';
import { openMenu } from '../../../../__tests__/feature/menu';
import { renderWithClerk } from '../../../../__tests__/feature/render';
import { UserProfileProfilePanel } from '../../user-profile-profile-panel';
import { UserProfileConnectedAccountsSection } from '../user-profile-connected-accounts-section';

export const google = fapiExternalAccount({ id: 'idn_google', provider: 'google', username: 'jdoe' });
export const github = fapiExternalAccount({ id: 'idn_github', provider: 'github' });
export const disconnectedGoogle = fapiExternalAccount({
  id: 'idn_google',
  provider: 'google',
  verification: fapiVerification('google_one_tap', {
    status: 'unverified',
    error: { code: 'external_account_missing_refresh_token', message: 'Missing token', long_message: 'Missing token' },
  }),
});

export function signedIn(accounts = [google], overrides: FakeFapiSeed = {}) {
  return {
    client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1', external_accounts: accounts }) })]),
    environment: fapiEnvironment({
      user_settings: {
        social: {
          oauth_google: fapiSocial('oauth_google', 'Google'),
          oauth_github: fapiSocial('oauth_github', 'GitHub'),
        },
      },
    }),
    ...overrides,
  };
}

export function deferred<T>() {
  let resolve: (value: T) => void = () => {};
  const promise = new Promise<T>(fulfill => {
    resolve = fulfill;
  });
  return { promise, resolve };
}

export async function renderSection(accounts = [google], overrides: FakeFapiSeed = {}) {
  const fapi = serveFapi(signedIn(accounts, overrides));
  const view = await renderWithClerk(
    <UserProfileProfilePanel>
      <UserProfileConnectedAccountsSection />
    </UserProfileProfilePanel>,
  );
  return { ...view, fapi };
}

export async function startReconnect(user: ReturnType<typeof userEvent.setup>, provider: string) {
  await openMenu(user, screen.getByRole('button', { name: `Manage ${provider}` }));
  await user.click(screen.getByRole('menuitem', { name: 'Reconnect' }));
}
