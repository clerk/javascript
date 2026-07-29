import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, waitFor } from '@/test/utils';

import { Web3Section } from '../Web3Section';

vi.mock('@clerk/shared/internal/clerk-js/web3', async importOriginal => {
  const actual = await importOriginal<typeof import('@clerk/shared/internal/clerk-js/web3')>();
  return {
    ...actual,
    createWeb3: vi.fn(() => ({
      // Mirrors the empty-string fallback the shared helper returns when the
      // wallet provider isn't resolvable (e.g. dynamic `@coinbase/wallet-sdk`
      // import returned undefined because no module manager propagated to the
      // composed/subcomponent UserProfile).
      getWeb3Identifier: vi.fn(() => Promise.resolve('')),
      generateWeb3Signature: vi.fn(() => Promise.resolve('')),
    })),
  };
});

const { createFixtures } = bindCreateFixtures('UserProfile');

const withMetamaskWallet = createFixtures.config(f => {
  f.withWeb3Wallet();
  f.withUser({
    web3_wallets: [
      {
        object: 'web3_wallet',
        id: 'w3w_123',
        web3_wallet: '0x1234567890abcdef1234567890abcdef12345678',
        verification: {
          status: 'verified',
          strategy: 'web3_metamask_signature',
          attempts: null,
          expire_at: null,
        },
      },
    ] as any,
  });
});

const withAdminWallet = createFixtures.config(f => {
  f.withWeb3Wallet();
  f.withUser({
    web3_wallets: [
      {
        object: 'web3_wallet',
        id: 'w3w_456',
        web3_wallet: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        verification: {
          status: 'verified',
          strategy: 'admin',
          attempts: null,
          expire_at: null,
        },
      },
    ] as any,
  });
});

const withUnknownStrategyWallet = createFixtures.config(f => {
  f.withWeb3Wallet();
  f.withUser({
    web3_wallets: [
      {
        object: 'web3_wallet',
        id: 'w3w_789',
        web3_wallet: '0x9999999999999999999999999999999999999999',
        verification: {
          status: 'verified',
          strategy: 'some_unknown_strategy',
          attempts: null,
          expire_at: null,
        },
      },
    ] as any,
  });
});

const withAdminAndMetamaskWallets = createFixtures.config(f => {
  f.withWeb3Wallet();
  f.withUser({
    web3_wallets: [
      {
        object: 'web3_wallet',
        id: 'w3w_123',
        web3_wallet: '0x1234567890abcdef1234567890abcdef12345678',
        verification: {
          status: 'verified',
          strategy: 'web3_metamask_signature',
          attempts: null,
          expire_at: null,
        },
      },
      {
        object: 'web3_wallet',
        id: 'w3w_456',
        web3_wallet: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        verification: {
          status: 'verified',
          strategy: 'admin',
          attempts: null,
          expire_at: null,
        },
      },
    ] as any,
  });
});

describe('Web3Section', () => {
  it('renders a wallet with a known strategy (metamask)', async () => {
    const { wrapper } = await createFixtures(withMetamaskWallet);
    const { getByText } = render(<Web3Section />, { wrapper });

    getByText(/MetaMask/i);
    getByText(/0x1234...5678/);
  });

  it('renders a wallet with an admin strategy showing only the address', async () => {
    const { wrapper } = await createFixtures(withAdminWallet);
    const { getByText, queryByText } = render(<Web3Section />, { wrapper });

    // Should show the shortened address
    getByText('0xabcd...abcd');
    // Should not show a provider name
    expect(queryByText(/MetaMask/i)).toBeNull();
  });

  it('does not render a wallet with an unknown non-admin strategy', async () => {
    const { wrapper } = await createFixtures(withUnknownStrategyWallet);
    const { queryByText } = render(<Web3Section />, { wrapper });

    expect(queryByText(/0x9999...9999/)).toBeNull();
  });

  it('renders both known-strategy and admin-strategy wallets', async () => {
    const { wrapper } = await createFixtures(withAdminAndMetamaskWallets);
    const { getByText } = render(<Web3Section />, { wrapper });

    // Metamask wallet with provider name
    getByText(/MetaMask/i);
    getByText(/0x1234...5678/);
    // Admin wallet with just the address
    getByText('0xabcd...abcd');
  });

  // Regression: composed/subcomponent UserProfile mounts can fall back to a
  // no-op ModuleManager when IsomorphicClerk doesn't propagate the wrapper's
  // moduleManager (see packages/react isomorphicClerk test). When that
  // happens, `createWeb3(...).getWeb3Identifier` returns '' instead of a
  // wallet address — and we used to POST `{ web3_wallet: '' }` straight to
  // FAPI, surfacing as a confusing 422 form_param_nil error. Guard the empty
  // identifier locally so the failure mode is a clear UI message.
  describe('AddWeb3WalletActionMenu — empty identifier guard', () => {
    const withCoinbaseEnabled = createFixtures.config(f => {
      f.withWeb3Wallet({
        first_factors: ['web3_coinbase_wallet_signature'],
        verifications: ['web3_coinbase_wallet_signature'],
      });
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    it('does not POST /me/web3_wallets when getWeb3Identifier returns ""', async () => {
      const { wrapper, fixtures } = await createFixtures(withCoinbaseEnabled);
      const createWeb3Wallet = vi.fn();
      fixtures.clerk.user!.createWeb3Wallet = createWeb3Wallet as any;

      const { getByRole, userEvent, findByText } = render(<Web3Section />, { wrapper });

      await userEvent.click(getByRole('button', { name: /Connect wallet/i }));
      await userEvent.click(getByRole('menuitem', { name: /Coinbase Wallet/i }));

      await findByText(/Web3 Wallet extension cannot be found/i);
      await waitFor(() => {
        expect(createWeb3Wallet).not.toHaveBeenCalled();
      });
    });
  });
});
