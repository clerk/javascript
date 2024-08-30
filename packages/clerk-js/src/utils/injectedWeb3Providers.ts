import type { Web3Provider } from '@clerk/types';

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

type EIP6963AnnounceProviderEvent = CustomEvent;

class InjectedWeb3Providers {
  #providers: EIP6963ProviderDetail[] = [];
  #providerIdMap: Record<Web3Provider, string> = {
    coinbase: 'Coinbase Wallet',
    metamask: 'MetaMask',
  } as const;

  constructor() {
    window.addEventListener('eip6963:announceProvider', this.#onAnnouncement as EventListener);
    window.dispatchEvent(new Event('eip6963:requestProvider'));
  }

  get = (provider: Web3Provider) => {
    return this.#providers.find(p => p.info.name === this.#providerIdMap[provider])?.provider;
  };

  #onAnnouncement = (event: EIP6963AnnounceProviderEvent) => {
    if (this.#providers.some(p => p.info.uuid === event.detail.info.uuid)) {
      return;
    }
    this.#providers.push(event.detail);
    console.log(this.#providers);
  };
}

export const injectedWeb3Providers = new InjectedWeb3Providers();
