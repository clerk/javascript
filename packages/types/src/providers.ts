import type { OAuthProvider, OAuthProviderData } from './oauth';
import { OAUTH_PROVIDERS } from './oauth';
import type { OAuthStrategy, Web3Strategy } from './strategies';
import type { Web3Provider, Web3ProviderData } from './web3';
import { WEB3_PROVIDERS } from './web3';

export interface ProviderData {
  providerType: ProviderType;
}

export enum ProviderType {
  OAuth = 'oauth',
  Web3 = 'web3',
}

interface getProviderDataProps {
  provider?: OAuthProvider | Web3Provider;
  strategy?: OAuthStrategy | Web3Strategy;
}

export function getProviderData({
  provider,
  strategy,
}: getProviderDataProps): OAuthProviderData | Web3ProviderData | undefined | null {
  const providers = [...OAUTH_PROVIDERS, ...WEB3_PROVIDERS];

  if (provider) {
    return providers.find(oauth_provider => oauth_provider.provider == provider);
  }

  return providers.find(oauth_provider => oauth_provider.strategy == strategy);
}
