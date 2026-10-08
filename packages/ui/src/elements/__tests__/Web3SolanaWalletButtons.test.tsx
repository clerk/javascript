import { createDeferredPromise } from '@clerk/shared/utils';
import type { Wallet } from '@wallet-standard/core';
import { act, StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { fireEvent, render, screen } from '@/test/utils';

import { useCardState, withCardStateProvider } from '../contexts';
import { Web3SolanaWalletButtons } from '../Web3SolanaWalletButtons';

const registry = vi.hoisted(() => ({
  wallets: [] as Wallet[],
  listeners: { register: new Set<() => void>(), unregister: new Set<() => void>() },
}));

vi.mock('@wallet-standard/core', () => ({
  getWallets: () => ({
    get: () => registry.wallets,
    on: (event: 'register' | 'unregister', listener: () => void) => {
      registry.listeners[event].add(listener);
      return () => registry.listeners[event].delete(listener);
    },
  }),
}));

const makeWallet = (name: string, chains: string[], features: string[]): Wallet =>
  ({
    name,
    icon: 'data:image/svg+xml;base64,',
    version: '1.0.0',
    chains,
    accounts: [],
    features: Object.fromEntries(features.map(feature => [feature, {}])),
  }) as unknown as Wallet;

const SIGN_IN_FEATURES = ['standard:connect', 'solana:signMessage'];

const { createFixtures } = bindCreateFixtures('SignIn');

const Buttons = withCardStateProvider(Web3SolanaWalletButtons);

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

async function setupOwnership(authenticate: (params: { walletName: string }) => Promise<unknown>) {
  registry.wallets = [makeWallet('Phantom', ['solana:mainnet'], SIGN_IN_FEATURES)];
  const { wrapper } = await createFixtures();
  let card!: ReturnType<typeof useCardState>;
  const Boundary = withCardStateProvider(({ visible }: { visible: boolean }) => {
    card = useCardState();
    return visible ? <Web3SolanaWalletButtons web3AuthCallback={authenticate} /> : null;
  });
  const view = render(<Boundary visible />, { wrapper });
  return { ...view, card: () => card, hide: () => view.rerender(<Boundary visible={false} />) };
}

describe('Web3SolanaWalletButtons', () => {
  beforeEach(() => {
    registry.wallets = [];
    registry.listeners.register.clear();
    registry.listeners.unregister.clear();
  });

  it('lists only Solana wallets that can connect and sign messages', async () => {
    registry.wallets = [
      makeWallet('Phantom', ['solana:mainnet'], SIGN_IN_FEATURES),
      makeWallet('Solana Viewer', ['solana:mainnet'], ['standard:connect']),
      makeWallet('Solana Signer', ['solana:mainnet'], ['solana:signMessage']),
      makeWallet('MetaMask', ['eip155:1'], SIGN_IN_FEATURES),
    ];
    const { wrapper } = await createFixtures();

    render(<Buttons web3AuthCallback={vi.fn()} />, { wrapper });

    expect(await screen.findByText('Continue with Phantom')).toBeInTheDocument();
    expect(screen.queryByText(/Solana Viewer/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Solana Signer/)).not.toBeInTheDocument();
    expect(screen.queryByText(/MetaMask/)).not.toBeInTheDocument();
  });

  it('shows the none-available message, then picks up a wallet that registers later', async () => {
    const { wrapper } = await createFixtures();

    render(<Buttons web3AuthCallback={vi.fn()} />, { wrapper });

    expect(await screen.findByText(/No Solana Web3 wallets detected/)).toBeInTheDocument();

    act(() => {
      registry.wallets = [makeWallet('Backpack', ['solana:mainnet'], SIGN_IN_FEATURES)];
      registry.listeners.register.forEach(listener => listener());
    });

    expect(await screen.findByText('Continue with Backpack')).toBeInTheDocument();
  });

  it('passes the chosen wallet name to the auth callback', async () => {
    registry.wallets = [makeWallet('Phantom', ['solana:mainnet'], SIGN_IN_FEATURES)];
    const web3AuthCallback = vi.fn().mockResolvedValue(undefined);
    const { wrapper } = await createFixtures();

    const { userEvent } = render(<Buttons web3AuthCallback={web3AuthCallback} />, { wrapper });

    await userEvent.click(await screen.findByText('Continue with Phantom'));

    expect(web3AuthCallback).toHaveBeenCalledWith({ walletName: 'Phantom' });
  });

  it('starts the selected callback synchronously and blocks other wallet requests in the same event batch', async () => {
    registry.wallets = [
      makeWallet('Phantom', ['solana:mainnet'], SIGN_IN_FEATURES),
      makeWallet('Backpack', ['solana:mainnet'], SIGN_IN_FEATURES),
    ];
    const deferred = createDeferredPromise();
    const authenticate = vi.fn().mockReturnValue(deferred.promise);
    const { wrapper } = await createFixtures();
    render(<Buttons web3AuthCallback={authenticate} />, { wrapper });
    act(() => {
      fireEvent.click(screen.getByText('Phantom'));
      expect(authenticate).toHaveBeenCalledWith({ walletName: 'Phantom' });
      fireEvent.click(screen.getByText('Backpack'));
    });
    expect(authenticate).toHaveBeenCalledOnce();
    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });
  });

  it('does not start or release a request owned by another action', async () => {
    const authenticate = vi.fn().mockResolvedValue(undefined);
    const view = await setupOwnership(authenticate);
    let release!: () => void;
    act(() => {
      release = view.card().beginRequest('other')!;
    });
    fireEvent.click(screen.getByText('Continue with Phantom'));
    expect(authenticate).not.toHaveBeenCalled();
    view.hide();
    expect(view.card().isLoading).toBe(true);
    act(() => {
      release();
    });
    expect(view.card().isLoading).toBe(false);
  });

  it.each(['resolve', 'reject'] as const)('does not release a new request after an old wallet %s', async outcome => {
    const deferred = createDeferredPromise();
    const authenticate = vi.fn().mockReturnValue(deferred.promise);
    const view = await setupOwnership(authenticate);
    fireEvent.click(screen.getByText('Continue with Phantom'));
    expect(view.card().isLoading).toBe(true);
    view.hide();
    expect(view.card().isLoading).toBe(false);
    let release!: () => void;
    act(() => {
      release = view.card().beginRequest('new')!;
    });
    const timers = vi.spyOn(globalThis, 'setTimeout');
    await act(async () => {
      if (outcome === 'resolve') {
        deferred.resolve();
      } else {
        deferred.reject(new Error('Wallet failed'));
      }
      await deferred.promise.catch(() => undefined);
    });
    expect(timers.mock.calls.filter(([, delay]) => delay === 1000)).toHaveLength(0);
    expect(view.card().isLoading).toBe(true);
    act(() => {
      release();
    });
  });

  it('holds the failure cooldown, then permits retry', async () => {
    const deferred = createDeferredPromise();
    const authenticate = vi.fn().mockReturnValueOnce(deferred.promise).mockResolvedValueOnce(undefined);
    const view = await setupOwnership(authenticate);
    vi.useFakeTimers();
    fireEvent.click(screen.getByText('Continue with Phantom'));
    await act(async () => {
      deferred.reject(new Error('Wallet failed'));
      await deferred.promise.catch(() => undefined);
    });
    expect(view.card().isLoading).toBe(true);
    act(() => {
      vi.advanceTimersByTime(999);
    });
    fireEvent.click(screen.getByText('Continue with Phantom'));
    expect(authenticate).toHaveBeenCalledOnce();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(view.card().isLoading).toBe(false);
    await act(async () => {
      fireEvent.click(screen.getByText('Continue with Phantom'));
      await authenticate.mock.results[1].value;
    });
    expect(authenticate).toHaveBeenCalledTimes(2);
    expect(view.card().isLoading).toBe(false);
  });

  it('clears its failure timer on unmount without releasing a new request', async () => {
    const deferred = createDeferredPromise();
    const view = await setupOwnership(vi.fn().mockReturnValue(deferred.promise));
    vi.useFakeTimers();
    const timers = vi.spyOn(globalThis, 'setTimeout');
    const cleared = vi.spyOn(globalThis, 'clearTimeout');
    fireEvent.click(screen.getByText('Continue with Phantom'));
    await act(async () => {
      deferred.reject(new Error('Wallet failed'));
      await deferred.promise.catch(() => undefined);
    });
    const timerIndex = timers.mock.calls.findIndex(([, delay]) => delay === 1000);
    expect(timerIndex).toBeGreaterThanOrEqual(0);
    const timer = timers.mock.results[timerIndex].value;
    view.hide();
    expect(cleared).toHaveBeenCalledWith(timer);
    let release!: () => void;
    act(() => {
      release = view.card().beginRequest('new')!;
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(view.card().isLoading).toBe(true);
    act(() => {
      release();
    });
  });

  it('cleans registry subscriptions in Strict Mode', async () => {
    const { wrapper } = await createFixtures();
    const view = render(
      <StrictMode>
        <Buttons web3AuthCallback={vi.fn()} />
      </StrictMode>,
      { wrapper },
    );
    expect(registry.listeners.register.size).toBe(1);
    expect(registry.listeners.unregister.size).toBe(1);
    view.unmount();
    expect(registry.listeners.register.size).toBe(0);
    expect(registry.listeners.unregister.size).toBe(0);
  });
});
