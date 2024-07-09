import type { OAuthProvider, OAuthStrategy, Web3Provider, Web3Strategy } from '@clerk/types';
// TODO: This import shouldn't be part of @clerk/types
import { OAUTH_PROVIDERS, WEB3_PROVIDERS } from '@clerk/types';

import { iconImageUrl } from '../common/constants';
import { useEnvironment } from '../contexts/EnvironmentContext';
import { fromEntries } from '../utils';

type ThirdPartyStrategyToDataMap = {
  [k in Web3Strategy | OAuthStrategy]: {
    id: Web3Provider | OAuthProvider;
    iconUrl: string;
    name: string;
  };
};

type ThirdPartyProviderToDataMap = {
  [k in Web3Provider | OAuthProvider]: {
    strategy: Web3Strategy | OAuthStrategy;
    iconUrl: string;
    name: string;
  };
};

const oauthStrategies = OAUTH_PROVIDERS.map(p => p.strategy);

const providerToDisplayData: ThirdPartyProviderToDataMap = fromEntries(
  [...OAUTH_PROVIDERS, ...WEB3_PROVIDERS].map(p => {
    return [p.provider, { strategy: p.strategy, name: p.name, iconUrl: iconImageUrl(p.provider) }];
  }),
) as ThirdPartyProviderToDataMap;

const strategyToDisplayData: ThirdPartyStrategyToDataMap = fromEntries(
  [...OAUTH_PROVIDERS, ...WEB3_PROVIDERS].map(p => {
    return [p.strategy, { id: p.provider, name: p.name, iconUrl: iconImageUrl(p.provider) }];
  }),
) as ThirdPartyStrategyToDataMap;

export const useEnabledThirdPartyProviders = () => {
  const { socialProviderStrategies, web3FirstFactors, authenticatableSocialStrategies, social } =
    useEnvironment().userSettings;

  // Filter out any OAuth strategies that are not yet known, they are not included in our types.
  const knownSocialProviderStrategies = socialProviderStrategies.filter(s => oauthStrategies.includes(s));
  const customSocialProviderStrategies = socialProviderStrategies.filter(
    s => !oauthStrategies.includes(s) && s.startsWith('oauth_custom_'),
  );

  const knownAuthenticatableSocialStrategies = authenticatableSocialStrategies.filter(s => oauthStrategies.includes(s));
  const customAuthenticatableSocialStrategies = authenticatableSocialStrategies.filter(
    s => !oauthStrategies.includes(s) && s.startsWith('oauth_custom_'),
  );

  customSocialProviderStrategies.map(s => {
    const providerName = s.replace('oauth_', '') as OAuthProvider;

    providerToDisplayData[providerName] = {
      strategy: s,
      name: social[s].name,
      iconUrl: social[s].logo_url || '',
    };
  });

  customAuthenticatableSocialStrategies.map(s => {
    const providerId = s.replace('oauth_', '') as OAuthProvider;
    strategyToDisplayData[s] = {
      id: providerId,
      iconUrl: social[s].logo_url || '',
      name: social[s].name,
    };
  });

  return {
    strategies: [...knownSocialProviderStrategies, ...web3FirstFactors, ...customSocialProviderStrategies],
    web3Strategies: [...web3FirstFactors],
    authenticatableOauthStrategies: [...knownAuthenticatableSocialStrategies, ...customAuthenticatableSocialStrategies],
    strategyToDisplayData: strategyToDisplayData,
    providerToDisplayData: providerToDisplayData,
  };
};
