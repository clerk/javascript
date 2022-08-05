import { OAuthProvider, OAuthStrategy, Web3Provider, Web3Strategy } from '@clerk/types';
// TODO: This import shouldn't be part of @clerk/types
import { OAUTH_PROVIDERS, WEB3_PROVIDERS } from '@clerk/types/src';

import { svgUrl } from '../../ui/common/constants';
import { useEnvironment } from '../../ui/contexts/EnvironmentContext';

type ThirdPartyStrategyToDataMap = {
  [k in Web3Strategy | OAuthStrategy]: { id: Web3Provider | OAuthProvider; iconUrl: string; name: string };
};

type ThirdPartyProviderToDataMap = {
  [k in Web3Provider | OAuthProvider]: { strategy: Web3Strategy | OAuthStrategy; iconUrl: string; name: string };
};

const providerToDisplayData: ThirdPartyProviderToDataMap = Object.fromEntries(
  [...OAUTH_PROVIDERS, ...WEB3_PROVIDERS].map(p => {
    return [p.provider, { strategy: p.strategy, name: p.name, iconUrl: svgUrl(p.provider) }];
  }),
) as ThirdPartyProviderToDataMap;

const strategyToDisplayData: ThirdPartyStrategyToDataMap = Object.fromEntries(
  [...OAUTH_PROVIDERS, ...WEB3_PROVIDERS].map(p => {
    return [p.strategy, { id: p.provider, name: p.name, iconUrl: svgUrl(p.provider) }];
  }),
) as ThirdPartyStrategyToDataMap;

export const useEnabledThirdPartyProviders = () => {
  const { socialProviderStrategies, web3FirstFactors } = useEnvironment().userSettings;
  return {
    strategies: [...socialProviderStrategies, ...web3FirstFactors],
    strategyToDisplayData,
    providerToDisplayData,
  };
};
