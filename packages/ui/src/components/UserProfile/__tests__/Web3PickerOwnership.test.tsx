import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, waitFor } from '@/test/utils';
import { ActionRoot } from '@/ui/elements/Action/ActionRoot';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';

import { useWeb3SelectSolanaWalletController } from '../web3-select-solana-wallet.controller';
import { useWeb3WalletActionController } from '../web3-wallet-action.controller';
import { useWeb3WalletActionModel } from '../web3-wallet-action.model';
import type { Web3SelectWalletProps } from '../Web3SelectSolanaWalletScreen';

const web3 = vi.hoisted(() => ({ getWeb3Identifier: vi.fn(), generateWeb3Signature: vi.fn() }));
vi.mock('@clerk/shared/internal/clerk-js/web3', async importOriginal => ({
  ...(await importOriginal<typeof import('@clerk/shared/internal/clerk-js/web3')>()),
  createWeb3: () => web3,
}));
const { createFixtures } = bindCreateFixtures('UserProfile');
const failure = () =>
  new ClerkAPIResponseError('Wallet failed', {
    status: 422,
    data: [{ code: 'oauth_access_denied', message: 'Wallet failed' }],
  });

async function setup(onConnect?: Web3SelectWalletProps['onConnect']) {
  const { wrapper, fixtures } = await createFixtures(f => {
    f.withWeb3Wallet();
    f.withUser({ email_addresses: ['test@clerk.com'] });
  });
  const changed = vi.fn();
  let controller!: ReturnType<typeof useWeb3SelectSolanaWalletController>;
  let card!: ReturnType<typeof useCardState>;
  const Probe = () => {
    const model = useWeb3WalletActionModel();
    const parent = useWeb3WalletActionController(model);
    controller = useWeb3SelectSolanaWalletController({ onConnect: onConnect || parent.connect });
    return null;
  };
  const Boundary = withCardStateProvider(
    ({ active = 'web3Wallets', visible = true }: { active?: string; visible?: boolean }) => {
      card = useCardState();
      return (
        <ActionRoot
          animate={false}
          value={active}
          onChange={changed}
        >
          {visible && <Probe />}
        </ActionRoot>
      );
    },
  );
  const view = render(<Boundary />, { wrapper });
  return {
    ...view,
    fixtures,
    controller: () => controller,
    card: () => card,
    changed,
    switchTo: (active: string) => view.rerender(<Boundary active={active} />),
    hide: () => view.rerender(<Boundary visible={false} />),
  };
}

