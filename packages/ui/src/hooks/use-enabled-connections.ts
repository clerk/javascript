import { OAUTH_PROVIDERS } from '@clerk/shared/oauth';
import { useClerk } from '@clerk/shared/react';
import { WEB3_PROVIDERS } from '@clerk/shared/web3';
import type { EnvironmentResource, OAuthProviderData, Web3ProviderData } from '@clerk/types';

export function useEnabledConnections(): (OAuthProviderData | Web3ProviderData)[] {
  const clerk = useClerk();

  const { socialProviderStrategies, web3FirstFactors, authenticatableSocialStrategies } = (
    (clerk as any)?.__unstable__environment as EnvironmentResource
  ).userSettings;

  const enabledConnections = new Set([
    ...socialProviderStrategies,
    ...web3FirstFactors,
    ...authenticatableSocialStrategies,
  ]);

  return [...OAUTH_PROVIDERS, ...WEB3_PROVIDERS].filter(provider => enabledConnections.has(provider.strategy));
}
