import { Clerk } from '@clerk/clerk-js';
import { LoomProvider } from '@clerk/loom/handoff';
import { ClerkContextProvider } from '@clerk/shared/react';
import { render, screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { expect, it } from 'vitest';

import { publishableKey } from '../../../__tests__/feature/fake-fapi';
import { UserProfileSecurityPanel } from '../../../features/user-profile/user-profile-security-panel';
import { MosaicProvider } from '../../../mosaic-provider';
import { LoomPassword } from '../loom-account-status';
import { LoomComposedProfile } from '../loom-composed-profile';
import { profileSettings } from './profile-fixture';

function profile(overrides: { passwordEnabled?: boolean; deleteSelfEnabled?: boolean } = {}) {
  const clerk = new Clerk(publishableKey());
  const hydration = {
    version: 5 as const,
    scope: { instanceKey: 'server', userId: 'user_1', sessionId: 'sess_1' },
    user: {
      data: {
        id: 'user_1',
        firstName: 'Alice',
        lastName: null,
        username: null,
        imageUrl: '',
        hasImage: false,
        primaryEmailAddressId: null,
        emailAddresses: [],
        passwordEnabled: overrides.passwordEnabled ?? false,
        deleteSelfEnabled: overrides.deleteSelfEnabled ?? true,
        enterpriseAccounts: [],
        externalAccounts: [{
          id: 'google_1',
          provider: 'google',
          approvedScopes: '',
          username: 'alice-google',
          emailAddress: '',
          verification: { status: 'verified' as const, strategy: null, expireAt: null, error: null },
        }],
      },
      updatedAt: Date.now(),
    },
    profileSettings: { data: profileSettings, updatedAt: Date.now() },
  };
  return (
    <ClerkContextProvider clerk={clerk} clerkStatus={clerk.status}>
      <MosaicProvider>
        <LoomProvider clerk={null} hydration={hydration}>
          <LoomComposedProfile />
        </LoomProvider>
      </MosaicProvider>
    </ClerkContextProvider>
  );
}

it('renders prefetched connected accounts and disabled deletion before Clerk is ready', () => {
  const view = render(profile());
  expect(screen.getByText('alice-google')).toBeVisible();
  const danger = screen.getByRole('group', { name: 'Danger zone' });
  expect(within(danger).getByRole('button', { name: 'Delete account' })).toBeDisabled();
  view.unmount();
});

it('omits deletion when the prefetched user cannot delete the account', () => {
  const view = render(profile({ deleteSelfEnabled: false }));
  expect(screen.queryByRole('group', { name: 'Danger zone' })).toBeNull();
  view.unmount();
});

it('server renders password presence with disabled action geometry', () => {
  const clerk = new Clerk(publishableKey());
  const renderPassword = (passwordEnabled: boolean) => {
    const hydration = {
      version: 5 as const,
      scope: { instanceKey: 'server', userId: 'user_1', sessionId: 'sess_1' },
      user: { data: {
        id: 'user_1', firstName: 'Alice', lastName: null, username: null, imageUrl: '', hasImage: false,
        primaryEmailAddressId: null, emailAddresses: [], passwordEnabled, deleteSelfEnabled: false,
        enterpriseAccounts: [], externalAccounts: [],
      }, updatedAt: Date.now() },
      profileSettings: { data: profileSettings, updatedAt: Date.now() },
    };
    return renderToString(
      <ClerkContextProvider clerk={clerk} clerkStatus={clerk.status}>
        <MosaicProvider>
          <LoomProvider clerk={null} hydration={hydration}>
            <UserProfileSecurityPanel passwordSection={<LoomPassword />} />
          </LoomProvider>
        </MosaicProvider>
      </ClerkContextProvider>,
    );
  };
  expect(renderPassword(false)).toContain('Set password');
  expect(renderPassword(true)).toContain('Change password');
});
