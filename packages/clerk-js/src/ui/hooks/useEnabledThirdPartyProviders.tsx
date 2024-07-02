import type { OAuthProvider, OAuthStrategy, Web3Provider, Web3Strategy } from '@clerk/types';
// TODO: This import shouldn't be part of @clerk/types
import { WEB3_PROVIDERS } from '@clerk/types';

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

const web3ProviderToDisplayData: ThirdPartyProviderToDataMap = fromEntries(
  WEB3_PROVIDERS.map(p => {
    return [p.provider, { strategy: p.strategy, name: p.name, iconUrl: iconImageUrl(p.provider) }];
  }),
) as ThirdPartyProviderToDataMap;

const web3StrategyToDisplayData: ThirdPartyStrategyToDataMap = fromEntries(
  WEB3_PROVIDERS.map(p => {
    return [p.strategy, { id: p.provider, name: p.name, iconUrl: iconImageUrl(p.provider) }];
  }),
) as ThirdPartyStrategyToDataMap;

export const useEnabledThirdPartyProviders = () => {
  const { socialProviderStrategies, web3FirstFactors, social } = useEnvironment().userSettings;
  const providerToDisplayData = { ...web3ProviderToDisplayData};
  const strategyToDisplayData = { ...web3StrategyToDisplayData };

  for (const provider of Object.values(social)) {
    const providerID = provider.strategy.replace("oauth_", "") as "google";
    strategyToDisplayData[provider.strategy] = {
      iconUrl: provider.logo_url as string,
      name: provider.name,
      id: providerID,
    };
    providerToDisplayData[providerID] = {
      iconUrl: provider.logo_url as string,
      name: provider.name,
      strategy: provider.strategy,
    };
  }

  return {
    strategies: [...socialProviderStrategies, ...web3FirstFactors],
    web3Strategies: [...web3FirstFactors],
    authenticatableOauthStrategies: [...socialProviderStrategies],
    strategyToDisplayData: strategyToDisplayData,
    providerToDisplayData: providerToDisplayData,
  };
};
