import type * as SharedReact from '@clerk/shared/react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import { UserProfileWeb3WalletsSection } from '../user-profile-web3-wallets-section/user-profile-web3-wallets-section';

const request = vi.fn();
const attributes: { web3_wallet?: { enabled: boolean } } = {};
vi.mock('@clerk/shared/internal/clerk-js/web3', () => ({
  createWeb3: () => ({ getWeb3Identifier: () => Promise.resolve('0x1234') }),
}));
vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof SharedReact>();
  return {
    ...actual,
    useUser: () => ({
      isLoaded: true,
      user: {
        id: 'user_1',
        enterpriseAccounts: [],
        primaryWeb3WalletId: null,
        web3Wallets: [
          {
            id: 'wallet_1',
            web3Wallet: '0xabcdef',
            verification: { strategy: 'admin', status: 'verified' },
            destroy: request,
          },
        ],
        createWeb3Wallet: request,
        update: request,
      },
    }),
    useClerk: () => ({
      __internal_getOption: () => undefined,
      __internal_moduleManager: {},
      __internal_environment: {
        userSettings: {
          attributes,
          web3FirstFactors: ['web3_metamask_signature'],
          enterpriseSSO: { enabled: false },
        },
        displayConfig: { supportEmail: 'support@example.com' },
      },
    }),
    useSession: () => ({ session: { id: 'session_1' } }),
  };
});

describe('Web3 wallets', () => {
  beforeEach(() => {
    attributes.web3_wallet = { enabled: true };
    request.mockReset().mockRejectedValue(new Error('Wallet request failed'));
  });

  it.each([false, undefined])('hides existing wallets and providers when Web3 enabled is %s', enabled => {
    attributes.web3_wallet = enabled === undefined ? undefined : { enabled };

    render(
      <MosaicProvider>
        <UserProfileWeb3WalletsSection />
      </MosaicProvider>,
    );

    expect(screen.queryByRole('button', { name: 'Manage 0xabcdef' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Connect MetaMask' })).not.toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();
  });

  it.each(['connect', 'primary', 'remove'] as const)(
    'shows a direct %s failure without retrying automatically',
    async action => {
      const user = userEvent.setup();
      render(
        <MosaicProvider>
          <UserProfileWeb3WalletsSection />
        </MosaicProvider>,
      );
      if (action === 'connect') {
        await user.click(screen.getByRole('button', { name: 'Connect MetaMask' }));
      } else {
        await user.click(screen.getByRole('button', { name: 'Manage 0xabcdef' }));
        await user.click(
          screen.getByRole('menuitem', { name: action === 'primary' ? 'Set as primary' : 'Remove wallet' }),
        );
        if (action === 'remove') {
          await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));
        }
      }
      await waitFor(() => expect(request).toHaveBeenCalledOnce());
      expect(await screen.findByRole('alert')).toHaveTextContent('Wallet request failed');
      expect(screen.queryByText('Cannot verify your account')).not.toBeInTheDocument();
      if (action === 'remove') {
        await waitFor(() =>
          expect(
            within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove', exact: true }),
          ).not.toHaveAttribute('aria-busy', 'true'),
        );
      } else {
        await waitFor(() => expect(screen.getByRole('button', { name: 'Connect MetaMask' })).not.toBeDisabled());
      }
      if (action === 'remove') {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      }
    },
  );
});
