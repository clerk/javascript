import type { Web3Strategy } from '@clerk/shared/types';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { deferred } from '../../../../__tests__/async';
import { demandReverificationOnce, holdRequests, serveFapi } from '../../../../__tests__/feature/fake-fapi';
import { fapiVerification, type FapiWeb3Wallet, fapiWeb3Wallet } from '../../../../__tests__/feature/fapi';
import { openMenu } from '../../../../__tests__/feature/menu';
import { renderWithClerk } from '../../../../__tests__/feature/render';
import { UserProfileWeb3WalletsSection } from '../user-profile-web3-wallets-section';
import { signedInWallets } from './user-profile-web3-wallets.fixtures';

async function renderWallets(wallets: FapiWeb3Wallet[] = []) {
  const fapi = serveFapi(
    signedInWallets(
      ['web3_metamask_signature', 'web3_coinbase_wallet_signature'],
      { web3_wallets: wallets },
      { verification: { secrets: { password: 'hunter2' } } },
    ),
  );
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
  it.each(['matching', 'no verification', 'unrelated'] as const)(
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
      if (kind === 'no verification' && session.user.web3_wallets[0]) {
        session.user.web3_wallets[0].verification = null;
      }
      await act(() => clerk.user?.reload());
      if (kind !== 'no verification') {
        expect(screen.queryByRole('button', { name: 'Connect MetaMask' })).toBeNull();
      }
      selection.resolve(['0xabcd']);
      if (kind !== 'unrelated') {
        await waitFor(() =>
          expect(fapi.client.sessions[0]?.user.web3_wallets[0]?.verification?.status).toBe('verified'),
        );
      } else {
        await waitFor(() => expect(screen.getByRole('button', { name: 'Manage MetaMask' })).toBeEnabled());
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
    const user = userEvent.setup();
    await openMenu(user, screen.getAllByRole('button', { name: 'Manage MetaMask' })[1]);
    await user.click(screen.getByRole('menuitem', { name: 'Verify' }));
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

  it('blocks removal from the closing menu while verification is pending', async () => {
    const selection = deferred<string[]>();
    const request = vi.fn(() => selection.promise);
    vi.stubGlobal('ethereum', { request });
    const { fapi } = await renderWallets([savedWallet('saved_wallet', '0xabcd')]);
    const user = userEvent.setup();
    await openMenu(user, screen.getByRole('button', { name: 'Manage MetaMask' }));
    const remove = screen.getByRole('menuitem', { name: 'Remove wallet' });
    const popup = remove.closest('.cl-menu-popup');
    if (!(popup instanceof HTMLElement)) {
      throw new Error('Missing menu popup');
    }
    await waitFor(() => expect(popup).not.toHaveAttribute('data-starting-style'));
    await Promise.all(popup.getAnimations().map(animation => animation.finished));
    expect(getComputedStyle(popup).opacity).toBe('1');
    popup.style.setProperty('transition-duration', '10s', 'important');
    await user.click(screen.getByRole('menuitem', { name: 'Verify' }));
    expect(request).toHaveBeenCalledWith({ method: 'eth_requestAccounts' });
    expect(popup).toHaveAttribute('data-ending-style');
    expect(remove).toBeInTheDocument();
    const bounds = remove.getBoundingClientRect();
    const target = document.elementFromPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    if (!(target instanceof HTMLElement)) {
      throw new Error('Missing pointer target');
    }
    await user.click(target);
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(fapi.client.sessions[0]?.user.web3_wallets).toHaveLength(1);
    selection.reject(new Error('User rejected the request.'));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  });

  it.each(['verify', 'connect'] as const)(
    'blocks wallet removal during %s and restores it after settling',
    async action => {
      const selection = deferred<string[]>();
      const signature = deferred<string>();
      const request = vi.fn(({ method }: { method: string }) =>
        method === 'eth_requestAccounts' ? selection.promise : signature.promise,
      );
      vi.stubGlobal('ethereum', { request });
      const wallets = [savedWallet('other_wallet', '0x1234', 'web3_coinbase_wallet_signature')];
      if (action === 'verify') {
        wallets.push(savedWallet('saved_wallet', '0xabcd'));
      }
      const { fapi } = await renderWallets(wallets);
      const user = userEvent.setup();
      if (action === 'verify') {
        await openMenu(user, screen.getByRole('button', { name: 'Manage MetaMask' }));
        await user.click(screen.getByRole('menuitem', { name: 'Verify' }));
      } else {
        await user.click(screen.getByRole('button', { name: 'Connect MetaMask' }));
      }
      await waitFor(() => expect(request).toHaveBeenCalledWith({ method: 'eth_requestAccounts' }));
      await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
      const otherTrigger = screen.getByRole('button', { name: 'Manage Coinbase Wallet' });
      expect(otherTrigger).toHaveAttribute('aria-disabled', 'true');
      await user.click(otherTrigger);
      expect(screen.queryByRole('menu')).toBeNull();

      selection.resolve(['0xabcd']);
      await waitFor(() => expect(request).toHaveBeenCalledWith({ method: 'personal_sign', params: expect.any(Array) }));
      expect(screen.getByText('Verifying')).toBeInTheDocument();
      const pendingWallet = fapi.client.sessions[0]?.user.web3_wallets.find(wallet => wallet.web3_wallet === '0xabcd');
      expect(pendingWallet).toBeDefined();
      for (const trigger of screen.getAllByRole('button', { name: /^Manage / })) {
        expect(trigger).toHaveAttribute('aria-disabled', 'true');
        await user.click(trigger);
        trigger.focus();
        expect(trigger).toHaveFocus();
        await user.keyboard('{Enter} {ArrowDown}');
        await act(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())));
        expect(screen.queryByRole('menu')).toBeNull();
      }
      expect(screen.queryByRole('alertdialog')).toBeNull();
      expect(fapi.client.sessions[0]?.user.web3_wallets).toHaveLength(2);

      if (action === 'verify') {
        signature.resolve('signature');
        await waitFor(() =>
          expect(
            fapi.client.sessions[0]?.user.web3_wallets.find(wallet => wallet.id === pendingWallet?.id)?.verification
              ?.status,
          ).toBe('verified'),
        );
      } else {
        signature.reject(new Error('User rejected the request.'));
        await waitFor(() =>
          expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong. Please try again.'),
        );
        expect(
          fapi.client.sessions[0]?.user.web3_wallets.find(wallet => wallet.id === pendingWallet?.id)?.verification
            ?.status,
        ).toBe('unverified');
      }
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Manage MetaMask' })).not.toHaveAttribute('aria-disabled', 'true'),
      );
      expect(fapi.client.sessions[0]?.user.web3_wallets.map(wallet => wallet.id)).toContain(pendingWallet?.id);
      await openMenu(user, screen.getByRole('button', { name: 'Manage MetaMask' }));
      await user.click(screen.getByRole('menuitem', { name: 'Remove wallet' }));
      await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));
      await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
      expect(fapi.client.sessions[0]?.user.web3_wallets.map(wallet => wallet.id)).toEqual(['other_wallet']);
    },
  );

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
    await waitFor(() => expect(screen.getByRole('button', { name: 'Manage MetaMask' })).toHaveFocus());
    signature.reject(new Error('User rejected the request.'));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong. Please try again.'));
    request.mockImplementation(({ method }) =>
      Promise.resolve(method === 'eth_requestAccounts' ? ['0xabcd'] : 'signature'),
    );
    const creation = holdRequests('post', '/v1/me/web3_wallets');
    await openMenu(user, screen.getByRole('button', { name: 'Manage MetaMask' }));
    await user.click(screen.getByRole('menuitem', { name: 'Verify' }));
    await waitFor(() => expect(fapi.client.sessions[0]?.user.web3_wallets[0]?.verification?.status).toBe('verified'));
    expect(fapi.client.sessions[0]?.user.web3_wallets).toHaveLength(1);
    expect(creation.requests).toHaveLength(0);
    creation.release();
  });
});
