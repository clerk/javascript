import { OAuthProvider, OAuthStrategy } from '@clerk/types';
import { OAUTH_PROVIDERS } from '@clerk/types/src';

import { svgUrl } from '../../ui/common/constants';
import { useEnvironment } from '../../ui/contexts/EnvironmentContext';

type OauthStrategyToDataMap = {
  [k in OAuthStrategy]: { id: OAuthProvider; iconUrl: string; name: string };
};

const oauthStrategyToDataMap = Object.fromEntries(
  // TODO: This import shouldn't be part of @clerk/types
  OAUTH_PROVIDERS.map(p => {
    return [p.strategy, { id: p.provider, name: p.name, iconUrl: svgUrl(p.provider) }];
  }),
) as OauthStrategyToDataMap;

export const useEnabledOauthProviders = () => {
  const { socialProviderStrategies } = useEnvironment().userSettings;
  return { strategies: socialProviderStrategies, displayData: oauthStrategyToDataMap };
};