describe('Profile Solana picker ownership', () => {
  beforeEach(() => {
    web3.getWeb3Identifier.mockReset();
    web3.generateWeb3Signature.mockReset();
  });
  it('closes only after a successful connection', async () => {
    const connect = vi.fn().mockResolvedValue(true);
    const view = await setup(connect);
    await act(async () => {
      await view.controller().onClick({ walletName: 'Phantom' });
    });
    expect(connect).toHaveBeenCalledWith(
      expect.objectContaining({ strategy: 'web3_solana_signature', walletName: 'Phantom' }),
    );
    expect(view.changed).toHaveBeenCalledExactlyOnceWith(null);
  });

  it('keeps the picker open for an incomplete connection', async () => {
    const view = await setup(vi.fn().mockResolvedValue(false));
    await act(async () => {
      await view.controller().onClick({ walletName: 'Phantom' });
    });
    expect(view.changed).not.toHaveBeenCalled();
  });

  it('keeps the picker open when the real parent reports a connection failure', async () => {
    web3.getWeb3Identifier.mockRejectedValueOnce(failure());
    const view = await setup();
    await act(async () => {
      await view.controller().onClick({ walletName: 'Phantom' });
    });
    expect(web3.getWeb3Identifier).toHaveBeenCalled();
    expect(view.card().error).toBe('You did not grant access to your account.');
    expect(view.changed).not.toHaveBeenCalled();
  });

  it('presents an active rejected connection without closing', async () => {
    const view = await setup(vi.fn().mockRejectedValue(failure()));
    await act(async () => {
      await view.controller().onClick({ walletName: 'Phantom' });
    });
    expect(view.card().error).toBe('You did not grant access to your account.');
    expect(view.changed).not.toHaveBeenCalled();
  });

  it.each(['resolve', 'reject'] as const)('ignores a late %s after the picker unmounts', async outcome => {
    const deferred = createDeferredPromise<boolean>();
    const connect = vi.fn().mockReturnValue(deferred.promise);
    const view = await setup(connect);
    const old = view.controller();
    const request = old.onClick({ walletName: 'Phantom' });
    view.hide();
    act(() => {
      view.card().setError('New error');
    });
    await act(async () => {
      if (outcome === 'resolve') {
        deferred.resolve(true);
      } else {
        deferred.reject(failure());
      }
      await request;
      await old.onClick({ walletName: 'Backpack' });
      old.close();
    });
    expect(connect).toHaveBeenCalledOnce();
    expect(view.card().error).toBe('New error');
    expect(view.changed).not.toHaveBeenCalled();
  });

  it('rejects an old result after a different action opens and the picker returns', async () => {
    const deferred = createDeferredPromise<boolean>();
    const view = await setup(vi.fn().mockReturnValue(deferred.promise));
    const old = view.controller();
    const request = old.onClick({ walletName: 'Phantom' });
    view.switchTo('remove-wallet');
    view.switchTo('web3Wallets');
    await act(async () => {
      deferred.resolve(true);
      await request;
    });
    old.close();
    expect(view.changed).not.toHaveBeenCalled();
    act(() => {
      view.controller().close();
    });
    expect(view.changed).toHaveBeenCalledExactlyOnceWith(null);
  });

  it('does not clear a loading request owned by the wallet buttons', async () => {
    const deferred = createDeferredPromise<boolean>();
    const view = await setup(vi.fn().mockReturnValue(deferred.promise));
    let release!: () => void;
    act(() => {
      release = view.card().beginRequest('Phantom')!;
    });
    const request = view.controller().onClick({ walletName: 'Phantom' });
    await act(async () => {
      deferred.resolve(false);
      await request;
    });
    expect(view.card().isLoading).toBe(true);
    act(() => {
      release();
    });
    expect(view.card().isLoading).toBe(false);
  });

  it.each(
    (['identify', 'create', 'prepare', 'sign', 'verify'] as const).flatMap(stage =>
      (['picker', 'account'] as const).map(change => ({ stage, change })),
    ),
  )('stops the real pipeline during $stage after the $change changes', async ({ stage, change }) => {
    const deferred = createDeferredPromise<any>();
    const view = await setup();
    const wallet = {
      verification: { status: 'unverified', message: 'nonce' },
      prepareVerification: vi.fn(),
      attemptVerification: vi.fn(),
    };
    const verified = { ...wallet, verification: { status: 'verified', message: 'nonce' } };
    web3.getWeb3Identifier.mockResolvedValue('wallet_address');
    web3.generateWeb3Signature.mockResolvedValue('signature');
    wallet.prepareVerification.mockResolvedValue(wallet);
    wallet.attemptVerification.mockResolvedValue(verified);
    const create = vi.spyOn(view.fixtures.clerk.user!, 'createWeb3Wallet').mockResolvedValue(wallet as never);
    const paused =
      stage === 'identify'
        ? web3.getWeb3Identifier
        : stage === 'create'
          ? create
          : stage === 'prepare'
            ? wallet.prepareVerification
            : stage === 'sign'
              ? web3.generateWeb3Signature
              : wallet.attemptVerification;
    paused.mockReturnValueOnce(deferred.promise);
    const request = view.controller().onClick({ walletName: 'Phantom' });
    await waitFor(() => expect(paused).toHaveBeenCalled());
    if (change === 'picker') {
      view.switchTo('remove-wallet');
    } else {
      vi.spyOn(view.fixtures.clerk, 'user', 'get').mockReturnValue({ id: 'other' } as never);
    }
    act(() => {
      view.card().setError('New error');
    });
    await act(async () => {
      deferred.resolve(
        stage === 'identify'
          ? 'wallet_address'
          : stage === 'sign'
            ? 'signature'
            : stage === 'verify'
              ? verified
              : wallet,
      );
      await request;
    });
    expect(view.changed).not.toHaveBeenCalled();
    expect(view.card().error).toBe('New error');
    if (stage === 'identify') {
      expect(create).not.toHaveBeenCalled();
    }
    if (stage === 'identify' || stage === 'create') {
      expect(wallet.prepareVerification).not.toHaveBeenCalled();
    }
    if (stage !== 'verify') {
      expect(wallet.attemptVerification).not.toHaveBeenCalled();
    }
  });

  it.each(['verified', 'unverified'] as const)(
    'closes the real connection only for a verified result: %s',
    async status => {
      const view = await setup();
      const wallet = {
        verification: { status, message: 'nonce' },
        prepareVerification: vi.fn(),
        attemptVerification: vi.fn(),
      };
      wallet.prepareVerification.mockResolvedValue(wallet);
      wallet.attemptVerification.mockResolvedValue(wallet);
      web3.getWeb3Identifier.mockResolvedValue('wallet_address');
      web3.generateWeb3Signature.mockResolvedValue('signature');
      vi.spyOn(view.fixtures.clerk.user!, 'createWeb3Wallet').mockResolvedValue(wallet as never);
      await act(async () => {
        await view.controller().onClick({ walletName: 'Phantom' });
      });
      if (status === 'verified') {
        expect(view.changed).toHaveBeenCalledExactlyOnceWith(null);
      } else {
        expect(view.changed).not.toHaveBeenCalled();
      }
    },
  );

  it('allows a new connection while an old picker prompt is still pending', async () => {
    const view = await setup();
    const oldIdentifier = createDeferredPromise<string>();
    web3.getWeb3Identifier.mockReturnValueOnce(oldIdentifier.promise).mockResolvedValue('new_address');
    web3.generateWeb3Signature.mockResolvedValue('signature');
    const wallet = {
      verification: { status: 'verified', message: 'nonce' },
      prepareVerification: vi.fn(),
      attemptVerification: vi.fn(),
    };
    wallet.prepareVerification.mockResolvedValue(wallet);
    wallet.attemptVerification.mockResolvedValue(wallet);
    const create = vi.spyOn(view.fixtures.clerk.user!, 'createWeb3Wallet').mockResolvedValue(wallet as never);
    const oldRequest = view.controller().onClick({ walletName: 'Phantom' });
    view.switchTo('remove-wallet');
    view.switchTo('web3Wallets');
    await act(async () => {
      await view.controller().onClick({ walletName: 'Backpack' });
    });
    expect(create).toHaveBeenCalledExactlyOnceWith({ web3Wallet: 'new_address' });
    expect(view.changed).toHaveBeenCalledExactlyOnceWith(null);
    await act(async () => {
      oldIdentifier.resolve('old_address');
      await oldRequest;
    });
    expect(create).toHaveBeenCalledOnce();
    expect(view.changed).toHaveBeenCalledOnce();
  });
});
