import type { Wallet } from '@wallet-standard/core';

//https://eips.ethereum.org/EIPS/eip-6963

class InjectedWeb3SolanaProviders {
  #wallets: readonly Wallet[] | undefined = undefined;

  static #instance: InjectedWeb3SolanaProviders | null = null;

  private constructor() {
    if (typeof window === 'undefined') {
      return;
    }
    this.#initialize();
  }

  async #initialize() {
    const wallets = await import('@wallet-standard/core').then(mod => mod.getWallets());
    this.#wallets = wallets.get();

    wallets.on('register', () => {
      this.#wallets = wallets.get();
    });
    wallets.on('unregister', () => {
      this.#wallets = wallets.get();
    });
  }

  public static getInstance(): InjectedWeb3SolanaProviders {
    if (!InjectedWeb3SolanaProviders.#instance) {
      InjectedWeb3SolanaProviders.#instance = new InjectedWeb3SolanaProviders();
    }
    return InjectedWeb3SolanaProviders.#instance;
  }

  // Get a provider by its wallet name and optional chain
  get = (walletName: string) => {
    // Try to find the requested Solana provider among the registered wallets
    if (this.#wallets) {
      // Try to find the requested wallet by matching its name and chain (if provided)
      const wallet = this.#wallets.find(w => w.name === walletName && w.chains?.includes(`solana:`));
      if (wallet) {
        return wallet;
      }
    }

    // In case we weren't able to find the requested provider, fallback to the
    // global injected provider instead, if any, to allow the user to continue
    // the flow rather than blocking it
    return (window as any).solana;
  };
}

export const getInjectedWeb3SolanaProviders = () => InjectedWeb3SolanaProviders.getInstance();
