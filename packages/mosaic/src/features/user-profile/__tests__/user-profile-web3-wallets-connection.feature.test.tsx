import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { WindowAppReadyEventAPI } from '@wallet-standard/core';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { deferred } from '../../../__tests__/async';
import { holdRequests, serveFapi } from '../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEnvironment,
  fapiSession,
  fapiUser,
  fapiVerification,
  fapiWeb3Wallet,
} from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { UserProfileWeb3WalletsSection } from '../user-profile-web3-wallets-section/user-profile-web3-wallets-section';

describe('Web3 connection rows', () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ['MetaMask', 'web3_metamask_signature'],
    ['Base', 'web3_base_signature'],
    ['Coinbase Wallet', 'web3_coinbase_wallet_signature'],
    ['OKX Wallet', 'web3_okx_wallet_signature'],
  ] as const)('verifies a saved %s wallet without creating another resource', async (name, strategy) => {
    const address = '0x1234567890abcdef';
    vi.stubGlobal('ethereum', {
      request: vi.fn(({ method }: { method: string }) =>
        Promise.resolve(method === 'eth_requestAccounts' ? [address] : 'signature'),
      ),
    });
    const base = fapiEnvironment();
    const fapi = serveFapi({
      environment: fapiEnvironment({
        user_settings: {
          attributes: {
            ...base.user_settings.attributes,
            web3_wallet: {
              ...base.user_settings.attributes.web3_wallet,
              enabled: true,
              used_for_first_factor: true,
              first_factors: [strategy],
            },
          },
        },
      }),
      client: fapiClient([
        fapiSession({
          id: 'sess_1',
          user: fapiUser({
            id: 'user_1',
            web3_wallets: [
              fapiWeb3Wallet({
                id: 'saved_wallet',
                web3_wallet: address,
                verification: fapiVerification(strategy, { status: 'unverified' }),
              }),
            ],
          }),
        }),
      ]),
    });
    const { clerk } = await renderWithClerk(<UserProfileWeb3WalletsSection />);
    Object.defineProperty(clerk, '__internal_moduleManager', {
      value: {
        import: async (module: string) => {
          if (module === '@base-org/account') {
            return { createBaseAccountSDK: () => ({ getProvider: () => window.ethereum }) };
          }
          if (module === '@coinbase/wallet-sdk') {
            return { createCoinbaseWalletSDK: () => ({ getProvider: () => window.ethereum }) };
          }
          return undefined;
        },
      },
    });
    const creation = holdRequests('post', '/v1/me/web3_wallets');

    expect(screen.queryByRole('button', { name: `Connect ${name}` })).toBeNull();
    await userEvent.setup().click(screen.getByRole('button', { name: `Verify ${name}` }));
    await waitFor(() => expect(fapi.client.sessions[0]?.user.web3_wallets[0]?.verification?.status).toBe('verified'));
    expect(fapi.client.sessions[0]?.user.web3_wallets.map(wallet => wallet.id)).toEqual(['saved_wallet']);
    expect(creation.requests).toHaveLength(0);
    creation.release();
  });

  it('rejects a different MetaMask account before preparing or creating a saved wallet', async () => {
    vi.stubGlobal('ethereum', {
      request: vi.fn(() => Promise.resolve(['0xabcdef1234567890'])),
    });
    const base = fapiEnvironment();
    const fapi = serveFapi({
      environment: fapiEnvironment({
        user_settings: {
          attributes: {
            ...base.user_settings.attributes,
            web3_wallet: {
              ...base.user_settings.attributes.web3_wallet,
              enabled: true,
              used_for_first_factor: true,
              first_factors: ['web3_metamask_signature'],
            },
          },
        },
      }),
      client: fapiClient([
        fapiSession({
          id: 'sess_1',
          user: fapiUser({
            id: 'user_1',
            web3_wallets: [
              fapiWeb3Wallet({
                id: 'saved_wallet',
                web3_wallet: '0x1234567890abcdef',
                verification: fapiVerification('web3_metamask_signature', { status: 'unverified' }),
              }),
            ],
          }),
        }),
      ]),
    });
    await renderWithClerk(<UserProfileWeb3WalletsSection />);
    const creation = holdRequests('post', '/v1/me/web3_wallets');
    const preparation = holdRequests('post', '/v1/me/web3_wallets/:id/prepare_verification');

    await userEvent.setup().click(screen.getByRole('button', { name: 'Verify MetaMask' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Select the wallet account that matches this address.');
    expect(creation.requests).toHaveLength(0);
    expect(preparation.requests).toHaveLength(0);
    expect(fapi.client.sessions[0]?.user.web3_wallets.map(wallet => wallet.id)).toEqual(['saved_wallet']);
    creation.release();
    preparation.release();
  });

  it.each([
    ['MetaMask', 'web3_metamask_signature'],
    ['Base', 'web3_base_signature'],
    ['Coinbase Wallet', 'web3_coinbase_wallet_signature'],
    ['OKX Wallet', 'web3_okx_wallet_signature'],
  ] as const)('moves pending %s connection to its saved wallet row while signing', async (name, strategy) => {
    const signature = deferred<string>();
    vi.stubGlobal('ethereum', {
      request: vi.fn(({ method }: { method: string }) =>
        method === 'eth_requestAccounts' ? Promise.resolve(['0x1234567890abcdef']) : signature.promise,
      ),
    });
    const base = fapiEnvironment();
    const fapi = serveFapi({
      environment: fapiEnvironment({
        user_settings: {
          attributes: {
            ...base.user_settings.attributes,
            web3_wallet: {
              ...base.user_settings.attributes.web3_wallet,
              enabled: true,
              used_for_first_factor: true,
              first_factors: [strategy],
            },
          },
        },
      }),
      client: fapiClient([
        fapiSession({
          id: 'sess_1',
          user: fapiUser({
            id: 'user_1',
          }),
        }),
      ]),
    });
    const { clerk } = await renderWithClerk(<UserProfileWeb3WalletsSection />);
    Object.defineProperty(clerk, '__internal_moduleManager', {
      value: {
        import: async (module: string) => {
          if (module === '@base-org/account') {
            return { createBaseAccountSDK: () => ({ getProvider: () => window.ethereum }) };
          }
          if (module === '@coinbase/wallet-sdk') {
            return { createCoinbaseWalletSDK: () => ({ getProvider: () => window.ethereum }) };
          }
          return undefined;
        },
      },
    });

    await userEvent.setup().click(await screen.findByRole('button', { name: `Connect ${name}` }));
    await waitFor(() => expect(fapi.client.sessions[0]?.user.web3_wallets).toHaveLength(1));
    expect(screen.getByRole('button', { name: `Verify ${name}` })).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('button', { name: `Connect ${name}` })).toBeNull();
    expect(screen.getByText('Verifying')).toBeInTheDocument();
    expect(screen.getByTitle('0x1234567890abcdef')).toBeInTheDocument();

    signature.resolve('signature');
    await waitFor(() =>
      expect(
        fapi.client.sessions[0]?.user.web3_wallets.find(wallet => wallet.web3_wallet === '0x1234567890abcdef')
          ?.verification?.status,
      ).toBe('verified'),
    );
    expect(await screen.findByTitle('0x1234567890abcdef')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: `Connect ${name}` })).toBeNull();
  });

  it('keeps the Solana picker pending without a duplicate wallet row while signing', async () => {
    const signature = deferred<[{ signature: Uint8Array }]>();
    const account = {
      address: 'SolanaAbCd',
      publicKey: new Uint8Array([1, 2, 3]),
      chains: ['solana:mainnet' as const],
      features: ['solana:signMessage' as const],
    };
    const wallet = {
      version: '1.0.0' as const,
      name: 'Test Solana',
      icon: 'data:image/svg+xml;base64,' as const,
      chains: ['solana:mainnet' as const],
      accounts: [account],
      features: {
        'standard:connect': { version: '1.0.0' as const, connect: () => Promise.resolve({ accounts: [account] }) },
        'solana:signMessage': { version: '1.0.0' as const, signMessage: () => signature.promise },
      },
    };
    const unregister: Array<() => void> = [];
    const register = (api: WindowAppReadyEventAPI) => unregister.push(api.register(wallet));
    const onAppReady = (event: Event & { detail?: WindowAppReadyEventAPI }) => {
      if (event.detail) {
        register(event.detail);
      }
    };
    window.addEventListener('wallet-standard:app-ready', onAppReady);
    window.dispatchEvent(new CustomEvent('wallet-standard:register-wallet', { detail: register }));
    try {
      const base = fapiEnvironment();
      const fapi = serveFapi({
        environment: fapiEnvironment({
          user_settings: {
            attributes: {
              ...base.user_settings.attributes,
              web3_wallet: {
                ...base.user_settings.attributes.web3_wallet,
                enabled: true,
                used_for_first_factor: true,
                first_factors: ['web3_solana_signature'],
              },
            },
          },
        }),
        client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]),
      });
      await renderWithClerk(<UserProfileWeb3WalletsSection />);
      await userEvent.setup().click(await screen.findByRole('button', { name: 'Connect Solana' }));
      await userEvent.setup().click(await screen.findByRole('button', { name: 'Test Solana' }));

      await waitFor(() => expect(fapi.client.sessions[0]?.user.web3_wallets).toHaveLength(1));
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Verify Solana' })).toHaveAttribute('aria-busy', 'true'),
      );
      expect(screen.queryByRole('button', { name: 'Connect Solana' })).toBeNull();
      expect(screen.getByText('Verifying')).toBeInTheDocument();

      signature.resolve([{ signature: new Uint8Array([4, 5, 6]) }]);
      await waitFor(() => expect(fapi.client.sessions[0]?.user.web3_wallets[0]?.verification?.status).toBe('verified'));
      expect(await screen.findByTitle('SolanaAbCd')).toBeInTheDocument();
    } finally {
      window.removeEventListener('wallet-standard:app-ready', onAppReady);
      unregister.forEach(remove => remove());
    }
  });

  it.each([
    ['SolanaAbCd', 'verified'],
    ['SolanaOther', 'mismatch'],
    ['SolanaAbCd', 'retry'],
  ] as const)('checks a selected Solana account against the saved wallet (%s, %s)', async (address, outcome) => {
    let signatures = 0;
    const account = {
      address,
      publicKey: new Uint8Array([1, 2, 3]),
      chains: ['solana:mainnet' as const],
      features: ['solana:signMessage' as const],
    };
    const wallet = {
      version: '1.0.0' as const,
      name: 'Saved Solana',
      icon: 'data:image/svg+xml;base64,' as const,
      chains: ['solana:mainnet' as const],
      accounts: [account],
      features: {
        'standard:connect': { version: '1.0.0' as const, connect: () => Promise.resolve({ accounts: [account] }) },
        'solana:signMessage': {
          version: '1.0.0' as const,
          signMessage: () => {
            signatures += 1;
            return outcome === 'retry' && signatures === 1
              ? Promise.reject(new Error('User rejected the request.'))
              : Promise.resolve([{ signature: new Uint8Array([4, 5, 6]) }]);
          },
        },
      },
    };
    const unregister: Array<() => void> = [];
    const register = (api: WindowAppReadyEventAPI) => unregister.push(api.register(wallet));
    const onAppReady = (event: Event & { detail?: WindowAppReadyEventAPI }) => {
      if (event.detail) {
        register(event.detail);
      }
    };
    window.addEventListener('wallet-standard:app-ready', onAppReady);
    window.dispatchEvent(new CustomEvent('wallet-standard:register-wallet', { detail: register }));
    try {
      const base = fapiEnvironment();
      const fapi = serveFapi({
        environment: fapiEnvironment({
          user_settings: {
            attributes: {
              ...base.user_settings.attributes,
              web3_wallet: {
                ...base.user_settings.attributes.web3_wallet,
                enabled: true,
                used_for_first_factor: true,
                first_factors: ['web3_solana_signature'],
              },
            },
          },
        }),
        client: fapiClient([
          fapiSession({
            id: 'sess_1',
            user: fapiUser({
              id: 'user_1',
              web3_wallets: [
                fapiWeb3Wallet({
                  id: 'saved_solana',
                  web3_wallet: 'SolanaAbCd',
                  verification: fapiVerification('web3_solana_signature', { status: 'unverified' }),
                }),
              ],
            }),
          }),
        ]),
      });
      await renderWithClerk(<UserProfileWeb3WalletsSection />);
      const creation = holdRequests('post', '/v1/me/web3_wallets');
      const preparation = holdRequests('post', '/v1/me/web3_wallets/:id/prepare_verification');

      expect(screen.queryByRole('button', { name: 'Connect Solana' })).toBeNull();
      await userEvent.setup().click(screen.getByRole('button', { name: 'Verify Solana' }));
      await userEvent.setup().click(await screen.findByRole('button', { name: 'Saved Solana' }));
      if (outcome !== 'mismatch') {
        await waitFor(() => expect(preparation.requests).toHaveLength(1));
        preparation.release();
        if (outcome === 'retry') {
          await waitFor(() => expect(screen.getByRole('alert')).not.toHaveTextContent(/^$/));
          await waitFor(() => expect(screen.queryByRole('dialog', { hidden: true })).toBeNull());
          expect(screen.getByRole('button', { name: 'Verify Solana' })).toBeEnabled();
          expect(screen.queryByRole('button', { name: 'Connect Solana' })).toBeNull();
          expect(fapi.client.sessions[0]?.user.web3_wallets[0]?.verification?.status).toBe('unverified');
          expect(signatures).toBe(1);
          await userEvent.setup().click(screen.getByRole('button', { name: 'Verify Solana' }));
          await userEvent.setup().click(await screen.findByRole('button', { name: 'Saved Solana' }));
        }
        await waitFor(() =>
          expect(fapi.client.sessions[0]?.user.web3_wallets[0]?.verification?.status).toBe('verified'),
        );
        expect(signatures).toBe(outcome === 'retry' ? 2 : 1);
      } else {
        await waitFor(() =>
          expect(screen.getByRole('alert')).toHaveTextContent('Select the wallet account that matches this address.'),
        );
        expect(preparation.requests).toHaveLength(0);
        expect(fapi.client.sessions[0]?.user.web3_wallets[0]?.verification?.status).toBe('unverified');
        preparation.release();
      }
      expect(fapi.client.sessions[0]?.user.web3_wallets.map(candidate => candidate.id)).toEqual(['saved_solana']);
      expect(creation.requests).toHaveLength(0);
      creation.release();
    } finally {
      window.removeEventListener('wallet-standard:app-ready', onAppReady);
      unregister.forEach(remove => remove());
    }
  });
});
