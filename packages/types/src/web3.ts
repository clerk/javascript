import { Web3Strategy } from './strategies';

export interface Web3ProviderData {
  provider: Web3Provider;
  strategy: Web3Strategy;
  name: string;
}

export type MetamaskWeb3Provider = 'metamask';

export type Web3Provider = MetamaskWeb3Provider;

export const WEB3_PROVIDERS: Web3ProviderData[] = [
  {
    provider: 'metamask',
    strategy: 'web3_metamask_signature',
    name: 'MetaMask',
  },
];

interface getWeb3ProviderDataProps {
  provider?: Web3Provider;
  strategy?: Web3Strategy;
}

export function getWeb3ProviderData({
  provider,
  strategy,
}: getWeb3ProviderDataProps): Web3ProviderData | undefined | null {
  if (provider) {
    return WEB3_PROVIDERS.find(p => p.provider == provider);
  }

  return WEB3_PROVIDERS.find(p => p.strategy == strategy);
}
