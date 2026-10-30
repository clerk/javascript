import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { deferred } from '../../../../__tests__/async';
import { serveFapi } from '../../../../__tests__/feature/fake-fapi';
import { openMenu } from '../../../../__tests__/feature/menu';
import { renderWithClerk } from '../../../../__tests__/feature/render';
import { UserProfileWeb3WalletsSection } from '../user-profile-web3-wallets-section';
import { signedInWallets } from './user-profile-web3-wallets.fixtures';

const request = vi.fn<(params: { method: string }) => Promise<string | string[]>>();
const provider = { request };
const announceOKX = () =>
  window.dispatchEvent(
    new CustomEvent('eip6963:announceProvider', {
      detail: { info: { name: 'OKX Wallet', uuid: 'recovery-okx', icon: '', rdns: 'com.okx.wallet' }, provider },
    }),
  );

afterEach(() => window.removeEventListener('eip6963:requestProvider', announceOKX));

describe.each([
  ['Base', 'web3_base_signature', '@base-org/account'],
  ['Coinbase Wallet', 'web3_coinbase_wallet_signature', '@coinbase/wallet-sdk'],
  ['OKX Wallet', 'web3_okx_wallet_signature', null],
] as const)('%s recovery', (name, strategy, moduleName) => {
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
            createBaseAccountSDK: () => ({ getProvider: () => provider }),
            createCoinbaseWalletSDK: () => ({ getProvider: () => provider }),
          });
        },
      },
    });
    if (moduleName === null) {
      window.addEventListener('eip6963:requestProvider', announceOKX);
      announceOKX();
    }
    return { fapi, view, user: userEvent.setup() };
  }

  it.each(['eth_requestAccounts', 'personal_sign'] as const)(
    'recovers from cancellation during %s and verifies on retry',
    async method => {
      request.mockImplementation(({ method: requested }) => {
        if (requested === method) {
          return Promise.reject(Object.assign(new Error('User rejected the request.'), { code: 4001 }));
        }
        return Promise.resolve(['0x1234567890abcdef']);
      });
      const { fapi, user } = await setup();
      await user.click(await screen.findByRole('button', { name: `Connect ${name}` }));
      await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent('Wallet connection was cancelled. Please try again.'),
      );
      request.mockImplementation(({ method: requested }) =>
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
    request.mockRejectedValue({ code: -32002 });
    const { user } = await setup();
    await user.click(await screen.findByRole('button', { name: `Connect ${name}` }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'A request is already pending in your wallet. Open your wallet to complete or reject it, then try again.',
      ),
    );
    expect(screen.getByRole('button', { name: `Connect ${name}` })).toBeEnabled();
  });

  it.each([
    ['eth_requestAccounts', 'resolve'],
    ['eth_requestAccounts', 'reject'],
    ['personal_sign', 'resolve'],
    ['personal_sign', 'reject'],
  ] as const)('ignores abandoned %s %s after reopening and completes the new attempt', async (method, outcome) => {
    const old = deferred<string | string[]>();
    const next = deferred<string | string[]>();
    request.mockImplementation(async ({ method: requested }) =>
      requested === method ? old.promise : ['0x1234567890abcdef'],
    );
    const { fapi, view, user } = await setup();
    await user.click(await screen.findByRole('button', { name: `Connect ${name}` }));
    await waitFor(() => expect(request).toHaveBeenCalledWith(expect.objectContaining({ method })));
    view.rerender(<div />);
    view.rerender(<UserProfileWeb3WalletsSection />);
    request.mockImplementation(async ({ method: requested }) => {
      if (requested === method) {
        return next.promise;
      }
      return requested === 'personal_sign' ? 'signature' : ['0x1234567890abcdef'];
    });
    if (method === 'personal_sign') {
      await openMenu(user, await screen.findByRole('button', { name: `Manage ${name}` }));
      await user.click(screen.getByRole('menuitem', { name: 'Verify' }));
    } else {
      await user.click(await screen.findByRole('button', { name: `Connect ${name}` }));
    }
    await waitFor(() => expect(request.mock.calls.filter(([params]) => params.method === method)).toHaveLength(2));
    await act(() => {
      if (outcome === 'resolve') {
        old.resolve(method === 'personal_sign' ? 'old-signature' : ['0xold']);
      } else {
        old.reject({ code: 4001 });
      }
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(fapi.client.sessions[0]?.user.web3_wallets).toHaveLength(method === 'personal_sign' ? 1 : 0);
    expect(fapi.client.sessions[0]?.user.web3_wallets[0]?.verification?.status).not.toBe('verified');
    expect(
      screen.getByRole('button', { name: `${method === 'personal_sign' ? 'Manage' : 'Connect'} ${name}` }),
    ).toHaveAttribute('aria-disabled', 'true');
    await act(() => next.resolve(method === 'personal_sign' ? 'signature' : ['0x1234567890abcdef']));
    await waitFor(() => expect(fapi.client.sessions[0]?.user.web3_wallets[0]?.verification?.status).toBe('verified'));
    expect(fapi.client.sessions[0]?.user.web3_wallets).toHaveLength(1);
  });
});
