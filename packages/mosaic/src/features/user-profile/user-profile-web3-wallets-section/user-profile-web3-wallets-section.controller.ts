import { useRef, useState } from 'react';

import type { UserProfileWeb3Provider, UserProfileWeb3Wallet } from '../user-profile-web3-wallets-section.view';

export function useUserProfileWeb3WalletsController({
  wallets,
  availableProviders,
  connect,
  setPrimary,
  fallbackErrorMessage,
}: {
  wallets: UserProfileWeb3Wallet[];
  availableProviders: UserProfileWeb3Provider[];
  connect: (strategy: string, walletName?: string) => Promise<unknown>;
  setPrimary: (walletId: string) => Promise<unknown>;
  fallbackErrorMessage: string;
}) {
  const [pendingId, setPendingId] = useState<string>();
  const [connectErrors, setConnectErrors] = useState<Record<string, string>>({});
  const [primaryErrors, setPrimaryErrors] = useState<Record<string, string>>({});
  const [solanaPickerOpen, setSolanaPickerOpen] = useState(false);
  const inFlight = useRef(false);

  const run = async (
    id: string,
    action: () => Promise<unknown>,
    setErrors: typeof setConnectErrors,
  ): Promise<boolean> => {
    if (inFlight.current) {
      return false;
    }
    inFlight.current = true;
    setPendingId(id);
    setErrors(({ [id]: _previous, ...rest }) => rest);
    try {
      await action();
      return true;
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : fallbackErrorMessage;
      setErrors(current => ({ ...current, [id]: message }));
      return false;
    } finally {
      inFlight.current = false;
      setPendingId(undefined);
    }
  };

  const onConnect = (strategy: string) => {
    if (inFlight.current) {
      return;
    }
    if (strategy === 'web3_solana_signature') {
      setSolanaPickerOpen(true);
      return;
    }
    return run(strategy, () => connect(strategy), setConnectErrors);
  };

  const connectSolana = async (walletName: string) => {
    const succeeded = await run(
      'web3_solana_signature',
      () => connect('web3_solana_signature', walletName),
      setConnectErrors,
    );
    if (succeeded) {
      setSolanaPickerOpen(false);
    }
  };

  return {
    wallets: wallets.map(wallet =>
      primaryErrors[wallet.id] ? { ...wallet, primaryError: primaryErrors[wallet.id] } : wallet,
    ),
    availableProviders: availableProviders.map(provider =>
      connectErrors[provider.id] ? { ...provider, connectError: connectErrors[provider.id] } : provider,
    ),
    pendingId,
    solanaPickerOpen,
    onConnect,
    onSetPrimary: (walletId: string) => run(walletId, () => setPrimary(walletId), setPrimaryErrors),
    connectSolana,
    closeSolanaPicker: () => setSolanaPickerOpen(false),
  };
}
