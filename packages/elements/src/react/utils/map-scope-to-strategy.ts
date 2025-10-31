import type {
  EnterpriseSSOStrategy,
  OAuthProvider,
  SamlStrategy,
  SignInStrategy,
  Web3Provider,
} from '@clerk/shared/types';

type Strategy = OAuthProvider | SamlStrategy | EnterpriseSSOStrategy | Web3Provider;

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

  if (scope === 'provider:base') {
    return 'web3_base_signature';
  }

  if (scope === 'provider:okx_wallet') {
    return 'web3_okx_wallet_signature';
  }

  if (scope === 'provider:saml') {
    return 'saml';
  }

  if (scope === 'provider:enterprise_sso') {
    return 'enterprise_sso';
  }

  const scopeWithoutPrefix = scope.replace('provider:', '') as OAuthProvider;

  return `oauth_${scopeWithoutPrefix}`;
}
