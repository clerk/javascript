import { Clerk } from '@clerk/clerk-js';
import { LoomProvider } from '@clerk/loom/handoff';
import { ClerkContextProvider } from '@clerk/shared/react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';

import { holdRequests, publishableKey, serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiEmailAddress, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { MosaicProvider } from '../../../mosaic-provider';
import { LoomPassword } from '../loom-account-status';
import { LoomComposedProfile } from '../loom-composed-profile';
import { profileSettings } from './profile-fixture';

it('keeps the selected Security page when a prefetched profile hands off to Clerk', async () => {
  const user = fapiUser({ id: 'user_1', first_name: 'Live' });
  serveFapi({ client: fapiClient([fapiSession({ id: 'sess_1', user })]) });
  const clerk = new Clerk(publishableKey());
  const hydration = {
    version: 5 as const,
    scope: {
      instanceKey: JSON.stringify([clerk.publishableKey, clerk.frontendApi, clerk.proxyUrl ?? '', clerk.domain]),
      userId: user.id,
      sessionId: 'sess_1',
    },
    profileSettings: { data: profileSettings, updatedAt: Date.now() },
    user: {
      data: {
        id: user.id,
        firstName: 'Seed',
        lastName: null,
        username: null,
        imageUrl: '',
        hasImage: false,
        primaryEmailAddressId: null,
        passwordEnabled: true,
        deleteSelfEnabled: true,
        emailAddresses: [],
        externalAccounts: [],
        enterpriseAccounts: [],
      },
      updatedAt: Date.now(),
    },
  };
  const readUser = vi.spyOn(clerk, '__internal_readUser');
  const profile = () => (
    <ClerkContextProvider
      clerk={clerk}
      clerkStatus={clerk.status}
    >
      <MosaicProvider>
        <LoomProvider
          clerk={clerk}
          hydration={hydration}
        >
          <LoomComposedProfile />
        </LoomProvider>
      </MosaicProvider>
    </ClerkContextProvider>
  );
  const view = render(profile());
  expect(screen.getByText('Seed')).toBeVisible();

  const actor = userEvent.setup();
  await actor.click(screen.getByRole('button', { name: 'Account' }));
  await actor.click(screen.getByRole('tab', { name: 'Security' }));
  expect(screen.getByText('Password')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Change password' })).toBeDisabled();

  await act(() => clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() }));
  view.rerender(profile());
  expect(screen.getByRole('button', { name: 'Security' })).toBeVisible();
  expect(screen.getByText('Password')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Change password' })).toBeEnabled();
  await actor.click(screen.getByRole('button', { name: 'Security' }));
  await actor.click(screen.getByRole('tab', { name: 'Account' }));
  expect(screen.getByText('Live')).toBeVisible();
  expect(screen.queryByText('Seed')).toBeNull();
  const liveUser = clerk.user;
  if (!liveUser) {
    throw new Error('Expected the loaded Clerk user');
  }
  await act(() => liveUser.update({ firstName: 'Updated' }));
  await waitFor(() => expect(screen.getByText('Updated')).toBeVisible());
  expect(readUser).not.toHaveBeenCalled();
  view.unmount();
});

it('uses the ordinary password action for standalone Password after Clerk loads', async () => {
  const email = fapiEmailAddress({ id: 'idn_1', email_address: 'person@example.com' });
  const user = fapiUser({ id: 'user_1', email_addresses: [email] });
  const fapi = serveFapi({ client: fapiClient([fapiSession({ id: 'sess_1', user })]) });
  const clerk = new Clerk(publishableKey());
  await act(() => clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() }));
  const readUser = vi.spyOn(clerk, '__internal_readUser');
  const pendingSettings = holdRequests('get', '/v1/environment');
  const view = render(
    <ClerkContextProvider
      clerk={clerk}
      clerkStatus={clerk.status}
    >
      <MosaicProvider>
        <LoomProvider clerk={clerk}>
          <LoomPassword />
        </LoomProvider>
      </MosaicProvider>
    </ClerkContextProvider>,
  );
  const actor = userEvent.setup();
  await actor.click(await screen.findByRole('button', { name: 'Change password' }));
  expect(pendingSettings.requests).toHaveLength(0);
  await actor.type(screen.getByLabelText('Current password'), 'old-secret');
  await actor.type(screen.getByLabelText('New password'), 'new-password-123');
  await actor.type(screen.getByLabelText('Confirm password'), 'new-password-123');
  await actor.click(screen.getByRole('button', { name: 'Save changes' }));
  await waitFor(() => expect(fapi.passwordUpdates).toHaveLength(1));
  expect(readUser).not.toHaveBeenCalled();
  pendingSettings.release();
  view.unmount();
});
