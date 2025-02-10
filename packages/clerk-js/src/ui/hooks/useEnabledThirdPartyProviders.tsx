import { iconImageUrl } from '@clerk/shared/constants';
import { OAUTH_PROVIDERS } from '@clerk/shared/oauth';
import { WEB3_PROVIDERS } from '@clerk/shared/web3';
import type { OAuthProvider, OAuthStrategy, Web3Provider, Web3Strategy } from '@clerk/types';

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

  // Get all custom OAuth providers
  const allCustomOAuthProviders = Object.keys(social).filter(s => s.startsWith('oauth_custom_')) as OAuthStrategy[];

  // Get all active custom social providers
  const activeCustomSocialStrategies = socialProviderStrategies.filter(
    s => !oauthStrategies.includes(s) || s.startsWith('oauth_custom_'),
  );

  allCustomOAuthProviders.forEach(s => {
    const providerName = s.replace('oauth_', '') as OAuthProvider;
    providerToDisplayData[providerName] = {
      strategy: s,
      name: social[s].name,
      iconUrl: social[s].logo_url || '',
    };
  });

  activeCustomSocialStrategies.forEach(s => {
    const providerId = s.replace('oauth_', '') as OAuthProvider;
    strategyToDisplayData[s] = {
      id: providerId,
      iconUrl: social[s].logo_url || '',
      name: social[s].name,
    };
  });

  const authenticatableOauthStrategies = [
    ...knownAuthenticatableSocialStrategies,
    ...customAuthenticatableSocialStrategies,
  ];

  // Sort the authenticatableOauthStrategies by name
  authenticatableOauthStrategies.sort((a, b) => {
    const aName = a.replace(/^oauth_custom_|^oauth_/, '');
    const bName = b.replace(/^oauth_custom_|^oauth_/, '');
    return aName.localeCompare(bName);
  });

  // Filter out any Web3 strategies that are not yet known, they are not included in our types.
  const knownWeb3Strategies = web3FirstFactors.filter(s => web3Strategies.includes(s));

  return {
    strategies: [...knownSocialProviderStrategies, ...knownWeb3Strategies, ...customSocialProviderStrategies],
    web3Strategies: knownWeb3Strategies,
    authenticatableOauthStrategies,
    strategyToDisplayData: strategyToDisplayData,
    providerToDisplayData: providerToDisplayData,
  };
};
