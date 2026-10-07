import type { UserJSON } from '@clerk/shared/types';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { WindowAppReadyEventAPI } from '@wallet-standard/core';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { holdRequests, serveFapi } from '../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEnterpriseAccount,
  fapiEnvironment,
  fapiSession,
  fapiUser,
  fapiVerification,
  fapiWeb3Wallet,
} from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { Dialog } from '../../../components/dialog';
import { MosaicProvider } from '../../../mosaic-provider';
import { UserProfileSolanaWalletView } from '../user-profile-web3-wallets-section/user-profile-solana-wallet.view';
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

  it('shows one saved wallet row with Verify after a fresh mount', async () => {
    const user = fapiUser({
      id: 'user_1',
      web3_wallets: [
        fapiWeb3Wallet({
          id: 'wallet_1',
          web3_wallet: '0x1234567890abcdef',
          verification: fapiVerification('web3_metamask_signature', { status: 'unverified' }),
        }),
      ],
    });
    serveFapi({ environment: web3Environment(), client: fapiClient([fapiSession({ id: 'sess_1', user })]) });
    const view = await renderWithClerk(<UserProfileWeb3WalletsSection />);
    expect(screen.getByText('Unverified')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Verify MetaMask' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Connect MetaMask' })).toBeNull();
    view.rerender(<></>);
    view.rerender(<UserProfileWeb3WalletsSection />);
    expect(screen.getByRole('button', { name: 'Verify MetaMask' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Connect MetaMask' })).toBeNull();
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
    expect(await screen.findByText('Primary')).toBeInTheDocument();
    expect(fapi.client.sessions[0]?.user.primary_web3_wallet_id).toBe(
      fapi.client.sessions[0]?.user.web3_wallets[0]?.id,
    );
  });

  it('verifies the saved Ethereum wallet after signature rejection without creating another', async () => {
    const address = '0xabcdef1234567890';
    let accountRequests = 0;
    let signatureRequests = 0;
    vi.stubGlobal('ethereum', {
      request: vi.fn(({ method }: { method: string }) => {
        if (method === 'eth_requestAccounts') {
          accountRequests += 1;
          return Promise.resolve([accountRequests === 1 ? address : address.toUpperCase().replace('0X', '0x')]);
        }
        if (method === 'personal_sign') {
          signatureRequests += 1;
          return signatureRequests === 1
            ? Promise.reject(new Error('Signature rejected'))
            : Promise.resolve('signature');
        }
        throw new Error(`Unexpected wallet method: ${method}`);
      }),
    });
    const fapi = await renderWeb3();
    const creation = holdRequests('post', '/v1/me/web3_wallets');
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Connect MetaMask' }));
    await waitFor(() => expect(creation.requests).toHaveLength(1));
    creation.release();
    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong. Please try again.');
    const pendingId = fapi.client.sessions[0]?.user.web3_wallets[0]?.id;
    expect(pendingId).toBeDefined();
    expect(fapi.client.sessions[0]?.user.web3_wallets).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Verify MetaMask' }));

    await waitFor(() => expect(fapi.client.sessions[0]?.user.web3_wallets[0]?.verification?.status).toBe('verified'));
    expect(creation.requests).toHaveLength(1);
    expect(fapi.client.sessions[0]?.user.web3_wallets.map(wallet => wallet.id)).toEqual([pendingId]);
    expect(screen.getByText('Primary')).toBeInTheDocument();
  });

  it('hides immutable wallet mutations but still permits setting a verified wallet as primary', async () => {
    const environment = web3Environment();
    serveFapi({
      environment: fapiEnvironment({
        user_settings: {
          attributes: {
            ...environment.user_settings.attributes,
            web3_wallet: {
              ...environment.user_settings.attributes.web3_wallet,
              immutable: true,
              first_factors: ['web3_metamask_signature', 'web3_coinbase_wallet_signature'],
            },
          },
        },
      }),
      client: fapiClient([
        fapiSession({
          id: 'sess_1',
          user: fapiUser({
            id: 'user_1',
            web3_wallets: [fapiWeb3Wallet({ id: 'wallet_1', web3_wallet: '0x1234567890abcdef' })],
          }),
        }),
      ]),
    });
    await renderWithClerk(<UserProfileWeb3WalletsSection />);

    expect(screen.queryByRole('button', { name: 'Connect Coinbase Wallet' })).toBeNull();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Manage MetaMask' }));
    expect(screen.getByRole('menuitem', { name: 'Set as primary' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Remove wallet' })).toBeNull();
  });

  it('hides an immutable Web3 section without saved wallets', async () => {
    const environment = web3Environment();
    serveFapi({
      environment: fapiEnvironment({
        user_settings: {
          attributes: {
            ...environment.user_settings.attributes,
            web3_wallet: { ...environment.user_settings.attributes.web3_wallet, immutable: true },
          },
        },
      }),
      client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]),
    });
    await renderWithClerk(<UserProfileWeb3WalletsSection />);

    expect(screen.queryByRole('group', { name: 'Web3 wallets' })).toBeNull();
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

  it('resolves a missing wallet identifier from the shared error catalog when localization changes', async () => {
    const request = vi.fn(() => Promise.resolve([]));
    vi.stubGlobal('ethereum', { request });
    serveFapi({
      environment: web3Environment(),
      client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]),
    });
    const section = <UserProfileWeb3WalletsSection />;
    const { rerender } = await renderWithClerk(
      <MosaicProvider localization={{ overrides: { 'errors.web3_missing_identifier': 'Installez un portefeuille.' } }}>
        {section}
      </MosaicProvider>,
    );

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Connect MetaMask' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Installez un portefeuille.');

    rerender(
      <MosaicProvider localization={{ overrides: { 'errors.web3_missing_identifier': 'Portefeuille introuvable.' } }}>
        {section}
      </MosaicProvider>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Portefeuille introuvable.');
    expect(request).toHaveBeenCalledOnce();

    rerender(<MosaicProvider>{section}</MosaicProvider>);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'A Web3 Wallet extension cannot be found. Please install one to continue.',
    );
    expect(request).toHaveBeenCalledOnce();
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

  it('rechecks creation policy after the wallet provider prompt', async () => {
    const accountRequest = Promise.withResolvers<string[]>();
    vi.stubGlobal('ethereum', { request: vi.fn(() => accountRequest.promise) });
    const environment = web3Environment();
    const fapi = serveFapi({
      environment: fapiEnvironment({
        user_settings: {
          ...environment.user_settings,
          enterprise_sso: { enabled: true, self_serve_sso: false, self_serve_directory_sync: false },
        },
      }),
      client: fapiClient([
        fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) }),
        fapiSession({
          id: 'sess_2',
          user: fapiUser({ id: 'user_1', enterprise_accounts: [fapiEnterpriseAccount({ id: 'sso_1' })] }),
        }),
      ]),
    });
    const { clerk } = await renderWithClerk(<UserProfileWeb3WalletsSection />);
    const initialUser = clerk.user;
    if (!initialUser) {
      throw new Error('Expected signed-in user');
    }
    const create = vi.spyOn(initialUser, 'createWeb3Wallet');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Connect MetaMask' }));
    await act(() => clerk.setActive({ session: 'sess_2' }));
    await act(async () => {
      accountRequest.resolve(['0x1234567890abcdef']);
      await accountRequest.promise;
    });

    expect(create).not.toHaveBeenCalled();
    expect(fapi.client.sessions[1]?.user.web3_wallets).toHaveLength(0);
    expect(screen.queryByRole('button', { name: 'Connect MetaMask' })).toBeNull();
  });

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

    const metamaskButton = await screen.findByRole('button', { name: 'Connect MetaMask' });
    act(() => {
      fireEvent.click(metamaskButton);
      fireEvent.click(screen.getByRole('button', { name: 'Connect Solana' }));
    });
    expect(screen.queryByRole('dialog')).toBeNull();
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
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('clears a provider failure when a wallet action starts', async () => {
    vi.stubGlobal('ethereum', {
      request: vi.fn(() => Promise.resolve(['0x1234567890abcdef'])),
    });
    await renderWeb3({
      web3_wallets: [
        fapiWeb3Wallet({
          id: 'solana_wallet',
          web3_wallet: 'SolanaAddress123',
          verification: fapiVerification('web3_solana_signature', { status: 'verified' }),
        }),
      ],
    });
    const creation = holdRequests('post', '/v1/me/web3_wallets');
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Connect MetaMask' }));
    await waitFor(() => expect(creation.requests).toHaveLength(1));
    creation.fail('wallet_creation_failed');
    expect(await screen.findByRole('alert')).toHaveTextContent('wallet_creation_failed');

    const primary = holdRequests('post', '/v1/me');
    await user.click(screen.getByRole('button', { name: 'Manage Solana' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as primary' }));
    await waitFor(() => expect(primary.requests).toHaveLength(1));
    try {
      expect(screen.queryByRole('alert')).toBeNull();
    } finally {
      primary.release();
    }
    await waitFor(() => expect(screen.getByText('Primary')).toBeInTheDocument());
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
      primary_web3_wallet_id: 'wallet_1',
    });
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Manage MetaMask' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove wallet' }));
    expect(screen.getByRole('alertdialog')).toHaveTextContent('0x1234...cdef');
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));

    await waitFor(() => expect(fapi.client.sessions[0]?.user.web3_wallets).toHaveLength(0));
    expect(fapi.client.sessions[0]?.user.primary_web3_wallet_id).toBeNull();
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
      primary_web3_wallet_id: 'wallet_2',
    });
    const user = userEvent.setup();
    const first = screen.getAllByRole('button', { name: 'Manage MetaMask' })[1];
    first.focus();
    await user.keyboard('{Enter}');
    await user.click(screen.getByRole('menuitem', { name: 'Remove wallet' }));
    await user.keyboard('{Escape}');
    await waitFor(() => expect(first).toHaveFocus());
    expect(fapi.client.sessions[0]?.user.web3_wallets).toHaveLength(2);
    await user.click(screen.getAllByRole('button', { name: 'Manage MetaMask' })[0]);
    await user.click(screen.getByRole('menuitem', { name: 'Remove wallet' }));
    expect(screen.getByRole('alertdialog')).toHaveTextContent('0xabcd...7890');
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(fapi.client.sessions[0]?.user.web3_wallets.map(wallet => wallet.id)).toEqual(['wallet_1']);
    expect(fapi.client.sessions[0]?.user.primary_web3_wallet_id).toBe('wallet_1');
    expect(screen.getByText('Primary')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Manage MetaMask' })).toHaveFocus());
  });

  it('distinguishes localized discovery loading and failure from no installed wallets', async () => {
    const props = { onConnect: vi.fn() };
    const localization = {
      messages: {
        userProfileWeb3Wallets: {
          solanaDialog: {
            loading: 'Recherche des portefeuilles…',
            loadError: 'Chargement impossible.',
          },
        },
      },
    };
    const { rerender } = render(
      <MosaicProvider localization={localization}>
        <Dialog.Root open>
          <Dialog.Popup variant='card'>
            <UserProfileSolanaWalletView
              {...props}
              discovery={{ status: 'loading' }}
            />
          </Dialog.Popup>
        </Dialog.Root>
      </MosaicProvider>,
    );

    expect(await screen.findByRole('status')).toHaveTextContent('Recherche des portefeuilles…');
    expect(screen.queryByText('No Solana wallets are available.')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Find a Solana wallet' })).not.toBeInTheDocument();

    rerender(
      <MosaicProvider localization={localization}>
        <Dialog.Root open>
          <Dialog.Popup variant='card'>
            <UserProfileSolanaWalletView
              {...props}
              discovery={{ status: 'error' }}
            />
          </Dialog.Popup>
        </Dialog.Root>
      </MosaicProvider>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Chargement impossible.');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByText('No Solana wallets are available.')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Find a Solana wallet' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Retry|Try again/ })).not.toBeInTheDocument();
    expect(props.onConnect).not.toHaveBeenCalled();
  });

  it('renders caller-supplied Solana wallets and forwards the chosen name', async () => {
    const props = { onConnect: vi.fn() };
    const { rerender } = render(
      <MosaicProvider>
        <Dialog.Root open>
          <Dialog.Popup variant='card'>
            <UserProfileSolanaWalletView
              {...props}
              discovery={{ status: 'ready', wallets: [{ name: 'Supplied Solana', icon: '' }] }}
            />
          </Dialog.Popup>
        </Dialog.Root>
      </MosaicProvider>,
    );

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Supplied Solana' }));
    expect(props.onConnect).toHaveBeenCalledExactlyOnceWith('Supplied Solana');

    rerender(
      <MosaicProvider>
        <Dialog.Root open>
          <Dialog.Popup variant='card'>
            <UserProfileSolanaWalletView
              {...props}
              discovery={{ status: 'ready', wallets: [] }}
            />
          </Dialog.Popup>
        </Dialog.Root>
      </MosaicProvider>,
    );
    expect(screen.queryByRole('button', { name: 'Supplied Solana' })).toBeNull();
    expect(screen.getByText('No Solana wallets are available.')).toBeInTheDocument();
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
      act(() => {
        fireEvent.click(screen.getByRole('button', { name: 'Second Solana' }));
      });
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

  it.each(['Cancel', 'Close', 'Escape'] as const)(
    'clears the previous Solana failure when reopened after %s',
    async dismissal => {
      const connect = vi.fn(() => Promise.reject(new Error('Wallet rejected connection')));
      const wallet = {
        version: '1.0.0' as const,
        name: 'Test Solana',
        icon: 'data:image/svg+xml;base64,' as const,
        chains: ['solana:mainnet' as const],
        accounts: [],
        features: {
          'standard:connect': { version: '1.0.0' as const, connect },
          'solana:signMessage': {
            version: '1.0.0' as const,
            signMessage: () => Promise.resolve([{ signature: new Uint8Array([4, 5, 6]) }]),
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
        await renderWeb3();
        const user = userEvent.setup();
        await user.click(screen.getByRole('button', { name: 'Connect Solana' }));
        await user.click(await screen.findByRole('button', { name: 'Test Solana' }));
        expect(await within(screen.getByRole('dialog')).findByRole('alert')).toHaveTextContent(
          'Something went wrong. Please try again.',
        );

        if (dismissal === 'Escape') {
          await user.keyboard('{Escape}');
        } else {
          await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: dismissal }));
        }
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
        expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong. Please try again.');
        await user.click(screen.getByRole('button', { name: 'Connect Solana' }));

        expect(within(screen.getByRole('dialog')).queryByText('Something went wrong. Please try again.')).toBeNull();
        expect(screen.getByRole('button', { name: 'Test Solana' })).toBeEnabled();
        await user.click(screen.getByRole('button', { name: 'Test Solana' }));
        expect(await within(screen.getByRole('dialog')).findByRole('alert')).toHaveTextContent(
          'Something went wrong. Please try again.',
        );
        expect(connect).toHaveBeenCalledTimes(2);
      } finally {
        window.removeEventListener('wallet-standard:app-ready', onAppReady);
        unregister.forEach(remove => remove());
      }
    },
  );

  // TODO: Add session reverification for wallet connection, primary updates, and removal;
  // surface API errors until then.
  // TODO: Share Solana discovery and filtering only after verifying parity with the legacy UI.
  // TODO: Share identification sorting only after verifying parity for legacy email, phone, and wallet sections.
  // TODO: Add recovery for abandoned MetaMask connections. In Brave, closing the locked wallet prompt
  // left wallet_requestPermissions pending. Refresh cleared Clerk's error, but a new connection returned -32002.
  // Clerk cancellation must release the UI and ignore late responses without claiming to cancel the wallet request.
  // The injected MetaMask API exposes no supported method to cancel that request, and clerk_go cannot clear it.
});
