import { Clerk } from '@clerk/clerk-js';
import { LoomHandoff, LoomProvider } from '@clerk/loom/handoff';
import { ClerkContextProvider } from '@clerk/shared/react';
import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';

import { publishableKey } from '../../../__tests__/feature/fake-fapi';
import { MosaicProvider } from '../../../mosaic-provider';
import { LoomProfileDetails } from '../loom-profile-details';
import { profileSettings } from './profile-fixture';

it('projects configured name and immutable username from the prefetched profile', () => {
  const clerk = new Clerk(publishableKey());
  const view = render(
    <ClerkContextProvider
      clerk={clerk}
      clerkStatus={clerk.status}
    >
      <MosaicProvider>
        <LoomProvider
          clerk={null}
          hydration={{
            version: 5,
            scope: { instanceKey: 'server', userId: 'user_1', sessionId: 'sess_1' },
            user: {
              data: {
                id: 'user_1',
                firstName: 'Alice',
                lastName: 'Smith',
                username: 'alice',
                imageUrl: '',
                hasImage: false,
                primaryEmailAddressId: null,
                emailAddresses: [],
                passwordEnabled: false,
                deleteSelfEnabled: false,
                enterpriseAccounts: [],
                externalAccounts: [],
              },
              updatedAt: Date.now(),
            },
            profileSettings: {
              data: {
                ...profileSettings,
                username: { ...profileSettings.username, immutable: true },
              },
              updatedAt: Date.now(),
            },
          }}
        >
          <LoomHandoff live={null}>
            <LoomProfileDetails />
          </LoomHandoff>
        </LoomProvider>
      </MosaicProvider>
    </ClerkContextProvider>,
  );
  const details = screen.getByRole('group', { name: 'Profile' });
  expect(within(details).getByText('Alice Smith')).toBeVisible();
  expect(within(details).getByText('alice')).toBeVisible();
  expect(within(details).getByRole('button', { name: 'Edit name' })).toBeDisabled();
  expect(within(details).queryByRole('button', { name: 'Edit username' })).toBeNull();
  view.unmount();
});
