import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render } from '@/test/utils';

import { Web3Section } from '../Web3Section';

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
});
