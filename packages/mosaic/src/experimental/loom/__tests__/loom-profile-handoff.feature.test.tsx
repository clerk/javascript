import { Clerk } from '@clerk/clerk-js';
import { LoomProvider } from '@clerk/loom/react';
import { ClerkContextProvider } from '@clerk/shared/react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { publishableKey, serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiEnvironment, fapiSession, fapiUser, fapiWeb3Wallet } from '../../../__tests__/feature/fapi';
import { openMenu } from '../../../__tests__/feature/menu';
import { MosaicProvider } from '../../../mosaic-provider';
import { LoomComposedProfile } from '../loom-composed-profile';
import { profileSettings } from './profile-fixture';

describe('Loom profile handoff', () => {
  it('enables Set as primary for a prefetched immutable wallet after the matching Clerk host connects', async () => {
    const firstAddress = '0x1234567890abcdef';
    const secondAddress = '0xabcdef1234567890';
    const firstWallet = fapiWeb3Wallet({ id: 'wallet_1', web3_wallet: firstAddress });
    const secondWallet = fapiWeb3Wallet({ id: 'wallet_2', web3_wallet: secondAddress });
    const user = fapiUser({
      id: 'user_1',
      web3_wallets: [firstWallet, secondWallet],
      primary_web3_wallet_id: firstWallet.id,
    });
    const fapi = serveFapi({
      environment: fapiEnvironment({
        attributes: {
          web3_wallet: {
            enabled: true,
            immutable: true,
            used_for_first_factor: true,
            first_factors: ['web3_metamask_signature'],
          },
        },
      }),
      client: fapiClient([fapiSession({ id: 'sess_1', user })]),
    });
    const clerk = new Clerk(publishableKey());
    const hydration = {
      version: 5 as const,
      scope: {
        instanceKey: JSON.stringify([clerk.publishableKey, clerk.frontendApi, clerk.proxyUrl ?? '', clerk.domain]),
        userId: user.id,
        sessionId: 'sess_1',
      },
      profileSettings: {
        data: {
          ...profileSettings,
          web3Wallet: {
            enabled: true,
            required: false,
            immutable: true,
            usedForFirstFactor: true,
            usedForSecondFactor: false,
          },
          web3FirstFactors: ['web3_metamask_signature'],
        },
        updatedAt: Date.now(),
      },
      user: {
        data: {
          id: user.id,
          firstName: null,
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
          primaryWeb3WalletId: firstWallet.id,
          web3Wallets: [firstWallet, secondWallet].map(wallet => ({
            id: wallet.id,
            web3Wallet: wallet.web3_wallet,
            verification: { status: 'verified', strategy: 'web3_metamask_signature', expireAt: null, error: null },
          })),
        },
        updatedAt: Date.now(),
      },
    };
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
    expect(screen.getByTitle(secondAddress)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Manage MetaMask' })).toBeInTheDocument();

    await act(() => clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() }));
    view.rerender(profile());
    const actor = userEvent.setup();
    await openMenu(actor, screen.getByRole('button', { name: 'Manage MetaMask' }));
    expect(screen.getByRole('menuitem', { name: 'Set as primary' })).toBeEnabled();
    expect(screen.queryByRole('menuitem', { name: 'Remove wallet' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Connect MetaMask' })).toBeNull();
    await actor.click(screen.getByRole('menuitem', { name: 'Set as primary' }));
    await waitFor(() => expect(fapi.client.sessions[0]?.user.primary_web3_wallet_id).toBe(secondWallet.id));
    view.unmount();
  });

  it('starts the Loom Add phone form with the country reported by the Clerk host', async () => {
    serveFapi({
      country: 'de',
      environment: fapiEnvironment({ attributes: { phone_number: { enabled: true } } }),
      client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]),
    });
    const clerk = new Clerk(publishableKey());
    await act(() => clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() }));
    const view = render(
      <ClerkContextProvider
        clerk={clerk}
        clerkStatus={clerk.status}
      >
        <MosaicProvider>
          <LoomProvider clerk={clerk}>
            <LoomComposedProfile />
          </LoomProvider>
        </MosaicProvider>
      </ClerkContextProvider>,
    );
    const actor = userEvent.setup();
    await actor.click(await screen.findByRole('button', { name: 'Add phone number' }));
    expect(screen.getByRole('dialog', { name: 'Add phone number' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Country, Germany' })).toBeInTheDocument();
    expect(screen.getByText('+49')).toBeInTheDocument();
    view.unmount();
  });
});
