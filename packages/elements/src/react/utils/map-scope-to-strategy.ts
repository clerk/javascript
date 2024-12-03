import type { OAuthProvider, SamlStrategy, SignInStrategy, Web3Provider } from '@clerk/types';

type Strategy = OAuthProvider | SamlStrategy | Web3Provider;

export function isProviderStrategyScope(value: string): value is Strategy {
  return value.startsWith('provider:');
}

export function mapScopeToStrategy<T extends `provider:${Strategy}`>(scope: T): SignInStrategy {
  if (scope === 'provider:metamask') {
    return 'web3_metamask_signature';
  }
  if (scope === 'provider:coinbase_wallet') {
    return 'web3_coinbase_wallet_signature';
  }
  if (scope === 'provider:okx_wallet') {
    return 'web3_okx_wallet_signature';
  }

  if (scope === 'provider:saml') {
    return 'saml';
  }

  const scopeWithoutPrefix = scope.replace('provider:', '') as OAuthProvider;

  return `oauth_${scopeWithoutPrefix}`;
}
