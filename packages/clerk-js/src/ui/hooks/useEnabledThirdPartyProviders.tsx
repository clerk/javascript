import type { OAuthProvider, OAuthStrategy, Web3Provider, Web3Strategy } from '@clerk/types';
// TODO: This import shouldn't be part of @clerk/types
import { OAUTH_PROVIDERS, WEB3_PROVIDERS } from '@clerk/types/src';

import { iconImageUrl, svgUrl } from '../common/constants';
import { useOptions } from '../contexts';
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
  const { socialProviderStrategies, web3FirstFactors, authenticatableSocialStrategies } = useEnvironment().userSettings;
  const { experimental_enableClerkImages } = useOptions();

  // TODO: remove this
  // We don't care about the mutating the reference here
  const tempStrategyToDisplayData = strategyToDisplayData;
  const tempProviderToDisplayData = providerToDisplayData;
  if (!experimental_enableClerkImages) {
    Object.values(tempStrategyToDisplayData).forEach(strategy => (strategy.iconUrl = svgUrl(strategy.id)));
    Object.keys(tempProviderToDisplayData).forEach(
      // @ts-expect-error
      provider => (tempProviderToDisplayData[provider].iconUrl = svgUrl(provider)),
    );
  }

  return {
    strategies: [...socialProviderStrategies, ...web3FirstFactors],
    web3Strategies: [...web3FirstFactors],
    authenticatableOauthStrategies: [...authenticatableSocialStrategies],
    strategyToDisplayData: tempStrategyToDisplayData,
    providerToDisplayData: tempProviderToDisplayData,
  };
};
