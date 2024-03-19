import type { OAuthProvider, SamlStrategy, SignInStrategy } from '@clerk/types';

type Strategy = OAuthProvider | SamlStrategy | 'metamask';

export function mapScopeToStrategy<T extends `provider:${Strategy}`>(scope: T): SignInStrategy {
  if (scope === 'provider:metamask') {
    return 'web3_metamask_signature';
  }

  if (scope === 'provider:saml') {
    return 'saml';
  }

  const scopeWithoutPrefix = scope.replace('provider:', '') as OAuthProvider;

  return `oauth_${scopeWithoutPrefix}`;
}
