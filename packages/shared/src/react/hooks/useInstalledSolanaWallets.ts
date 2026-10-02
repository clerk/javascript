import { useEffect, useState } from 'react';

import { isSolanaSignInWallet } from '../../web3';

export type InstalledSolanaWallet = { name: string; icon: string };

export function useInstalledSolanaWallets(): readonly InstalledSolanaWallet[] {
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
