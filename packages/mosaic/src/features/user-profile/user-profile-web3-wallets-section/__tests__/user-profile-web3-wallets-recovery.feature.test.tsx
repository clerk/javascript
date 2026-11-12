import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { deferred } from '../../../../__tests__/async';
import { serveFapi } from '../../../../__tests__/feature/fake-fapi';
import { openMenu } from '../../../../__tests__/feature/menu';
import { renderWithClerk } from '../../../../__tests__/feature/render';
import { UserProfileWeb3WalletsSection } from '../user-profile-web3-wallets-section';
import { registerWallets, signedInWallets } from './user-profile-web3-wallets.fixtures';

describe('MetaMask cancellation and pending requests', () => {
  it('handles cancellation in MetaMask without offering a Clerk cancel button and allows a fresh connection', async () => {
    const accounts = deferred<string[]>();
    const request = vi.fn(({ method }: { method: string }) =>
      method === 'personal_sign' ? Promise.resolve('signature') : accounts.promise,
    );
    vi.stubGlobal('ethereum', { request });
    const fapi = serveFapi(signedInWallets(['web3_metamask_signature', 'web3_solana_signature']));
    await renderWithClerk(<UserProfileWeb3WalletsSection />);
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Connect MetaMask' }));
    await waitFor(() => expect(request).toHaveBeenCalledWith({ method: 'eth_requestAccounts' }));
    expect(screen.getByRole('button', { name: 'Connect MetaMask' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Connect Solana' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    await act(() => accounts.reject({ code: 4001, message: 'User rejected the request.' }));

    expect(screen.getByRole('button', { name: 'Connect MetaMask' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Connect Solana' })).toBeEnabled();
    expect(screen.getByRole('alert')).toHaveTextContent('The wallet request was cancelled. Please try again.');
    expect(fapi.client.sessions[0]?.user.web3_wallets).toHaveLength(0);
    expect(request).not.toHaveBeenCalledWith(expect.objectContaining({ method: 'personal_sign' }));

    request.mockImplementation(({ method }) =>
      Promise.resolve(method === 'personal_sign' ? 'signature' : ['0xabcdef1234567890']),
    );
    await user.click(screen.getByRole('button', { name: 'Connect MetaMask' }));
    await waitFor(() => expect(fapi.client.sessions[0]?.user.web3_wallets[0]?.verification?.status).toBe('verified'));
    expect(fapi.client.sessions[0]?.user.web3_wallets).toHaveLength(1);
    expect(fapi.client.sessions[0]?.user.web3_wallets[0]?.web3_wallet).toBe('0xabcdef1234567890');
  });

  it('explains that an existing MetaMask request needs attention in the wallet', async () => {
    vi.stubGlobal('ethereum', { request: vi.fn().mockRejectedValue({ code: -32002 }) });
    serveFapi(signedInWallets(['web3_metamask_signature']));
    await renderWithClerk(<UserProfileWeb3WalletsSection />);
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Connect MetaMask' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Your wallet has an earlier request waiting. Open your wallet, reject that request, then try again.',
      ),
    );
    expect(screen.getByRole('button', { name: 'Connect MetaMask' })).toBeEnabled();
  });

  it('completes an abandoned MetaMask request approved after the section closed', async () => {
    const abandoned = deferred<string[]>();
    const request = vi.fn(({ method }: { method: string }) =>
      method === 'eth_requestAccounts' ? abandoned.promise : Promise.resolve('signature'),
    );
    vi.stubGlobal('ethereum', { request });
    const fapi = serveFapi(signedInWallets(['web3_metamask_signature']));
    const view = await renderWithClerk(<UserProfileWeb3WalletsSection />);

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Connect MetaMask' }));
    await waitFor(() => expect(request).toHaveBeenCalledWith({ method: 'eth_requestAccounts' }));
    view.rerender(<div />);
    await act(() => abandoned.resolve(['0xabandoned']));

    await waitFor(() => expect(fapi.client.sessions[0]?.user.web3_wallets[0]?.verification?.status).toBe('verified'));
    expect(fapi.client.sessions[0]?.user.web3_wallets.map(wallet => wallet.web3_wallet)).toEqual(['0xabandoned']);
    view.rerender(<UserProfileWeb3WalletsSection />);
    expect(await screen.findByRole('button', { name: 'Manage MetaMask' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Connect MetaMask' })).toBeNull();
  });
});

const evmRequest = vi.fn<(params: { method: string }) => Promise<string | string[]>>();
const evmProvider = { request: evmRequest };
const announceOKX = () =>
  window.dispatchEvent(
    new CustomEvent('eip6963:announceProvider', {
      detail: {
        info: { name: 'OKX Wallet', uuid: 'recovery-okx', icon: '', rdns: 'com.okx.wallet' },
        provider: evmProvider,
      },
    }),
  );

describe.each([
  ['Base', 'web3_base_signature', '@base-org/account'],
  ['Coinbase Wallet', 'web3_coinbase_wallet_signature', '@coinbase/wallet-sdk'],
  ['OKX Wallet', 'web3_okx_wallet_signature', null],
] as const)('%s cancellation and pending requests', (name, strategy, moduleName) => {
  afterEach(() => window.removeEventListener('eip6963:requestProvider', announceOKX));

  async function setup() {
    vi.stubGlobal('ethereum', {
      request: () => {
        throw new Error('The selected wallet must not use the fallback Ethereum provider.');
      },
    });
    const fapi = serveFapi(signedInWallets([strategy]));
    const view = await renderWithClerk(<UserProfileWeb3WalletsSection />);
    Object.defineProperty(view.clerk, '__internal_moduleManager', {
      value: {
        import: (module: string) => {
          expect(module).toBe(moduleName);
          return Promise.resolve({
            createBaseAccountSDK: () => ({ getProvider: () => evmProvider }),
            createCoinbaseWalletSDK: () => ({ getProvider: () => evmProvider }),
          });
        },
      },
    });
    if (moduleName === null) {
      window.addEventListener('eip6963:requestProvider', announceOKX);
      announceOKX();
    }
    return { fapi, user: userEvent.setup() };
  }

  it.each(['eth_requestAccounts', 'personal_sign'] as const)(
    'recovers from cancellation during %s and verifies on retry',
    async method => {
      evmRequest.mockImplementation(({ method: requested }) => {
        if (requested === method) {
          return Promise.reject(Object.assign(new Error('User rejected the request.'), { code: 4001 }));
        }
        return Promise.resolve(['0x1234567890abcdef']);
      });
      const { fapi, user } = await setup();
      await user.click(await screen.findByRole('button', { name: `Connect ${name}` }));
      await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent('The wallet request was cancelled. Please try again.'),
      );
      evmRequest.mockImplementation(({ method: requested }) =>
        Promise.resolve(requested === 'personal_sign' ? 'signature' : ['0x1234567890abcdef']),
      );
      if (method === 'personal_sign') {
        await openMenu(user, screen.getByRole('button', { name: `Manage ${name}` }));
        await user.click(screen.getByRole('menuitem', { name: 'Verify' }));
      } else {
        expect(fapi.client.sessions[0]?.user.web3_wallets).toHaveLength(0);
        await user.click(screen.getByRole('button', { name: `Connect ${name}` }));
      }
      await waitFor(() => expect(fapi.client.sessions[0]?.user.web3_wallets[0]?.verification?.status).toBe('verified'));
      expect(fapi.client.sessions[0]?.user.web3_wallets).toHaveLength(1);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    },
  );

  it('explains a pending provider request and releases its busy state', async () => {
    evmRequest.mockRejectedValue({ code: -32002 });
    const { user } = await setup();
    await user.click(await screen.findByRole('button', { name: `Connect ${name}` }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Your wallet has an earlier request waiting. Open your wallet, reject that request, then try again.',
      ),
    );
    expect(screen.getByRole('button', { name: `Connect ${name}` })).toBeEnabled();
  });
});

describe('Solana cancellation', () => {
  const account = {
    address: 'SolanaRecoveryAccount',
    publicKey: new Uint8Array([1, 2, 3]),
    chains: ['solana:mainnet' as const],
    features: ['solana:signMessage' as const],
  };

  it('explains Solana connection cancellation and connects on retry', async () => {
    const connect = vi
      .fn()
      .mockRejectedValueOnce({ code: 4001 })
      .mockResolvedValue({ accounts: [account] });
    const unregister = registerWallets({
      version: '1.0.0',
      name: 'Recovery Solana',
      icon: 'data:image/svg+xml;base64,',
      chains: ['solana:mainnet'],
      accounts: [account],
      features: {
        'standard:connect': { version: '1.0.0', connect },
        'solana:signMessage': {
          version: '1.0.0',
          signMessage: () => Promise.resolve([{ signature: new Uint8Array([4, 5, 6]) }]),
        },
      },
    });
    try {
      const fapi = serveFapi(signedInWallets(['web3_solana_signature']));
      await renderWithClerk(<UserProfileWeb3WalletsSection />);
      const user = userEvent.setup();
      await user.click(await screen.findByRole('button', { name: 'Connect Solana' }));
      await user.click(await screen.findByRole('button', { name: 'Recovery Solana' }));
      await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent('The wallet request was cancelled. Please try again.'),
      );
      expect(fapi.client.sessions[0]?.user.web3_wallets).toHaveLength(0);
      await user.click(screen.getByRole('button', { name: 'Recovery Solana' }));
      await waitFor(() => expect(fapi.client.sessions[0]?.user.web3_wallets[0]?.verification?.status).toBe('verified'));
      expect(fapi.client.sessions[0]?.user.web3_wallets).toHaveLength(1);
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    } finally {
      unregister();
    }
  });
});
