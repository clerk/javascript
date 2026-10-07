import { useEffect, useState } from 'react';

export type InstalledSolanaWallet = { name: string; icon: string };

function isSolanaSignInWallet(wallet: {
  chains: readonly string[];
  features: Readonly<Record<string, unknown>>;
}): boolean {
  return (
    wallet.chains.some(chain => chain.startsWith('solana:')) &&
    'standard:connect' in wallet.features &&
    'solana:signMessage' in wallet.features
  );
}

export function useUserProfileSolanaWalletsModel(): readonly InstalledSolanaWallet[] {
  const [wallets, setWallets] = useState<readonly InstalledSolanaWallet[]>([]);

  useEffect(() => {
    let disposed = false;
    let unsubscribe: (() => void) | undefined;

    void import('@wallet-standard/core').then(({ getWallets }) => {
      if (disposed) {
        return;
      }

      const registry = getWallets();
      const update = () => {
        setWallets(
          registry
            .get()
            .filter(isSolanaSignInWallet)
            .map(({ name, icon }) => ({ name, icon })),
        );
      };
      const offRegister = registry.on('register', update);
      const offUnregister = registry.on('unregister', update);
      unsubscribe = () => {
        offRegister();
        offUnregister();
      };
      update();
    });

    return () => {
      disposed = true;
      unsubscribe?.();
    };
  }, []);

  return wallets;
}
