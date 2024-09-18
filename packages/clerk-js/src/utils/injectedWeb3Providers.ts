import type { MetamaskWeb3Provider } from '@clerk/types';

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
type InjectedWeb3Provider = MetamaskWeb3Provider;

class InjectedWeb3Providers {
  #providers: EIP6963ProviderDetail[] = [];
  #providerIdMap: Record<InjectedWeb3Provider, string> = {
    metamask: 'MetaMask',
  } as const;
  static #instance: InjectedWeb3Providers | null = null;

  private constructor() {
    if (typeof window === 'undefined') {
      return;
    }
    window.addEventListener('eip6963:announceProvider', this.#onAnnouncement as EventListener);
    window.dispatchEvent(new Event('eip6963:requestProvider'));
  }

  public static getInstance(): InjectedWeb3Providers {
    if (!InjectedWeb3Providers.#instance) {
      InjectedWeb3Providers.#instance = new InjectedWeb3Providers();
    }
    return InjectedWeb3Providers.#instance;
  }

  get = (provider: InjectedWeb3Provider) => {
    // In case there is a single injected provider, use that directly.
    // This is needed in order to support other compatible Web3 Wallets (e.g. Rabby Wallet)
    // and maintain the previous behavior
    if (this.#providers.length === 1) {
      return this.#providers[0].provider;
    }
    return this.#providers.find(p => p.info.name === this.#providerIdMap[provider])?.provider;
  };

  #onAnnouncement = (event: EIP6963AnnounceProviderEvent) => {
    if (this.#providers.some(p => p.info.uuid === event.detail.info.uuid)) {
      return;
    }
    this.#providers.push(event.detail);
  };
}

export const getInjectedWeb3Providers = () => InjectedWeb3Providers.getInstance();
