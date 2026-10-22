import type { UserJSON, Web3Strategy } from '@clerk/shared/types';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { deferred } from '../../../../__tests__/async';
import { demandReverificationOnce, holdRequests, serveFapi } from '../../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEnvironment,
  fapiSession,
  fapiUser,
  fapiVerification,
  fapiWeb3Wallet,
} from '../../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../../__tests__/feature/render';
import { UserProfileWeb3WalletsSection } from '../user-profile-web3-wallets-section';

async function renderWallets(wallets: UserJSON['web3_wallets'] = []) {
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
            first_factors: ['web3_metamask_signature', 'web3_coinbase_wallet_signature'],
          },
        },
      },
    }),
    client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1', web3_wallets: wallets }) })]),
    verification: { secrets: { password: 'hunter2' } },
  });
  return { fapi, ...(await renderWithClerk(<UserProfileWeb3WalletsSection />)) };
}

function savedWallet(id: string, address: string, strategy: Web3Strategy = 'web3_metamask_signature') {
  return fapiWeb3Wallet({
    id,
    web3_wallet: address,
    verification: fapiVerification(strategy, { status: 'unverified' }),
  });
}

describe('Web3 wallet selection races', () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each(['matching', 'null strategy', 'unrelated'] as const)(
    'handles a %s saved wallet published during account selection',
    async kind => {
      const selection = deferred<string[]>();
      const request = vi.fn(({ method }: { method: string }) =>
        method === 'eth_requestAccounts' ? selection.promise : Promise.resolve('signature'),
      );
      vi.stubGlobal('ethereum', { request });
      const { clerk, fapi } = await renderWallets();
      const creation = holdRequests('post', '/v1/me/web3_wallets');
      await userEvent.setup().click(screen.getByRole('button', { name: 'Connect MetaMask' }));
      await waitFor(() => expect(request).toHaveBeenCalledWith({ method: 'eth_requestAccounts' }));
      const session = fapi.client.sessions[0];
      if (!session || !clerk.user) {
        throw new Error('Missing user');
      }
      session.user.web3_wallets = [savedWallet('published_wallet', kind === 'unrelated' ? '0x1234' : '0xAbCd')];
      if (kind === 'null strategy' && session.user.web3_wallets[0]?.verification) {
        session.user.web3_wallets[0].verification.strategy = null;
      }
      await act(() => clerk.user?.reload());
      if (kind !== 'null strategy') {
        expect(screen.queryByRole('button', { name: 'Connect MetaMask' })).toBeNull();
      }
      selection.resolve(['0xabcd']);
      if (kind !== 'unrelated') {
        await waitFor(() =>
          expect(fapi.client.sessions[0]?.user.web3_wallets[0]?.verification?.status).toBe('verified'),
        );
      } else {
        await waitFor(() => expect(screen.getByRole('button', { name: 'Verify MetaMask' })).toBeEnabled());
        await waitFor(() =>
          expect(screen.getByRole('alert')).toHaveTextContent('This wallet provider is unavailable.'),
        );
        expect(request).toHaveBeenCalledTimes(1);
        expect(fapi.client.sessions[0]?.user.web3_wallets[0]?.verification?.status).toBe('unverified');
      }
      expect(fapi.client.sessions[0]?.user.web3_wallets.map(wallet => wallet.id)).toEqual(['published_wallet']);
      expect(creation.requests).toHaveLength(0);
      creation.release();
    },
  );

  it('verifies the selected saved resource among multiple wallets and providers sharing an address', async () => {
    const request = vi.fn(({ method }: { method: string }) =>
      Promise.resolve(method === 'eth_requestAccounts' ? ['0xAbCd'] : 'signature'),
    );
    vi.stubGlobal('ethereum', { request });
    const { fapi } = await renderWallets([
      savedWallet('first', '0x1234'),
      savedWallet('target', '0xabcd'),
      savedWallet('coinbase', '0xABCD', 'web3_coinbase_wallet_signature'),
    ]);
    const creation = holdRequests('post', '/v1/me/web3_wallets');
    await userEvent.setup().click(screen.getAllByRole('button', { name: 'Verify MetaMask' })[1]);
    await waitFor(() =>
      expect(
        fapi.client.sessions[0]?.user.web3_wallets.find(wallet => wallet.id === 'target')?.verification?.status,
      ).toBe('verified'),
    );
    expect(
      fapi.client.sessions[0]?.user.web3_wallets
        .filter(wallet => wallet.verification?.status === 'unverified')
        .map(wallet => wallet.id),
    ).toEqual(['first', 'coinbase']);
    expect(creation.requests).toHaveLength(0);
    creation.release();
  });

  it('returns focus to the saved row after creation reverification and retries the rejected signature', async () => {
    const signature = deferred<string>();
    const request = vi.fn(({ method }: { method: string }) =>
      method === 'eth_requestAccounts' ? Promise.resolve(['0xabcd']) : signature.promise,
    );
    vi.stubGlobal('ethereum', { request });
    const { fapi } = await renderWallets();
    demandReverificationOnce('/v1/me/web3_wallets');
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Connect MetaMask' }));
    await waitFor(() => expect(screen.getByLabelText('Password')).toHaveFocus());
    await user.keyboard('hunter2{Enter}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(screen.getByRole('button', { name: 'Verify MetaMask' })).toHaveFocus());
    signature.reject(new Error('User rejected the request.'));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong. Please try again.'));
    request.mockImplementation(({ method }) =>
      Promise.resolve(method === 'eth_requestAccounts' ? ['0xabcd'] : 'signature'),
    );
    const creation = holdRequests('post', '/v1/me/web3_wallets');
    await user.click(screen.getByRole('button', { name: 'Verify MetaMask' }));
    await waitFor(() => expect(fapi.client.sessions[0]?.user.web3_wallets[0]?.verification?.status).toBe('verified'));
    expect(fapi.client.sessions[0]?.user.web3_wallets).toHaveLength(1);
    expect(creation.requests).toHaveLength(0);
    creation.release();
  });
});
