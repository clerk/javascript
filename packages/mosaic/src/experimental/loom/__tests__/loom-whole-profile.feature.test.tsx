import { Clerk } from '@clerk/clerk-js';
import { LoomProvider } from '@clerk/loom/react';
import { stringToFormattedPhoneString } from '@clerk/shared/phone';
import { ClerkContextProvider } from '@clerk/shared/react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { expect, it } from 'vitest';

import { publishableKey } from '../../../__tests__/feature/fake-fapi';
import { MosaicProvider } from '../../../mosaic-provider';
import { LoomComposedProfile } from '../loom-composed-profile';
import { profileSettings } from './profile-fixture';

it('shows server-prefetched profile rows before the Clerk host is ready', async () => {
  const settings = {
    ...profileSettings,
    enterpriseSsoEnabled: true,
    phoneNumber: {
      enabled: true,
      required: false,
      immutable: false,
      usedForFirstFactor: true,
      usedForSecondFactor: true,
    },
    web3Wallet: {
      enabled: true,
      required: false,
      immutable: false,
      usedForFirstFactor: true,
      usedForSecondFactor: false,
    },
    passkey: { enabled: true, required: false, immutable: false, usedForFirstFactor: true, usedForSecondFactor: false },
    web3FirstFactors: ['web3_metamask_signature'],
    secondFactors: ['phone_code', 'totp', 'backup_code'],
    mfaRequired: false,
    applicationName: 'Example',
  };
  const user = {
    id: 'user_1',
    firstName: 'Alice',
    lastName: 'Smith',
    username: 'alice',
    imageUrl: 'https://img.example/alice',
    hasImage: true,
    primaryEmailAddressId: null,
    emailAddresses: [],
    passwordEnabled: true,
    deleteSelfEnabled: true,
    externalAccounts: [],
    primaryPhoneNumberId: 'phone_1',
    primaryWeb3WalletId: 'wallet_1',
    totpEnabled: true,
    backupCodeEnabled: true,
    phoneNumbers: [
      {
        id: 'phone_1',
        phoneNumber: '+15551230000',
        reservedForSecondFactor: true,
        defaultSecondFactor: true,
        verification: { status: 'verified', strategy: null, expireAt: null, error: null },
      },
    ],
    web3Wallets: [
      {
        id: 'wallet_1',
        web3Wallet: '0xabc',
        verification: {
          status: 'verified',
          strategy: 'web3_metamask_signature',
          expireAt: null,
          error: null,
        },
      },
    ],
    passkeys: [{ id: 'passkey_1', name: 'My laptop', createdAt: Date.now(), lastUsedAt: null }],
    enterpriseAccounts: [
      {
        id: 'eac_1',
        emailAddress: 'alice@acme.example',
        enterpriseConnectionId: 'ec_1',
        verificationError: null,
        active: true,
        provider: 'saml',
        enterpriseConnection: {
          active: true,
          name: 'Acme',
          logoPublicUrl: null,
          disableAdditionalIdentifications: false,
        },
      },
    ],
  };
  const clerk = new Clerk(publishableKey());
  const profile = (
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
            user: { data: user, updatedAt: Date.now() },
            profileSettings: { data: settings, updatedAt: Date.now() },
          }}
        >
          <LoomComposedProfile />
        </LoomProvider>
      </MosaicProvider>
    </ClerkContextProvider>
  );
  const markup = renderToString(profile);
  expect(markup).toContain(stringToFormattedPhoneString('+15551230000'));
  expect(markup).toContain('alice@acme.example');
  expect(markup).toContain('0xabc');
  expect(markup).toContain('My laptop');
  expect(markup).toContain('Authenticator app');
  const view = render(profile);
  const phone = screen.getByRole('group', { name: 'Phone' });
  expect(within(phone).getByText(stringToFormattedPhoneString('+15551230000'))).toBeVisible();
  expect(within(phone).getByRole('button', { name: 'Add phone number' })).toBeDisabled();
  expect(screen.getAllByText('Acme').length).toBeGreaterThan(0);
  expect(screen.getByText('alice@acme.example')).toBeVisible();
  expect(screen.queryByText('Available connections could not be loaded')).not.toBeInTheDocument();
  expect(screen.getByText('0xabc')).toBeVisible();
  const actor = userEvent.setup();
  await actor.click(screen.getByRole('button', { name: 'Account' }));
  await actor.click(screen.getByRole('tab', { name: 'Security' }));
  expect(screen.getByText('My laptop')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Add passkey' })).toBeDisabled();
  expect(screen.getByText('Authenticator app')).toBeVisible();
  expect(screen.getByText('Checking devices')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Refresh devices' })).not.toBeInTheDocument();
  view.unmount();
});
