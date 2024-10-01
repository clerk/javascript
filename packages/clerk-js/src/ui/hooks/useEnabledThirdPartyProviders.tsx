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
const web3Strategies = WEB3_PROVIDERS.map(p => p.strategy);

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

  // Filter out any OAuth strategies that are not yet known, they are not included in our types.
  const knownSocialProviderStrategies = socialProviderStrategies.filter(s => oauthStrategies.includes(s));
  const knownAuthenticatableSocialStrategies = authenticatableSocialStrategies.filter(s => oauthStrategies.includes(s));

  // Filter out any Web3 strategies that are not yet known, they are not included in our types.
  const knownWeb3Strategies = web3FirstFactors.filter(s => web3Strategies.includes(s));

  return {
    strategies: [...knownSocialProviderStrategies, ...knownWeb3Strategies],
    web3Strategies: knownWeb3Strategies,
    authenticatableOauthStrategies: [...knownAuthenticatableSocialStrategies],
    strategyToDisplayData: strategyToDisplayData,
    providerToDisplayData: providerToDisplayData,
  };
};
