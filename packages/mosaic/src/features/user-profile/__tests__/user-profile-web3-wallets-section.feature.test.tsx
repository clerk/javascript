import type { UserJSON } from '@clerk/shared/types';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { WindowAppReadyEventAPI } from '@wallet-standard/core';
import { afterEach, describe, expect, it, vi } from 'vitest';

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
import { MosaicProvider } from '../../../mosaic-provider';
import { UserProfileWeb3WalletsSection } from '../user-profile-web3-wallets-section/user-profile-web3-wallets-section';

describe('Web3 wallets', () => {
  afterEach(() => vi.unstubAllGlobals());

  function web3Environment() {
    const base = fapiEnvironment();
    return fapiEnvironment({
      user_settings: {
        attributes: {
          ...base.user_settings.attributes,
          web3_wallet: {
            ...base.user_settings.attributes.web3_wallet,
            enabled: true,
            used_for_first_factor: true,
            first_factors: ['web3_metamask_signature', 'web3_solana_signature'],
          },
        },
      },
    });
  }

  async function renderWeb3(overrides: Partial<UserJSON> = {}) {
    const user = fapiUser({ id: 'user_1', ...overrides });
    const fapi = serveFapi({
      environment: web3Environment(),
      client: fapiClient([fapiSession({ id: 'sess_1', user })]),
    });
    await renderWithClerk(<UserProfileWeb3WalletsSection />);
    return fapi;
  }

  it('shows a saved wallet from the signed-in Clerk user', async () => {
    await renderWeb3({ web3_wallets: [fapiWeb3Wallet({ id: 'wallet_1', web3_wallet: '0x1234567890abcdef' })] });

    expect(await screen.findByText('Web3 wallets')).toBeInTheDocument();
    expect(screen.getByText('0x1234...cdef')).toBeInTheDocument();
  });

  it.each(['verified', 'unverified'] as const)(
    'warns about sign-in loss only when removing a verified admin wallet (%s)',
    async status => {
      const address = '0x1234567890abcdef1234567890abcdef12345678';
      await renderWeb3({
        web3_wallets: [
          fapiWeb3Wallet({
            id: 'admin_wallet',
            web3_wallet: address,
            verification: fapiVerification('admin', { status }),
          }),
        ],
      });
      const user = userEvent.setup();
      expect(screen.getByText('0x1234...5678')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: `Manage ${address}` }));
      await user.click(screen.getByRole('menuitem', { name: 'Remove wallet' }));
      const warning = 'You will no longer be able to sign in using this web3 wallet.';
      if (status === 'verified') {
        expect(screen.getByRole('alertdialog')).toHaveTextContent(warning);
      } else {
        expect(screen.getByRole('alertdialog')).not.toHaveTextContent(warning);
      }
    },
  );

  it('keeps an unverified wallet available to connect without offering to make it primary', async () => {
    await renderWeb3({
      web3_wallets: [
        fapiWeb3Wallet({
          id: 'wallet_1',
          web3_wallet: '0x1234567890abcdef',
          verification: fapiVerification('web3_metamask_signature', { status: 'unverified' }),
        }),
      ],
    });
    expect(screen.getByText('Unverified')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Connect MetaMask' })).toBeEnabled();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Manage MetaMask' }));
    expect(screen.getByRole('menuitem', { name: 'Remove wallet' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Set as primary' })).toBeNull();
  });

  it('hides existing wallets when Web3 is disabled in the Clerk environment', async () => {
    const user = fapiUser({
      id: 'user_1',
      web3_wallets: [fapiWeb3Wallet({ id: 'wallet_1', web3_wallet: '0x1234567890abcdef' })],
    });
    serveFapi({ client: fapiClient([fapiSession({ id: 'sess_1', user })]) });
    await renderWithClerk(<UserProfileWeb3WalletsSection />);

    expect(screen.queryByText('Web3 wallets')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Connect MetaMask' })).not.toBeInTheDocument();
  });

  it('creates and verifies a MetaMask wallet through Clerk and the injected provider', async () => {
    const request = vi.fn(({ method }: { method: string }) => {
      if (method === 'eth_requestAccounts') {
        return Promise.resolve(['0x1234567890abcdef']);
      }
      if (method === 'personal_sign') {
        return Promise.resolve('signature');
      }
      throw new Error(`Unexpected wallet method: ${method}`);
    });
    vi.stubGlobal('ethereum', { request });
    const fapi = await renderWeb3();

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Connect MetaMask' }));

    await waitFor(() => expect(fapi.client.sessions[0]?.user.web3_wallets[0]?.verification?.status).toBe('verified'));
    expect(request).toHaveBeenCalledWith({ method: 'eth_requestAccounts' });
    expect(request).toHaveBeenCalledWith({ method: 'personal_sign', params: expect.any(Array) });
    expect(await screen.findByRole('button', { name: 'Manage MetaMask' })).toBeInTheDocument();
  });

  it('shows a localized fallback when the wallet provider rejects without a message', async () => {
    vi.stubGlobal('ethereum', { request: vi.fn(() => Promise.reject(new Error(''))) });
    serveFapi({
      environment: web3Environment(),
      client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]),
    });
    await renderWithClerk(
      <MosaicProvider
        localization={{ messages: { userProfileWeb3Wallets: { errors: { generic: 'Connexion impossible.' } } } }}
      >
        <UserProfileWeb3WalletsSection />
      </MosaicProvider>,
    );

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Connect MetaMask' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Connexion impossible.'));
  });

  it('uses the canonical API-code translation for a wallet connection failure', async () => {
    vi.stubGlobal('ethereum', { request: vi.fn(() => Promise.resolve(['0x1234567890abcdef'])) });
    serveFapi({
      environment: web3Environment(),
      client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]),
    });
    await renderWithClerk(
      <MosaicProvider
        localization={{ overrides: { 'errors.verification_invalid_strategy': 'Ce portefeuille est indisponible.' } }}
      >
        <UserProfileWeb3WalletsSection />
      </MosaicProvider>,
    );
    const creation = holdRequests('post', '/v1/me/web3_wallets');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Connect MetaMask' }));
    await waitFor(() => expect(creation.requests).toHaveLength(1));
    creation.fail('verification_invalid_strategy', 'Server copy');

    expect(await screen.findByRole('alert')).toHaveTextContent('Ce portefeuille est indisponible.');
    expect(screen.queryByText('Server copy')).toBeNull();
  });

  it.each(['switch', 'sign out'] as const)(
    'aborts wallet creation after %s during the provider prompt',
    async change => {
      const accountRequest = Promise.withResolvers<string[]>();
      const request = vi.fn(() => accountRequest.promise);
      vi.stubGlobal('ethereum', { request });
      serveFapi({
        environment: web3Environment(),
        client: fapiClient([
          fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) }),
          fapiSession({ id: 'sess_2', user: fapiUser({ id: 'user_2' }) }),
        ]),
      });
      const { clerk } = await renderWithClerk(<UserProfileWeb3WalletsSection />);
      const original = clerk.user;
      if (!original) {
        throw new Error('Expected signed-in user');
      }
      const create = vi.spyOn(original, 'createWeb3Wallet');
      await userEvent.setup().click(screen.getByRole('button', { name: 'Connect MetaMask' }));
      await waitFor(() => expect(request).toHaveBeenCalledOnce());
      await act(() => (change === 'switch' ? clerk.setActive({ session: 'sess_2' }) : clerk.signOut()));
      expect(clerk.user?.id).toBe(change === 'switch' ? 'user_2' : undefined);
      if (change === 'switch') {
        expect.soft(screen.getByRole('button', { name: 'Connect MetaMask' })).toBeEnabled();
      }

      await act(async () => {
        accountRequest.resolve(['0x1234567890abcdef']);
        await accountRequest.promise;
      });

      expect(create).not.toHaveBeenCalled();
      if (change === 'switch') {
        expect(screen.getByRole('button', { name: 'Connect MetaMask' })).toBeEnabled();
        expect(screen.queryByRole('alert')).toBeNull();
      }
    },
  );

  it('clears the previous user’s provider error and open wallet picker on session change', async () => {
    vi.stubGlobal('ethereum', { request: vi.fn(() => Promise.reject(new Error('First user wallet failure'))) });
    serveFapi({
      environment: web3Environment(),
      client: fapiClient([
        fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) }),
        fapiSession({ id: 'sess_2', user: fapiUser({ id: 'user_2' }) }),
      ]),
    });
    const { clerk } = await renderWithClerk(<UserProfileWeb3WalletsSection />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Connect MetaMask' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Connect Solana' }));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeVisible());

    await act(() => clerk.setActive({ session: 'sess_2' }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByRole('button', { name: 'Connect MetaMask' })).toBeEnabled();
  });

  it('holds one provider pending and allows a manual retry after an API error', async () => {
    vi.stubGlobal('ethereum', {
      request: vi.fn(({ method }: { method: string }) =>
        Promise.resolve(method === 'personal_sign' ? 'signature' : ['0x1234567890abcdef']),
      ),
    });
    const fapi = await renderWeb3();
    const hold = holdRequests('post', '/v1/me/web3_wallets');
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Connect MetaMask' }));
    await waitFor(() => expect(hold.requests).toHaveLength(1));
    expect(screen.getByRole('button', { name: 'Connect MetaMask' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Connect Solana' })).toBeDisabled();

    hold.fail('wallet_creation_failed');
    expect(await screen.findByRole('alert')).toHaveTextContent('wallet_creation_failed');
    expect(screen.getByRole('button', { name: 'Connect MetaMask' })).toBeEnabled();
    const retryFapi = serveFapi(fapi);
    await user.click(screen.getByRole('button', { name: 'Connect MetaMask' }));
    await waitFor(() =>
      expect(retryFapi.client.sessions[0]?.user.web3_wallets[0]?.verification?.status).toBe('verified'),
    );
    expect(await screen.findByRole('button', { name: 'Manage MetaMask' })).toBeInTheDocument();
  });

  it('sets a verified wallet as primary through Clerk', async () => {
    const fapi = await renderWeb3({
      web3_wallets: [
        fapiWeb3Wallet({ id: 'wallet_1', web3_wallet: '0x1234567890abcdef' }),
        fapiWeb3Wallet({ id: 'wallet_2', web3_wallet: '0xabcdef1234567890' }),
      ],
      primary_web3_wallet_id: 'wallet_1',
    });
    const user = userEvent.setup();

    await waitFor(() => expect(screen.getAllByRole('button', { name: 'Manage MetaMask' })).toHaveLength(2));
    await user.click(screen.getAllByRole('button', { name: 'Manage MetaMask' })[0]);
    expect(screen.queryByRole('menuitem', { name: 'Set as primary' })).toBeNull();
    await user.keyboard('{Escape}');
    await user.click(screen.getAllByRole('button', { name: 'Manage MetaMask' })[1]);
    await user.click(screen.getByRole('menuitem', { name: 'Set as primary' }));

    await waitFor(() => expect(fapi.client.sessions[0]?.user.primary_web3_wallet_id).toBe('wallet_2'));
    const selectedRow = screen.getByTitle('0xabcdef1234567890').closest<HTMLElement>('.cl-section-row');
    expect(selectedRow).not.toBeNull();
    if (selectedRow) {
      expect(within(selectedRow).getByText('Primary')).toBeInTheDocument();
    }
  });

  it('shows a primary update failure on the row and allows another attempt', async () => {
    const fapi = await renderWeb3({
      web3_wallets: [fapiWeb3Wallet({ id: 'wallet_1', web3_wallet: '0x1234567890abcdef' })],
    });
    const hold = holdRequests('post', '/v1/me');
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Manage MetaMask' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as primary' }));
    await waitFor(() => expect(hold.requests).toHaveLength(1));
    expect(screen.getByRole('button', { name: 'Manage MetaMask' })).toBeDisabled();
    hold.fail('primary_update_failed');

    expect(await screen.findByRole('alert')).toHaveTextContent('primary_update_failed');
    expect(screen.queryByText('Cannot verify your account')).not.toBeInTheDocument();
    const retryFapi = serveFapi(fapi);
    await user.click(screen.getByRole('button', { name: 'Manage MetaMask' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as primary' }));
    await waitFor(() => expect(retryFapi.client.sessions[0]?.user.primary_web3_wallet_id).toBe('wallet_1'));
    expect(screen.getByText('Primary')).toBeInTheDocument();
  });

  it('confirms removal and focuses Connect after deleting the last wallet', async () => {
    const fapi = await renderWeb3({
      web3_wallets: [fapiWeb3Wallet({ id: 'wallet_1', web3_wallet: '0x1234567890abcdef' })],
    });
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Manage MetaMask' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove wallet' }));
    expect(screen.getByRole('alertdialog')).toHaveTextContent('0x1234...cdef');
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));

    await waitFor(() => expect(fapi.client.sessions[0]?.user.web3_wallets).toHaveLength(0));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Connect MetaMask' })).toHaveFocus());
  });

  it('keeps a failed wallet removal in its confirmation for a manual retry', async () => {
    const fapi = await renderWeb3({
      web3_wallets: [fapiWeb3Wallet({ id: 'wallet_1', web3_wallet: '0x1234567890abcdef' })],
    });
    const hold = holdRequests('post', '/v1/me/web3_wallets/:id');
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Manage MetaMask' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove wallet' }));
    const confirm = within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' });
    await user.click(confirm);
    await waitFor(() => expect(hold.requests).toHaveLength(1));
    expect(confirm).toHaveAttribute('aria-busy', 'true');
    hold.fail('wallet_removal_failed');

    expect(await within(screen.getByRole('alertdialog')).findByRole('alert')).toHaveTextContent(
      'wallet_removal_failed',
    );
    await waitFor(() => expect(confirm).not.toHaveAttribute('aria-busy', 'true'));
    const retryFapi = serveFapi(fapi);
    await user.click(confirm);
    await waitFor(() => expect(retryFapi.client.sessions[0]?.user.web3_wallets).toHaveLength(0));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  it('cancels removal, then removes the newly selected wallet and focuses the remaining row', async () => {
    const fapi = await renderWeb3({
      web3_wallets: [
        fapiWeb3Wallet({ id: 'wallet_1', web3_wallet: '0x1234567890abcdef' }),
        fapiWeb3Wallet({ id: 'wallet_2', web3_wallet: '0xabcdef1234567890' }),
      ],
    });
    const user = userEvent.setup();
    const first = screen.getAllByRole('button', { name: 'Manage MetaMask' })[0];
    first.focus();
    await user.keyboard('{Enter}');
    await user.click(screen.getByRole('menuitem', { name: 'Remove wallet' }));
    await user.keyboard('{Escape}');
    await waitFor(() => expect(first).toHaveFocus());
    expect(fapi.client.sessions[0]?.user.web3_wallets).toHaveLength(2);
    await user.click(screen.getAllByRole('button', { name: 'Manage MetaMask' })[1]);
    await user.click(screen.getByRole('menuitem', { name: 'Remove wallet' }));
    expect(screen.getByRole('alertdialog')).toHaveTextContent('0xabcd...7890');
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(fapi.client.sessions[0]?.user.web3_wallets.map(wallet => wallet.id)).toEqual(['wallet_1']);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Manage MetaMask' })).toHaveFocus());
  });

  it('shows only eligible Solana wallets and refreshes when wallets register or unregister', async () => {
    const wallet = {
      version: '1.0.0' as const,
      name: 'Eligible Solana',
      icon: 'data:image/svg+xml;base64,' as const,
      chains: ['solana:mainnet' as const],
      accounts: [],
      features: {
        'standard:connect': { version: '1.0.0' as const, connect: () => Promise.resolve({ accounts: [] }) },
        'solana:signMessage': { version: '1.0.0' as const, signMessage: () => Promise.resolve([]) },
      },
    };
    const registries: WindowAppReadyEventAPI[] = [];
    const unregister: Array<() => void> = [];
    const register = (api: WindowAppReadyEventAPI) => {
      registries.push(api);
      unregister.push(
        api.register(
          {
            ...wallet,
            name: 'Cannot connect',
            features: { 'solana:signMessage': wallet.features['solana:signMessage'] },
          },
          { ...wallet, name: 'Cannot sign', features: { 'standard:connect': wallet.features['standard:connect'] } },
          { ...wallet, name: 'Wrong chain', chains: ['ethereum:mainnet'] },
        ),
      );
    };
    const onAppReady = (event: Event & { detail?: WindowAppReadyEventAPI }) => {
      if (event.detail) {
        register(event.detail);
      }
    };
    window.addEventListener('wallet-standard:app-ready', onAppReady);
    window.dispatchEvent(new CustomEvent('wallet-standard:register-wallet', { detail: register }));
    let unregisterEligible: Array<() => void> = [];
    try {
      await renderWeb3();
      await userEvent.setup().click(screen.getByRole('button', { name: 'Connect Solana' }));
      expect(screen.queryByRole('button', { name: 'Cannot connect' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Cannot sign' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Wrong chain' })).toBeNull();
      expect(screen.getByText('No Solana wallets are available.')).toBeInTheDocument();

      act(() => {
        unregisterEligible = registries.map(api => api.register(wallet));
      });
      expect(await screen.findByRole('button', { name: 'Eligible Solana' })).toBeEnabled();
      act(() => unregisterEligible.forEach(remove => remove()));
      await waitFor(() => expect(screen.queryByRole('button', { name: 'Eligible Solana' })).toBeNull());
      expect(screen.getByText('No Solana wallets are available.')).toBeInTheDocument();
    } finally {
      window.removeEventListener('wallet-standard:app-ready', onAppReady);
      unregister.forEach(remove => remove());
      unregisterEligible.forEach(remove => remove());
    }
  });

  it('connects the chosen Solana wallet and verifies it through Clerk', async () => {
    const account = {
      address: 'SolanaAddress123',
      publicKey: new Uint8Array([1, 2, 3]),
      chains: ['solana:mainnet' as const],
      features: ['solana:signMessage' as const],
    };
    const connect = vi.fn(() => Promise.resolve({ accounts: [account] }));
    const signMessage = vi.fn(() => Promise.resolve([{ signature: new Uint8Array([4, 5, 6]) }]));
    const wallet = {
      version: '1.0.0' as const,
      name: 'Test Solana',
      icon: 'data:image/svg+xml;base64,' as const,
      chains: ['solana:mainnet' as const],
      accounts: [account],
      features: {
        'standard:connect': { version: '1.0.0' as const, connect },
        'solana:signMessage': { version: '1.0.0' as const, signMessage },
      },
    };
    const secondAccount = { ...account, address: 'SecondSolanaAddress456' };
    const secondConnect = vi.fn(() => Promise.resolve({ accounts: [secondAccount] }));
    const secondSignMessage = vi.fn(() => Promise.resolve([{ signature: new Uint8Array([7, 8, 9]) }]));
    const secondWallet = {
      ...wallet,
      name: 'Second Solana',
      accounts: [secondAccount],
      features: {
        'standard:connect': { version: '1.0.0' as const, connect: secondConnect },
        'solana:signMessage': { version: '1.0.0' as const, signMessage: secondSignMessage },
      },
    };
    const unregister: Array<() => void> = [];
    const register = (api: WindowAppReadyEventAPI) => unregister.push(api.register(wallet), api.register(secondWallet));
    const onAppReady = (event: Event & { detail?: WindowAppReadyEventAPI }) => {
      if (event.detail) {
        register(event.detail);
      }
    };
    window.addEventListener('wallet-standard:app-ready', onAppReady);
    window.dispatchEvent(new CustomEvent('wallet-standard:register-wallet', { detail: register }));
    try {
      const fapi = await renderWeb3();
      const user = userEvent.setup();

      await user.click(await screen.findByRole('button', { name: 'Connect Solana' }));
      await user.click(screen.getByRole('button', { name: 'Close' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      await user.click(screen.getByRole('button', { name: 'Connect Solana' }));
      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      await user.click(screen.getByRole('button', { name: 'Connect Solana' }));
      const creation = holdRequests('post', '/v1/me/web3_wallets');
      await user.click(screen.getByRole('button', { name: 'Second Solana' }));
      await waitFor(() => expect(creation.requests).toHaveLength(1));
      expect(screen.getByRole('button', { name: 'Second Solana' })).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByRole('button', { name: 'Second Solana' })).toHaveFocus();
      expect(screen.getByRole('button', { name: 'Test Solana' })).toBeDisabled();
      await user.keyboard('{Escape}');
      expect(screen.getByRole('dialog')).toBeVisible();
      creation.fail('wallet_creation_failed');
      expect(await within(screen.getByRole('dialog')).findByRole('alert')).toHaveTextContent('wallet_creation_failed');
      expect(screen.getAllByRole('alert', { hidden: true })).toHaveLength(1);
      const retryFapi = serveFapi(fapi);
      await user.click(screen.getByRole('button', { name: 'Second Solana' }));
      await waitFor(() =>
        expect(retryFapi.client.sessions[0]?.user.web3_wallets[0]?.verification?.status).toBe('verified'),
      );
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(retryFapi.client.sessions[0]?.user.web3_wallets[0]?.web3_wallet).toBe('SecondSolanaAddress456');
      expect(connect).not.toHaveBeenCalled();
      expect(signMessage).not.toHaveBeenCalled();
      expect(secondConnect).toHaveBeenCalledTimes(2);
      expect(secondSignMessage).toHaveBeenCalledOnce();
      expect(await screen.findByRole('button', { name: 'Manage Solana' })).toBeInTheDocument();
    } finally {
      window.removeEventListener('wallet-standard:app-ready', onAppReady);
      unregister.forEach(remove => remove());
    }
  });
  // TODO: Add session reverification for wallet connection, primary updates, and removal;
  // surface API errors until then.
});
