import { useEffect, useState } from 'react';

export type InstalledSolanaWallet = { name: string; icon: string };

export type SolanaWalletDiscovery =
  | { status: 'loading' }
  | { status: 'ready'; wallets: readonly InstalledSolanaWallet[] }
  | { status: 'error' };

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

export function useUserProfileSolanaWalletsModel(): SolanaWalletDiscovery {
  const [discovery, setDiscovery] = useState<SolanaWalletDiscovery>({ status: 'loading' });
  useEffect(() => {
    let disposed = false;
    let unsubscribe: (() => void) | undefined;

    void import('@wallet-standard/core')
      .then(({ getWallets }) => {
        if (disposed) {
          return;
        }

        const registry = getWallets();
        const update = () => {
          setDiscovery({
            status: 'ready',
            wallets: registry
              .get()
              .filter(isSolanaSignInWallet)
              .map(({ name, icon }) => ({ name, icon })),
          });
        };
        const offRegister = registry.on('register', update);
        const offUnregister = registry.on('unregister', update);
        unsubscribe = () => {
          offRegister();
          offUnregister();
        };
        update();
      })
      .catch(() => {
        if (disposed) {
          return;
        }
        setDiscovery({ status: 'error' });
      });

    return () => {
      disposed = true;
      unsubscribe?.();
    };
  }, []);

  return discovery;
}
