import type { EnvironmentResource, OAuthProvider, OAuthStrategy, Web3Provider, Web3Strategy } from '@clerk/types';
import { OAUTH_PROVIDERS, WEB3_PROVIDERS } from '@clerk/types'; // TODO: This import shouldn't be part of @clerk/types

import { fromEntries, iconImageUrl } from './clerk-js';

// c.f. vendor/clerk-js/src/ui/hooks/useEnabledThirdPartyProviders.tsx [Modified]
export interface ThirdPartyStrategy {
  id: Web3Provider | OAuthProvider;
  iconUrl: string;
  name: string;
}

export interface ThirdPartyProvider {
  strategy: Web3Strategy | OAuthStrategy;
  iconUrl: string;
  name: string;
}

type ThirdPartyStrategyToDataMap = {
  [k in Web3Strategy | OAuthStrategy]: ThirdPartyStrategy;
};

type ThirdPartyProviderToDataMap = {
  [k in Web3Provider | OAuthProvider]: ThirdPartyProvider;
};

export interface EnabledThirdPartyProviders {
  authenticatableOauthStrategies: OAuthStrategy[];
  providerToDisplayData: ThirdPartyProviderToDataMap;
  strategies: (Web3Strategy | OAuthStrategy)[];
  strategyToDisplayData: ThirdPartyStrategyToDataMap;
  web3Strategies: Web3Strategy[];
}

const oauthStrategies = OAUTH_PROVIDERS.map(p => p.strategy);

const providerToDisplayData: ThirdPartyProviderToDataMap = fromEntries(
  [...OAUTH_PROVIDERS, ...WEB3_PROVIDERS].map(p => {
    return [p.provider, { iconUrl: iconImageUrl(p.provider), name: p.name, strategy: p.strategy }];
  }),
) as ThirdPartyProviderToDataMap;

const strategyToDisplayData: ThirdPartyStrategyToDataMap = fromEntries(
  [...OAUTH_PROVIDERS, ...WEB3_PROVIDERS].map(p => {
    return [p.strategy, { iconUrl: iconImageUrl(p.provider), id: p.provider, name: p.name }];
  }),
) as ThirdPartyStrategyToDataMap;

export function isWeb3Strategy(
  strategy: any,
  available: EnabledThirdPartyProviders['web3Strategies'],
): strategy is Web3Strategy {
  return available.includes(strategy);
}

export function isAuthenticatableOauthStrategy(
  strategy: any,
  available: EnabledThirdPartyProviders['authenticatableOauthStrategies'],
): strategy is OAuthStrategy {
  return available.includes(strategy);
}

export const getEnabledThirdPartyProviders = (environment: EnvironmentResource): EnabledThirdPartyProviders => {
  const { socialProviderStrategies, web3FirstFactors, authenticatableSocialStrategies } = environment.userSettings;

  // Filter out any OAuth strategies that are not yet known, they are not included in our types.
  const knownSocialProviderStrategies = socialProviderStrategies.filter(s => oauthStrategies.includes(s));
  const knownAuthenticatableSocialStrategies = authenticatableSocialStrategies.filter(s => oauthStrategies.includes(s));

  return {
    authenticatableOauthStrategies: [...knownAuthenticatableSocialStrategies],
    providerToDisplayData: providerToDisplayData,
    strategies: [...knownSocialProviderStrategies, ...web3FirstFactors],
    strategyToDisplayData: strategyToDisplayData,
    web3Strategies: web3FirstFactors,
  };
};
