// c.f. vendor/clerk-js/src/ui/hooks/useEnabledThirdPartyProviders.tsx [Modified]

import { iconImageUrl } from '@clerk/shared/constants';
import { OAUTH_PROVIDERS } from '@clerk/shared/oauth';
import type {
  EnterpriseSSOStrategy,
  EnvironmentResource,
  OAuthProvider,
  OAuthStrategy,
  SamlStrategy,
  Web3Provider,
  Web3Strategy,
} from '@clerk/shared/types';
import { WEB3_PROVIDERS } from '@clerk/shared/web3';

import { fromEntries } from './clerk-js';

export type ThirdPartyStrategy =
  | {
      id: Web3Strategy | OAuthStrategy;
      iconUrl: string;
      name: string;
    }
  | {
      strategy: SamlStrategy | EnterpriseSSOStrategy;
      iconUrl?: never;
      name: string;
    };

export type ThirdPartyProvider =
  | {
      strategy: Web3Strategy | OAuthStrategy;
      iconUrl: string;
      name: string;
    }
  | {
      strategy: SamlStrategy | EnterpriseSSOStrategy;
      iconUrl?: never;
      name: string;
    };

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

export const providerToDisplayData: ThirdPartyProviderToDataMap = fromEntries(
  [...OAUTH_PROVIDERS, ...WEB3_PROVIDERS].map(p => {
    return [p.provider, { iconUrl: iconImageUrl(p.provider), name: p.name, strategy: p.strategy }];
  }),
) as ThirdPartyProviderToDataMap;

const strategyToDisplayData: ThirdPartyStrategyToDataMap = fromEntries(
  [...OAUTH_PROVIDERS, ...WEB3_PROVIDERS].map(p => {
    return [p.strategy, { iconUrl: iconImageUrl(p.provider), id: p.provider, name: p.name }];
  }),
) as ThirdPartyStrategyToDataMap;

export function isSamlStrategy(strategy: any): strategy is SamlStrategy {
  return strategy === 'saml';
}

export function isEnterpriseSSOStrategy(strategy: any): strategy is EnterpriseSSOStrategy {
  return strategy === 'enterprise_sso';
}

export function isWeb3Strategy(
  strategy: any,
  available: EnabledThirdPartyProviders['web3Strategies'],
): strategy is Web3Strategy {
  return available.includes(strategy.startsWith('web3_') ? strategy : `web3_${strategy}_signature`);
}

export function isAuthenticatableOauthStrategy(
  strategy: any,
  available: EnabledThirdPartyProviders['authenticatableOauthStrategies'],
): strategy is OAuthStrategy {
  return available.includes(strategy.startsWith('oauth_') ? strategy : `oauth_${strategy}`);
}

const emptyThirdPartyProviders: EnabledThirdPartyProviders = {
  authenticatableOauthStrategies: [],
  providerToDisplayData: {} as any,
  strategies: [],
  strategyToDisplayData: {} as any,
  web3Strategies: [],
};

export const getEnabledThirdPartyProviders = (
  environment: EnvironmentResource | undefined | null,
): EnabledThirdPartyProviders => {
  if (!environment?.userSettings) {
    return emptyThirdPartyProviders;
  }

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
