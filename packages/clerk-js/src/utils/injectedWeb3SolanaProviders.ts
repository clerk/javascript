import type { SolanaWalletAdapterWallet } from '@solana/wallet-standard';
import { type Wallet } from '@wallet-standard/core';

//https://eips.ethereum.org/EIPS/eip-4361

class InjectedWeb3SolanaProviders {
  #wallets: readonly Wallet[] | undefined = undefined;
  static #instance: InjectedWeb3SolanaProviders | null = null;

  private constructor() {
    if (typeof window === 'undefined') {
      return;
    }
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

  #isSolanaWallet(wallet: Wallet): wallet is SolanaWalletAdapterWallet {
    return wallet.chains?.some(chain => chain.startsWith('solana:')) ?? false;
  }

  #hasSignMessage(wallet: Wallet): boolean {
    return 'solana:signMessage' in wallet.features;
  }

  public static getInstance(): InjectedWeb3SolanaProviders {
    if (!InjectedWeb3SolanaProviders.#instance) {
      InjectedWeb3SolanaProviders.#instance = new InjectedWeb3SolanaProviders();
    }
    return InjectedWeb3SolanaProviders.#instance;
  }

  get = async (walletName: string): Promise<SolanaWalletAdapterWallet | undefined> => {
    await this.#initialize();
    if (this.#wallets) {
      const wallet = this.#wallets.find(
        w => w.name === walletName && this.#isSolanaWallet(w) && this.#hasSignMessage(w),
      );
      if (wallet && this.#isSolanaWallet(wallet)) {
        return wallet;
      }
    }

    // In case we weren't able to find the requested provider, fallback to the
    // global injected provider instead, if any, to allow the user to continue
    // the flow rather than blocking it
    const fallbackProvider = (window as any).solana;
    if (
      fallbackProvider &&
      typeof fallbackProvider.connect === 'function' &&
      typeof fallbackProvider.signMessage === 'function'
    ) {
      return fallbackProvider as SolanaWalletAdapterWallet;
    }
    return undefined;
  };
}

export const getInjectedWeb3SolanaProviders = () => InjectedWeb3SolanaProviders.getInstance();
