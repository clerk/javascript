import type { Attribute } from '@clerk/shared/types';

import { useEnvironment } from '../contexts/EnvironmentContext';
import { useEnabledThirdPartyProviders } from './useEnabledThirdPartyProviders';

export const useTotalEnabledAuthMethods = (): number => {
  const { userSettings } = useEnvironment();
  const { authenticatableOauthStrategies, web3Strategies, alternativePhoneCodeChannels } =
    useEnabledThirdPartyProviders();

  const firstFactorCount = userSettings.enabledFirstFactorIdentifiers.filter(
    (attr: Attribute) => attr !== 'passkey',
  ).length;

  const oauthCount = authenticatableOauthStrategies.length;
  const web3Count = web3Strategies.length;
  const alternativePhoneCodeCount = alternativePhoneCodeChannels.length;

  const totalCount = firstFactorCount + oauthCount + web3Count + alternativePhoneCodeCount;

  return totalCount;
};
