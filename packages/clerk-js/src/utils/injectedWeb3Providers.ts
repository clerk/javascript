import type {
  InjectedWeb3ProviderChain,
  MetamaskWeb3Provider,
  OKXWalletWeb3Provider,
  Wallet,
  WalletEventsWindow,
  Wallets,
  WalletsEventNames,
  WalletsEventsListeners,
  WindowAppReadyEvent,
  WindowAppReadyEventAPI,
} from '@clerk/shared/types';

//https://eips.ethereum.org/EIPS/eip-6963

interface EIP6963ProviderInfo {
  walletId: string;
  uuid: string;
  name: string;
  icon: string;
}

interface EIP1193Provider {
  isStatus?: boolean;
  host?: string;
  path?: string;
  sendAsync?: (
    request: { method: string; params?: [] },
    callback: (error: Error | null, response: unknown) => void,
  ) => void; // For sending asynchronous requests
  send?: (request: { method: string; params?: [] }, callback: (error: Error | null, response: unknown) => void) => void; // For sending synchronous requests
  request: (request: { method: string; params?: string[] }) => Promise<string>; // Standard method for sending requests per EIP-1193
}

interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: EIP1193Provider;
}

type EIP6963AnnounceProviderEvent = CustomEvent<EIP6963ProviderDetail>;
type InjectedWeb3Wallet = MetamaskWeb3Provider | OKXWalletWeb3Provider;

class InjectedWeb3Providers {
  #wallets: Wallets | undefined = undefined;
  #registeredWalletsSet = new Set<Wallet>();
  #cachedWalletsArray: readonly Wallet[] | undefined;
  #listeners: { [E in WalletsEventNames]?: WalletsEventsListeners[E][] } = {};

  #ethWalletProviders: EIP6963ProviderDetail[] = [];
  #providerIdMap: Record<InjectedWeb3Wallet, string> = {
    metamask: 'MetaMask',
    okx_wallet: 'OKX Wallet',
  } as const;

  static #instance: InjectedWeb3Providers | null = null;

  private constructor() {
    if (typeof window === 'undefined') {
      return;
    }
    window.addEventListener('eip6963:announceProvider', this.#onAnnouncement as EventListener);
    window.dispatchEvent(new Event('eip6963:requestProvider'));

    this.#wallets = Object.freeze({ register: this.#register, get: this.#get, on: this.#on });

    const api = Object.freeze({ register: this.#register });
    try {
      (window as WalletEventsWindow).addEventListener('wallet-standard:register-wallet', ({ detail: callback }) =>
        callback(api),
      );
    } catch (error) {
      console.error('wallet-standard:register-wallet event listener could not be added\n', error);
    }
    try {
      (window as WalletEventsWindow).dispatchEvent(new AppReadyEvent(api));
    } catch (error) {
      console.error('wallet-standard:app-ready event could not be dispatched\n', error);
    }
  }

  public static getInstance(): InjectedWeb3Providers {
    if (!InjectedWeb3Providers.#instance) {
      InjectedWeb3Providers.#instance = new InjectedWeb3Providers();
    }
    return InjectedWeb3Providers.#instance;
  }

  // Get a provider by its wallet name and optional chain
  get = (walletProvider: string, chain?: InjectedWeb3ProviderChain) => {
    const ethProvider = this.#ethWalletProviders.find(
      p => p.info.name === this.#providerIdMap[walletProvider as InjectedWeb3Wallet],
    )?.provider;
    if (ethProvider !== undefined) {
      return ethProvider;
    }

    // Try to find the requested Solana provider among the registered wallets
    const wallets = this.#wallets?.get();
    if (wallets) {
      // Try to find the requested wallet by matching its name and chain (if provided)
      const wallet = wallets.find(w => w.name === walletProvider && (chain ? w.chains?.includes(`${chain}:`) : true));
      if (wallet) {
        return wallet;
      }
    }

    // In case we weren't able to find the requested provider, fallback to the
    // global injected provider instead, if any, to allow the user to continue
    // the flow rather than blocking it
    if (chain === 'solana') {
      return (window as any).solana;
    }
    return window.ethereum;
  };

  #onAnnouncement = (event: EIP6963AnnounceProviderEvent) => {
    if (this.#ethWalletProviders.some(p => p.info.uuid === event.detail.info.uuid)) {
      return;
    }
    this.#ethWalletProviders.push(event.detail);
  };

  #register = (...wallets: Wallet[]): (() => void) => {
    // Filter out wallets that have already been registered.
    // This prevents the same wallet from being registered twice, but it also prevents wallets from being
    // unregistered by reusing a reference to the wallet to obtain the unregister function for it.
    wallets = wallets.filter(wallet => !this.#registeredWalletsSet.has(wallet));
    // If there are no new wallets to register, just return a no-op unregister function.

    if (!wallets.length) {
      return () => {};
    }

    wallets.forEach(wallet => this.#addRegisteredWallet(wallet));
    this.#listeners['register']?.forEach(listener => guard(() => listener(...wallets)));
    // Return a function that unregisters the registered wallets.
    return () => {
      wallets.forEach(wallet => this.#removeRegisteredWallet(wallet));
      this.#listeners['unregister']?.forEach(listener => guard(() => listener(...wallets)));
    };
  };

  #addRegisteredWallet = (wallet: Wallet) => {
    this.#cachedWalletsArray = undefined;
    this.#registeredWalletsSet.add(wallet);
  };
  #removeRegisteredWallet = (wallet: Wallet) => {
    this.#cachedWalletsArray = undefined;
    this.#registeredWalletsSet.delete(wallet);
  };

  #get = (): readonly Wallet[] => {
    if (!this.#cachedWalletsArray) {
      this.#cachedWalletsArray = [...this.#registeredWalletsSet];
    }
    return this.#cachedWalletsArray;
  };

  #on = <E extends WalletsEventNames>(event: E, listener: WalletsEventsListeners[E]): (() => void) => {
    if (this.#listeners[event]) {
      this.#listeners[event].push(listener);
    } else {
      this.#listeners[event] = [listener];
    }
    // Return a function that removes the event listener.
    return () => {
      this.#listeners[event] = this.#listeners[event]?.filter(existingListener => listener !== existingListener);
    };
  };

  listeners: { [E in WalletsEventNames]?: WalletsEventsListeners } = {};
}

export const getInjectedWeb3Providers = () => InjectedWeb3Providers.getInstance();

function guard(callback: () => void): void {
  try {
    callback();
  } catch (error) {
    console.error(error);
  }
}

class AppReadyEvent extends Event implements WindowAppReadyEvent {
  readonly #detail: WindowAppReadyEventAPI;

  get detail() {
    return this.#detail;
  }

  get type() {
    return 'wallet-standard:app-ready' as const;
  }

  constructor(api: WindowAppReadyEventAPI) {
    super('wallet-standard:app-ready', {
      bubbles: false,
      cancelable: false,
      composed: false,
    });
    this.#detail = api;
  }
}
