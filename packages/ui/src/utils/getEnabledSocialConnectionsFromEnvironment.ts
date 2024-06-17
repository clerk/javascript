import type { EnvironmentResource } from '@clerk/types';
import { OAUTH_PROVIDERS, WEB3_PROVIDERS } from '@clerk/types';

// TODO: consolidate logic with packages/clerk-js/src/ui/hooks/useEnabledThirdPartyProviders.tsx
export function getEnabledSocialConnectionsFromEnvironment(environment?: EnvironmentResource) {
  if (!environment) {
    return [];
  }

  const { socialProviderStrategies, web3FirstFactors, authenticatableSocialStrategies } = environment.userSettings;

  const enabledConnections = new Set([
    ...socialProviderStrategies,
    ...web3FirstFactors,
    ...authenticatableSocialStrategies,
  ]);

  return [...OAUTH_PROVIDERS, ...WEB3_PROVIDERS].filter(provider => enabledConnections.has(provider.strategy));
}
